import { computed, effect, inject, Injectable, signal } from '@angular/core';
import {
  arrayRemove, arrayUnion, collection, doc, DocumentData, onSnapshot, query, Unsubscribe, updateDoc, where,
} from 'firebase/firestore';
import { Channel } from '../../shared/models/channel.model';
import { User } from '../../shared/models/user.model';
import { MAX_DESCRIPTION_LENGTH } from '../../shared/utils/limits';
import { SessionService } from '../auth/session.service';
import { db } from '../firebase/firebase';
import { toChannel } from '../firebase/mappers';
import { reportError } from '../firebase/report-error';
import { createWithName, NameTakenError, renameWithName, reserveExistingName } from './channel-names';
import { UserService } from './user.service';

const MAX_NAME_LENGTH = 40;
const NOT_MEMBER = 'Nur Mitglieder können den Channel ändern.';
const NAME_TAKEN = 'Diesen Channel-Namen gibt es schon.';
/** Letters (also umlauts), digits, "-" and "_", starting with a letter or digit. The name is also a document ID. */
const NAME_PATTERN = /^[\p{L}\p{N}][\p{L}\p{N}_-]*$/u;
const SAVE_FAILED = 'Die Änderung konnte nicht gespeichert werden. Bitte versuche es erneut.';
const ERROR_VISIBLE_MS = 5000;

/** Responsible for channels and their members. Only channels the user is a member of are loaded. */
@Injectable({ providedIn: 'root' })
export class ChannelService {
  private readonly session = inject(SessionService);
  private readonly userService = inject(UserService);

  private readonly channelsState = signal<Channel[]>([]);
  readonly channels = this.channelsState.asReadonly();

  /** Same list as channels: Firestore only sends channels the user is a member of (sidebar). */
  readonly myChannels = computed(() => [...this.channels()].sort((a, b) => a.createdAt - b.createdAt));

  private unsubscribe: Unsubscribe | null = null;

  /** Message for the user when saving failed on the server, '' when everything is fine. */
  private readonly saveErrorState = signal('');
  readonly saveError = this.saveErrorState.asReadonly();
  private saveErrorTimer?: ReturnType<typeof setTimeout>;
  private readonly reserved = new Set<string>(); // channels whose name entry was already checked

  constructor() {
    effect(() => this.listen(this.session.currentUserId()));
  }

  /**
   * Finds one of the own channels.
   *
   * @param id - Channel ID
   * @returns The channel, or undefined
   */
  getById(id: string): Channel | undefined {
    return this.channels().find((channel) => channel.id === id);
  }

  /**
   * Turns the member IDs of a channel into full user objects.
   *
   * @param channelId - Channel ID
   * @returns The members as user objects
   */
  membersOf(channelId: string): User[] {
    const channel = this.getById(channelId);
    if (!channel) return [];
    return channel.memberIds
      .map((id) => this.userService.getById(id))
      .filter((user): user is User => user !== undefined);
  }

  /**
   * Error text for a channel name, or '' if it is fine. ignoreId: the channel being renamed.
   *
   * @param name - Name as typed
   * @param ignoreId - Channel being renamed, its own name is no duplicate
   * @returns Error text, or an empty string when the name is fine
   */
  validateName(name: string, ignoreId?: string): string {
    const cleanName = toChannelName(name);
    if (!cleanName) return 'Bitte gib einen Channel-Namen ein.';
    if (cleanName.length > MAX_NAME_LENGTH) return `Maximal ${MAX_NAME_LENGTH} Zeichen.`;
    if (!NAME_PATTERN.test(cleanName)) return 'Nur Buchstaben, Zahlen, - und _ sind erlaubt.';
    if (this.nameExists(cleanName, ignoreId)) return NAME_TAKEN;
    return '';
  }

  /**
   * Creates the channel with the current user and the chosen members. The server checks that the name is free.
   *
   * @param name - Name as typed
   * @param description - Optional description
   * @param memberIds - People to add, the creator is always added
   * @returns The new ID, or an error text
   */
  async create(name: string, description: string, memberIds: string[]): Promise<{ id?: string; error: string }> {
    const userId = this.session.currentUserId();
    const error = userId ? this.validateName(name) : 'Bitte melde dich erneut an.';
    if (error || !userId) return { error };
    const ref = doc(collection(db, 'channels'));
    const data = {
      name: toChannelName(name), description: description.trim().slice(0, MAX_DESCRIPTION_LENGTH),
      memberIds: [...new Set([userId, ...memberIds])], createdBy: userId,
    };
    const saveError = await this.save(createWithName(ref, data), 'Channel erstellen');
    return saveError ? { error: saveError } : { id: ref.id, error: '' };
  }

  /**
   * Returns an error text, or '' when the new name was saved. Only members may edit.
   *
   * @param id - Channel ID
   * @param name - New name as typed
   * @returns Error text, or an empty string when saved
   */
  async rename(id: string, name: string): Promise<string> {
    const channel = this.getById(id);
    const error = channel && this.isMember(id) ? this.validateName(name, id) : NOT_MEMBER;
    if (error || !channel) return error;
    return this.save(renameWithName(id, channel.name, toChannelName(name)), 'Channel umbenennen');
  }

  /**
   * Changes the description.
   *
   * @param id - Channel ID
   * @param description - New description
   * @returns Error text, or an empty string
   */
  updateDescription(id: string, description: string): string {
    if (!this.isMember(id)) return NOT_MEMBER;
    this.patch(id, { description: description.trim().slice(0, MAX_DESCRIPTION_LENGTH) });
    return '';
  }

  /**
   * Every member may add other users (user story "Management von Channels" 2).
   *
   * @param id - Channel ID
   * @param userIds - People to add
   */
  addMembers(id: string, userIds: string[]): void {
    if (this.isMember(id) && userIds.length) this.patch(id, { memberIds: arrayUnion(...userIds) });
  }

  /**
   * Removes the current user from the channel.
   * * @param id - Channel ID
   *
   * @param id - Channel ID
   */
  leave(id: string): void {
    const userId = this.session.currentUserId();
    if (userId && this.isMember(id)) this.patch(id, { memberIds: arrayRemove(userId) });
  }

  /**
   * Checks the membership of the current user.
   *
   * @param id - Channel ID
   * @returns true when the current user is a member
   */
  isMember(id: string): boolean {
    const userId = this.session.currentUserId();
    return !!userId && !!this.getById(id)?.memberIds.includes(userId);
  }

  /**
   * Duplicate check ignores upper/lower case: "Entwicklerteam" = "entwicklerteam".
   *
   * @param name - Cleaned name
   * @param ignoreId - Channel to skip (the one being renamed)
   * @returns true when one of the own channels already has the name
   */
  private nameExists(name: string, ignoreId?: string): boolean {
    const lower = name.toLowerCase();
    return this.channels().some((channel) => channel.id !== ignoreId && channel.name.toLowerCase() === lower);
  }

  /**
   * Waits for the server: '' when saved, otherwise the text for the user.
   *
   * @param request - The running save
   * @param context - Short label for the console
   * @returns Empty string when saved, otherwise the text for the user
   */
  private async save(request: Promise<void>, context: string): Promise<string> {
    try {
      await request;
      return '';
    } catch (error) {
      if (error instanceof NameTakenError) return NAME_TAKEN;
      reportError(context, error);
      return SAVE_FAILED;
    }
  }

  /**
   * Channels from before the name list get their entry once. Taken or offline: nothing to do.
   * * @param channels - The channels from the latest snapshot
   *
   * @param channels - The channels from the latest snapshot
   */
  private reserveNames(channels: Channel[]): void {
    for (const channel of channels) {
      if (this.reserved.has(channel.id) || !NAME_PATTERN.test(channel.name)) continue;
      this.reserved.add(channel.id);
      reserveExistingName(channel.id, channel.name).catch(() => undefined);
    }
  }

  /**
   * Updates fields of a channel.
   *
   * @param id - Channel ID
   * @param changes - Fields to change
   */
  private patch(id: string, changes: DocumentData): void {
    this.write(updateDoc(doc(db, 'channels', id), changes), 'Channel ändern');
  }

  /**
   * The screen changes at once, Firestore saves in the background. If the server refuses, the user is told.
   *
   * @param request - The running Firestore write
   * @param context - Short label for the console
   */
  private write(request: Promise<void>, context: string): void {
    request.catch((error) => {
      reportError(context, error);
      this.showSaveError();
    });
  }

  private showSaveError(): void {
    this.saveErrorState.set(SAVE_FAILED);
    clearTimeout(this.saveErrorTimer);
    this.saveErrorTimer = setTimeout(() => this.saveErrorState.set(''), ERROR_VISIBLE_MS);
  }

  /**
   * Live list of the user's channels: only channels whose memberIds contain the user.
   * * @param userId - Current user, null after logout
   *
   * @param userId - Current user, null after logout
   */
  private listen(userId: string | null): void {
    this.unsubscribe?.();
    this.unsubscribe = null;
    this.channelsState.set([]);
    this.reserved.clear(); // a different user checks the names of his own channels again
    if (!userId) return;
    const mine = query(collection(db, 'channels'), where('memberIds', 'array-contains', userId));
    this.unsubscribe = onSnapshot(mine,
      (snapshot) => {
        this.channelsState.set(snapshot.docs.map(toChannel));
        this.reserveNames(this.channels());
      },
      (error) => reportError('Channels laden', error));
  }
}

/**
 * "  Office team " to "Office-team" (a leading "#" is removed, the UI adds it).
 *
 * @param name - Name as typed
 * @returns Trimmed name with "-" instead of spaces, without a leading "#"
 */
export function toChannelName(name: string): string {
  return name.trim().replace(/^#+/, '').trim().replace(/\s+/g, '-');
}
