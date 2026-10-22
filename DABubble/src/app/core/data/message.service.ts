import { computed, inject, Injectable, signal } from '@angular/core';
import { addDoc, collection, doc, runTransaction, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { DEFAULT_QUICK_EMOJIS, emojiById } from '../../shared/models/emojis';
import { Message, Reaction } from '../../shared/models/message.model';
import { ActiveView } from '../../shared/models/view.model';
import { directChatId } from '../../shared/utils/direct-chat-id';
import { MAX_MESSAGE_LENGTH } from '../../shared/utils/limits';
import { SessionService } from '../auth/session.service';
import { db } from '../firebase/firebase';
import { MessageLocation } from '../firebase/mappers';
import { reportError } from '../firebase/report-error';
import { locationPath, MessageStore } from './message-store';

// After saving, the guess is kept a little longer, so the screen does not flicker until Firestore's update arrives.
const CONFIRM_DELAY_MS = 2000;

// Responsible for messages, thread replies and reactions. Loading happens in MessageStore.
@Injectable({ providedIn: 'root' })
export class MessageService {
  private readonly session = inject(SessionService);
  private readonly store = inject(MessageStore);

  // Reactions that are shown already but not confirmed by the server yet (feedback: show them at once).
  // base: the reactions from Firestore at the time of the click. As soon as Firestore sends something else,
  // the real data wins again.
  private readonly pendingReactions = signal<Record<string, { base: Reaction[]; next: Reaction[] }>>({});

  readonly messages = computed(() => {
    const pending = this.pendingReactions();
    return this.store.messages().map((message) => {
      const guess = pending[message.id];
      return guess && sameReactions(guess.base, message.reactions) ? { ...message, reactions: guess.next } : message;
    });
  });

  // The two emojis used last (user story 2). Defaults until the user has reacted.
  private readonly recentEmojis = signal<string[]>([]);
  readonly quickEmojis = computed(() =>
    [...this.recentEmojis(), ...DEFAULT_QUICK_EMOJIS.filter((id) => !this.recentEmojis().includes(id))].slice(0, 2));

  getById(id: string): Message | undefined {
    return this.messages().find((message) => message.id === id);
  }

  // Top-level messages (no thread replies) of a channel or direct chat, oldest first.
  messagesFor(view: ActiveView): Message[] {
    const location = this.locationOf(view);
    if (!location) return [];
    const path = locationPath(location);
    return this.messages()
      .filter((message) => !message.threadId && locationPath(message) === path)
      .sort((a, b) => a.createdAt - b.createdAt);
  }

  // All replies of one thread, oldest first.
  repliesOf(rootId: string): Message[] {
    return this.messages()
      .filter((message) => message.threadId === rootId)
      .sort((a, b) => a.createdAt - b.createdAt);
  }

  send(text: string, view: ActiveView): void {
    const cleanText = cleanMessage(text);
    const location = this.locationOf(view);
    if (!cleanText || !location) return;
    if (location.directChatId && view.type === 'direct') this.ensureDirectChat(location.directChatId, view.id);
    this.add(location, { text: cleanText });
  }

  // A reply is stored next to its root message, so it stays in the same channel or chat.
  reply(rootId: string, text: string): void {
    const cleanText = cleanMessage(text);
    const root = this.getById(rootId);
    if (!cleanText || !root) return;
    this.add(root, { text: cleanText, threadId: rootId });
  }

  // Returns false if the text is not valid or the message belongs to someone else.
  edit(id: string, text: string): boolean {
    const cleanText = cleanMessage(text);
    const message = this.getById(id);
    if (!cleanText || !message || !this.isOwnMessage(id)) return false;
    const ref = doc(db, locationPath(message), 'messages', id);
    updateDoc(ref, { text: cleanText, edited: true }).catch((error) => reportError('Nachricht bearbeiten', error));
    return true;
  }

  // Adds the current user's reaction, or removes it if it already exists (real toggle).
  // The change is visible at once, saving happens in the background.
  toggleReaction(id: string, emoji: string): void {
    const userId = this.session.currentUserId();
    const message = this.getById(id);
    if (!userId || !message || !emojiById(emoji)) return;
    this.rememberEmoji(emoji);
    this.showReactionNow(id, toggledReactions(message.reactions, emoji, userId));
    const ref = doc(db, locationPath(message), 'messages', id);
    // Transaction: two people reacting at the same moment do not overwrite each other.
    runTransaction(db, async (transaction) => {
      const current = ((await transaction.get(ref)).data()?.['reactions'] ?? []) as Reaction[];
      transaction.update(ref, { reactions: toggledReactions(current, emoji, userId) });
    }).then(() => setTimeout(() => this.forgetReaction(id), CONFIRM_DELAY_MS))
      .catch((error) => this.undoReaction(id, error));
  }

  hasReacted(reaction: Reaction): boolean {
    const userId = this.session.currentUserId();
    return !!userId && reaction.userIds.includes(userId);
  }

  isOwnMessage(id: string): boolean {
    const message = this.getById(id);
    return !!message && message.senderId === this.session.currentUserId();
  }

  private showReactionNow(id: string, next: Reaction[]): void {
    const base = this.store.messages().find((message) => message.id === id)?.reactions ?? [];
    this.pendingReactions.update((all) => ({ ...all, [id]: { base, next } }));
  }

  // Saving failed: drop the guess, the message shows the real reactions from Firestore again.
  private undoReaction(id: string, error: unknown): void {
    reportError('Reaktion', error);
    this.forgetReaction(id);
  }

  private forgetReaction(id: string): void {
    this.pendingReactions.update(({ [id]: _done, ...rest }) => rest);
  }

  private rememberEmoji(emoji: string): void {
    this.recentEmojis.update((list) => [emoji, ...list.filter((id) => id !== emoji)].slice(0, 2));
  }

  // Translates the active view into the place where its messages are stored.
  private locationOf(view: ActiveView): MessageLocation | null {
    if (view.type === 'channel') return { channelId: view.id };
    const userId = this.session.currentUserId();
    if (view.type === 'new' || !userId) return null;
    return { directChatId: directChatId(userId, view.id) };
  }

  // The first message of a direct chat creates the chat document, so the partner sees the conversation.
  private ensureDirectChat(chatId: string, partnerId: string): void {
    const userId = this.session.currentUserId();
    if (!userId || this.store.chatIds().includes(chatId)) return;
    const participants = [...new Set([userId, partnerId])];
    setDoc(doc(db, 'directChats', chatId), { participants }).catch((error) => reportError('Chat anlegen', error));
  }

  private add(location: MessageLocation, content: { text: string; threadId?: string }): void {
    const senderId = this.session.currentUserId();
    if (!senderId) return;
    const data = { ...content, senderId, createdAt: serverTimestamp(), reactions: [] };
    addDoc(collection(db, locationPath(location), 'messages'), data)
      .catch((error) => reportError('Nachricht senden', error));
  }
}

// Same emojis with the same people in the same order.
function sameReactions(a: Reaction[], b: Reaction[]): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

// Trimmed text, or '' when it is empty or longer than allowed (the caller then does nothing).
function cleanMessage(text: string): string {
  const clean = text.trim();
  return clean.length <= MAX_MESSAGE_LENGTH ? clean : '';
}

function toggledReactions(reactions: Reaction[], emoji: string, userId: string): Reaction[] {
  const existing = reactions.find((reaction) => reaction.emoji === emoji);

  // Emoji not used yet: add a new reaction with only this user.
  if (!existing) return [...reactions, { emoji, userIds: [userId] }];

  const userIds = existing.userIds.includes(userId)
    ? existing.userIds.filter((id) => id !== userId) // already reacted -> remove
    : [...existing.userIds, userId];                  // not reacted yet -> add

  // Remove the reaction completely when nobody is left.
  return userIds.length
    ? reactions.map((reaction) => reaction.emoji === emoji ? { ...reaction, userIds } : reaction)
    : reactions.filter((reaction) => reaction.emoji !== emoji);
}

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Der MessageService ist für Nachrichten, Threads und Reaktionen
 * zuständig. Geladen werden sie im MessageStore (live aus Firestore),
 * hier steht, was man damit tun kann.
 *
 * Lesen:
 * - messagesFor(): alle Hauptnachrichten des offenen Channels oder der
 *   Direktnachricht, älteste zuerst. Thread-Antworten (threadId)
 *   erscheinen nur im Thread-Panel.
 * - repliesOf(): alle Antworten zu einer Nachricht.
 *
 * Schreiben:
 * - send(): neue Nachricht. Bei der ersten Direktnachricht wird auch das
 *   Chat-Dokument angelegt (ensureDirectChat), damit die andere Person
 *   die Unterhaltung sieht.
 * - reply(): Thread-Antwort, gespeichert beim Ort der Ursprungsnachricht.
 * - edit(): nur eigene Nachrichten (isOwnMessage). Die Firestore-Regeln
 *   prüfen das noch einmal auf dem Server.
 * - add(): createdAt setzt der Server (serverTimestamp). Ein Benutzer
 *   kann die Uhrzeit seiner Nachricht so nicht fälschen.
 * - Die Anzeige ändert sich sofort, Firestore speichert im Hintergrund.
 *   Fehler landen in reportError().
 *
 * Reaktionen:
 * - toggleReaction(): echtes Umschalten. Nur Emojis aus der Liste
 *   (emojiById). Läuft als Transaktion: Firestore liest den aktuellen
 *   Stand und schreibt in einem Schritt. Reagieren zwei Personen
 *   gleichzeitig, geht keine Reaktion verloren.
 * - toggledReactions(): berechnet die neue Liste. Ist niemand mehr
 *   übrig, verschwindet das Emoji ganz.
 * - Sofort sichtbar (Feedback): showReactionNow() merkt sich die neue
 *   Liste in pendingReactions. messages zeigt diese Liste, solange
 *   Firestore noch den alten Stand (base) hat. Kommt der neue Stand vom
 *   Server, gelten wieder die echten Daten. Nach dem Speichern wird der
 *   Eintrag nach 2 Sekunden entfernt (forgetReaction). Schlägt das
 *   Speichern fehl, verschwindet er sofort (undoReaction) und die
 *   Reaktion springt zurück.
 * - sameReactions(): vergleicht zwei Listen über ihren Inhalt.
 * - hasReacted(): hebt die eigene Reaktion hervor.
 *
 * Weiteres:
 * - quickEmojis / rememberEmoji(): die zwei zuletzt genutzten Emojis für
 *   die Schnellleiste (Standard: ✅ und 👍).
 * - cleanMessage(): entfernt Leerzeichen am Rand und lehnt Texte über
 *   4000 Zeichen ab (MAX_MESSAGE_LENGTH).
 * - Löschen von Nachrichten gibt es nicht, Figma sieht es nicht vor.
 */
