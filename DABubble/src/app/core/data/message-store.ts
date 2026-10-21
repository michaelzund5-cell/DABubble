import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { collection, FirestoreError, onSnapshot, query, Unsubscribe, where } from 'firebase/firestore';
import { Message } from '../../shared/models/message.model';
import { SessionService } from '../auth/session.service';
import { db } from '../firebase/firebase';
import { ListenerSet } from '../firebase/listener-set';
import { MessageLocation, toMessage } from '../firebase/mappers';
import { reportError } from '../firebase/report-error';
import { ChannelService } from './channel.service';

// Path of the place a message lives in, e.g. "channels/abc" or "directChats/dm_u1_u2".
export function locationPath(location: MessageLocation): string {
  return location.channelId ? `channels/${location.channelId}` : `directChats/${location.directChatId}`;
}

// A new channel may not be saved on the server yet. Then the first read is denied and tried again.
const RETRY_DELAY_MS = 1000;
const MAX_RETRIES = 5;

// Loads messages live from Firestore: one listener per own channel and per own direct chat.
@Injectable({ providedIn: 'root' })
export class MessageStore {
  private readonly session = inject(SessionService);
  private readonly channelService = inject(ChannelService);

  private readonly byPath = signal<Record<string, Message[]>>({});
  readonly messages = computed(() => Object.values(this.byPath()).flat());

  // IDs of the direct chats the user takes part in.
  readonly chatIds = signal<string[]>([]);

  private readonly listeners = new ListenerSet();
  private readonly retries = new Map<string, number>();
  private chatsUnsubscribe: Unsubscribe | null = null;

  constructor() {
    effect(() => this.listenToChats(this.session.currentUserId()));
    effect(() => this.syncListeners(this.paths()));
  }

  // Every place the user may read: own channels and own direct chats.
  private paths(): string[] {
    const channels = this.channelService.myChannels().map((channel) => `channels/${channel.id}`);
    return [...channels, ...this.chatIds().map((id) => `directChats/${id}`)];
  }

  private syncListeners(paths: string[]): void {
    this.listeners.sync(paths, (path) => this.open(path));
    this.byPath.update((all) => Object.fromEntries(Object.entries(all).filter(([path]) => paths.includes(path))));
  }

  private open(path: string): Unsubscribe {
    const location = toLocation(path);
    return onSnapshot(collection(db, path, 'messages'),
      (snapshot) => {
        this.retries.delete(path);
        this.byPath.update((all) => ({ ...all, [path]: snapshot.docs.map((d) => toMessage(d, location)) }));
      },
      (error) => this.onListenError(path, error));
  }

  // Denied right after creating a channel: the channel is not on the server yet. Try again shortly.
  private onListenError(path: string, error: FirestoreError): void {
    const attempt = this.retries.get(path) ?? 0;
    if (error.code !== 'permission-denied' || attempt >= MAX_RETRIES) {
      this.retries.delete(path);
      return reportError('Nachrichten laden', error);
    }
    this.retries.set(path, attempt + 1);
    setTimeout(() => this.listeners.reopen(path, (key) => this.open(key)), RETRY_DELAY_MS);
  }

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

function toLocation(path: string): MessageLocation {
  const [kind, id] = path.split('/');
  return kind === 'channels' ? { channelId: id } : { directChatId: id };
}

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Lädt die Nachrichten live aus Firestore.
 * - Aufbau in der Datenbank: Jeder Channel und jede Direktnachricht hat
 *   eine eigene Untersammlung "messages", z. B.
 *   channels/{id}/messages oder directChats/dm_A_B/messages.
 *   Thread-Antworten liegen in derselben Untersammlung (mit threadId).
 * - Pro Channel und pro Direktnachricht gibt es einen Listener. Nur
 *   Orte, zu denen du gehörst, werden geladen. Die Regeln auf dem
 *   Server erlauben auch nichts anderes.
 * - chatIds: deine Direktnachrichten (directChats, in denen deine ID
 *   in "participants" steht).
 * - syncListeners(): Kommt ein Channel dazu, öffnet sich ein Listener.
 *   Verlässt du einen Channel, wird er geschlossen und seine
 *   Nachrichten verschwinden aus dem Speicher.
 * - byPath: Nachrichten pro Ort. messages: alle zusammen, für Chat,
 *   Thread und Suche.
 * - onListenError(): Wer einen Channel erstellt, sieht ihn sofort, der
 *   Server kennt ihn aber erst einen Moment später. Die erste Abfrage der
 *   Nachrichten wird darum von den Regeln abgelehnt. Dann wird sie nach
 *   1 Sekunde wiederholt (höchstens 5 Mal). Erst wenn alle Versuche
 *   scheitern, kommt eine Meldung in die Konsole.
 * - Beim Logout werden alle Listener geschlossen.
 */
