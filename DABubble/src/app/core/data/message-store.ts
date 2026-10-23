import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { collection, FirestoreError, onSnapshot, query, Unsubscribe, where } from 'firebase/firestore';
import { Message } from '../../shared/models/message.model';
import { SessionService } from '../auth/session.service';
import { db } from '../firebase/firebase';
import { ListenerSet } from '../firebase/listener-set';
import { MessageLocation, toMessage } from '../firebase/mappers';
import { reportError } from '../firebase/report-error';
import { ChannelService } from './channel.service';

/**
 * Path of the place a message lives in, e.g. "channels/abc" or "directChats/dm_u1_u2".
 *
 * @param location - Channel or direct chat
 * @returns e.g. "channels/abc" or "directChats/dm_u1_u2"
 */
export function locationPath(location: MessageLocation): string {
  return location.channelId ? `channels/${location.channelId}` : `directChats/${location.directChatId}`;
}

/** A new channel may not be saved on the server yet. Then the first read is denied and tried again. */
const RETRY_DELAY_MS = 1000;
const MAX_RETRIES = 5;

/** Loads messages live from Firestore: one listener per own channel and per own direct chat. */
@Injectable({ providedIn: 'root' })
export class MessageStore {
  private readonly session = inject(SessionService);
  private readonly channelService = inject(ChannelService);

  private readonly byPath = signal<Record<string, Message[]>>({});
  readonly messages = computed(() => Object.values(this.byPath()).flat());

  /** IDs of the direct chats the user takes part in. */
  readonly chatIds = signal<string[]>([]);

  private readonly listeners = new ListenerSet();
  private readonly retries = new Map<string, number>();
  private chatsUnsubscribe: Unsubscribe | null = null;

  constructor() {
    effect(() => this.listenToChats(this.session.currentUserId()));
    effect(() => this.syncListeners(this.paths()));
  }

  /**
   * Every place the user may read: own channels and own direct chats.
   * * @returns Paths of all own channels and direct chats
   *
   * @returns Paths of all own channels and direct chats
   */
  private paths(): string[] {
    const channels = this.channelService.myChannels().map((channel) => `channels/${channel.id}`);
    return [...channels, ...this.chatIds().map((id) => `directChats/${id}`)];
  }

  /**
   * Opens and closes the message listeners.
   * * @param paths - Places that should be listened to
   *
   * @param paths - Places that should be listened to
   */
  private syncListeners(paths: string[]): void {
    this.listeners.sync(paths, (path) => this.open(path));
    this.byPath.update((all) => Object.fromEntries(Object.entries(all).filter(([path]) => paths.includes(path))));
  }

  /**
   * Opens the live listener of one place.
   *
   * @param path - Channel or direct chat path
   * @returns Function that closes the listener
   */
  private open(path: string): Unsubscribe {
    const location = toLocation(path);
    return onSnapshot(collection(db, path, 'messages'),
      (snapshot) => {
        this.retries.delete(path);
        this.byPath.update((all) => ({ ...all, [path]: snapshot.docs.map((d) => toMessage(d, location)) }));
      },
      (error) => this.onListenError(path, error));
  }

  /**
   * Denied right after creating a channel: the channel is not on the server yet. Try again shortly.
   *
   * @param path - Path of the failed listener
   * @param error - Error from Firestore
   */
  private onListenError(path: string, error: FirestoreError): void {
    const attempt = this.retries.get(path) ?? 0;
    if (error.code !== 'permission-denied' || attempt >= MAX_RETRIES) {
      this.retries.delete(path);
      return reportError('Nachrichten laden', error);
    }
    this.retries.set(path, attempt + 1);
    setTimeout(() => this.listeners.reopen(path, (key) => this.open(key)), RETRY_DELAY_MS);
  }

  /**
   * Listens to the direct chats of the user.
   * * @param userId - Current user, null after logout
   *
   * @param userId - Current user, null after logout
   */
  private listenToChats(userId: string | null): void {
    this.chatsUnsubscribe?.();
    this.chatsUnsubscribe = null;
    this.chatIds.set([]);
    if (!userId) return this.listeners.closeAll();
    const mine = query(collection(db, 'directChats'), where('participants', 'array-contains', userId));
    this.chatsUnsubscribe = onSnapshot(mine,
      (snapshot) => this.chatIds.set(snapshot.docs.map((d) => d.id)),
      (error) => reportError('Direktnachrichten laden', error));
  }
}

/**
 * Turns a path back into a location.
 *
 * @param path - e.g. "channels/abc"
 * @returns Location with channelId or directChatId
 */
function toLocation(path: string): MessageLocation {
  const [kind, id] = path.split('/');
  return kind === 'channels' ? { channelId: id } : { directChatId: id };
}
