import { computed, effect, inject, Injectable, signal } from '@angular/core';
import {
  arrayRemove, arrayUnion, collection, doc, DocumentData, onSnapshot, query, serverTimestamp, setDoc, Unsubscribe,
  updateDoc, where,
} from 'firebase/firestore';
import { Channel } from '../../shared/models/channel.model';
import { User } from '../../shared/models/user.model';
import { MAX_DESCRIPTION_LENGTH } from '../../shared/utils/limits';
import { SessionService } from '../auth/session.service';
import { db } from '../firebase/firebase';
import { toChannel } from '../firebase/mappers';
import { reportError } from '../firebase/report-error';
import { UserService } from './user.service';

const MAX_NAME_LENGTH = 40;
const NOT_MEMBER = 'Nur Mitglieder können den Channel ändern.';

// Responsible for channels and their members. Only channels the user is a member of are loaded.
@Injectable({ providedIn: 'root' })
export class ChannelService {
  private readonly session = inject(SessionService);
  private readonly userService = inject(UserService);

  private readonly channelsState = signal<Channel[]>([]);
  readonly channels = this.channelsState.asReadonly();

  // Same list as channels: Firestore only sends channels the user is a member of (sidebar).
  readonly myChannels = computed(() => [...this.channels()].sort((a, b) => a.createdAt - b.createdAt));

  private unsubscribe: Unsubscribe | null = null;

  constructor() {
    effect(() => this.listen(this.session.currentUserId()));
  }

  getById(id: string): Channel | undefined {
    return this.channels().find((channel) => channel.id === id);
  }

  // Turns the member IDs of a channel into full user objects.
  membersOf(channelId: string): User[] {
    const channel = this.getById(channelId);
    if (!channel) return [];
    return channel.memberIds
      .map((id) => this.userService.getById(id))
      .filter((user): user is User => user !== undefined);
  }

  // Error text for a channel name, or '' if it is fine. ignoreId: the channel being renamed.
  validateName(name: string, ignoreId?: string): string {
    const cleanName = toChannelName(name);
    if (!cleanName) return 'Bitte gib einen Channel-Namen ein.';
    if (cleanName.length > MAX_NAME_LENGTH) return `Maximal ${MAX_NAME_LENGTH} Zeichen.`;
    if (this.nameExists(cleanName, ignoreId)) return 'Diesen Channel-Namen gibt es schon.';
    return '';
  }

  // Creates the channel with the current user and the chosen members. Returns null if the name is not valid.
  create(name: string, description: string, memberIds: string[]): Channel | null {
    const userId = this.session.currentUserId();
    if (!userId || this.validateName(name)) return null;
    const ref = doc(collection(db, 'channels'));
    const data = {
      name: toChannelName(name), description: description.trim().slice(0, MAX_DESCRIPTION_LENGTH),
      memberIds: [...new Set([userId, ...memberIds])], createdBy: userId,
    };
    this.write(setDoc(ref, { ...data, createdAt: serverTimestamp() }), 'Channel erstellen');
    return { id: ref.id, ...data, createdAt: Date.now() };
  }

  // Returns an error text, or '' when the new name was saved. Only members may edit.
  rename(id: string, name: string): string {
    const error = this.isMember(id) ? this.validateName(name, id) : NOT_MEMBER;
    if (!error) this.patch(id, { name: toChannelName(name) });
    return error;
  }

  updateDescription(id: string, description: string): string {
    if (!this.isMember(id)) return NOT_MEMBER;
    this.patch(id, { description: description.trim().slice(0, MAX_DESCRIPTION_LENGTH) });
    return '';
  }

  // Every member may add other users (user story "Management von Channels" 2).
  addMembers(id: string, userIds: string[]): void {
    if (this.isMember(id) && userIds.length) this.patch(id, { memberIds: arrayUnion(...userIds) });
  }

  leave(id: string): void {
    const userId = this.session.currentUserId();
    if (userId && this.isMember(id)) this.patch(id, { memberIds: arrayRemove(userId) });
  }

  isMember(id: string): boolean {
    const userId = this.session.currentUserId();
    return !!userId && !!this.getById(id)?.memberIds.includes(userId);
  }

  // Duplicate check ignores upper/lower case: "Entwicklerteam" = "entwicklerteam".
  private nameExists(name: string, ignoreId?: string): boolean {
    const lower = name.toLowerCase();
    return this.channels().some((channel) => channel.id !== ignoreId && channel.name.toLowerCase() === lower);
  }

  private patch(id: string, changes: DocumentData): void {
    this.write(updateDoc(doc(db, 'channels', id), changes), 'Channel ändern');
  }

  private write(request: Promise<void>, context: string): void {
    request.catch((error) => reportError(context, error));
  }

  // Live list of the user's channels: only channels whose memberIds contain the user.
  private listen(userId: string | null): void {
    this.unsubscribe?.();
    this.unsubscribe = null;
    this.channelsState.set([]);
    if (!userId) return;
    const mine = query(collection(db, 'channels'), where('memberIds', 'array-contains', userId));
    this.unsubscribe = onSnapshot(mine,
      (snapshot) => this.channelsState.set(snapshot.docs.map(toChannel)),
      (error) => reportError('Channels laden', error));
  }
}

// "  Office team " -> "Office-team" (a leading "#" is removed, the UI adds it).
export function toChannelName(name: string): string {
  return name.trim().replace(/^#+/, '').trim().replace(/\s+/g, '-');
}

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Der ChannelService ist für Channels zuständig, jetzt mit Firestore
 * (Sammlung "channels").
 * - listen(): Live-Verbindung, aber nur zu Channels, in denen du
 *   Mitglied bist (where memberIds array-contains deine ID). Fremde
 *   Channels kommen gar nicht erst in den Browser. Die Regeln auf dem
 *   Server verlangen genau diese Einschränkung.
 * - myChannels: dieselben Channels, älteste zuerst (Sidebar).
 * - membersOf(): Wandelt die Mitglieder-IDs in Benutzer um. "user is
 *   User" ist ein Type Guard: Danach sind nur noch echte User im Array.
 * - validateName(): Prüft den Namen (leer, zu lang, doppelt). Doppelt
 *   wird nur unter deinen eigenen Channels erkannt, fremde sind nicht
 *   sichtbar.
 * - create(): Legt den Channel mit dir und den gewählten Personen in
 *   einem Schritt an. Die ID erzeugt Firestore (doc(collection(...))).
 *   createdAt setzt der Server (serverTimestamp), nicht der Browser.
 * - rename() / updateDescription(): Gibt einen Fehlertext zurück, damit
 *   die Oberfläche ihn anzeigen kann.
 * - addMembers() / leave(): arrayUnion / arrayRemove ändern nur die
 *   betroffenen IDs. Gleichzeitige Änderungen von zwei Personen
 *   überschreiben sich so nicht gegenseitig.
 * - write(): Fehler beim Speichern landen in reportError(). Die
 *   Anzeige ändert sich sofort, Firestore speichert im Hintergrund.
 * - toChannelName(): "Office team" wird zu "Office-team".
 * - Beschreibung höchstens 500 Zeichen, Name höchstens 40. Die
 *   Firestore-Regeln prüfen dasselbe noch einmal auf dem Server.
 */
