import { inject, Injectable, signal } from '@angular/core';
import { Message, Reaction } from '../../shared/models/message.model';
import { ActiveView } from '../../shared/models/view.model';
import { directChatId } from '../../shared/utils/direct-chat-id';
import { SessionService } from '../auth/session.service';
import { DEMO_MESSAGES } from './demo-seed';

// Responsible for messages, thread replies and reactions.
@Injectable({ providedIn: 'root' })
export class MessageService {
  private readonly session = inject(SessionService);

  private readonly messagesState = signal<Message[]>(DEMO_MESSAGES);
  readonly messages = this.messagesState.asReadonly();

  getById(id: string): Message | undefined {
    return this.messages().find((message) => message.id === id);
  }

  // Top-level messages (no thread replies) of a channel or direct chat, oldest first.
  messagesFor(view: ActiveView): Message[] {
    const location = this.locationOf(view);
    if (!location) return [];
    return this.messages()
      .filter((message) => !message.threadId)
      .filter((message) => location.channelId
        ? message.channelId === location.channelId
        : message.directChatId === location.directChatId)
      .sort((a, b) => a.createdAt - b.createdAt);
  }

  // All replies of one thread, oldest first.
  repliesOf(rootId: string): Message[] {
    return this.messages()
      .filter((message) => message.threadId === rootId)
      .sort((a, b) => a.createdAt - b.createdAt);
  }

  send(text: string, view: ActiveView): void {
    const cleanText = text.trim();
    const senderId = this.session.currentUserId();
    const location = this.locationOf(view);
    if (!cleanText || !senderId || !location) return;
    this.add({ ...location, senderId, text: cleanText });
  }

  reply(rootId: string, text: string): void {
    const cleanText = text.trim();
    const senderId = this.session.currentUserId();
    const root = this.getById(rootId);
    if (!cleanText || !senderId || !root) return;
    // A reply inherits the location of its root message, so it stays in the same channel/chat.
    this.add({ channelId: root.channelId, directChatId: root.directChatId, threadId: rootId, senderId, text: cleanText });
  }

  // Returns false if the message does not exist or belongs to someone else.
  edit(id: string, text: string): boolean {
    const cleanText = text.trim();
    if (!cleanText || !this.isOwnMessage(id)) return false;
    this.messagesState.update((list) =>
      list.map((message) => message.id === id ? { ...message, text: cleanText, edited: true } : message));
    return true;
  }

  // Deletes the message and all its thread replies. Only the sender may delete.
  delete(id: string): boolean {
    if (!this.isOwnMessage(id)) return false;
    this.messagesState.update((list) => list.filter((message) => message.id !== id && message.threadId !== id));
    return true;
  }

  // Adds the current user's reaction, or removes it if it already exists (real toggle).
  toggleReaction(id: string, emoji: string): void {
    const userId = this.session.currentUserId();
    if (!userId) return;
    this.messagesState.update((list) => list.map((message) => {
      if (message.id !== id) return message;
      return { ...message, reactions: this.toggledReactions(message.reactions, emoji, userId) };
    }));
  }

  hasReacted(reaction: Reaction): boolean {
    const userId = this.session.currentUserId();
    return !!userId && reaction.userIds.includes(userId);
  }

  isOwnMessage(id: string): boolean {
    const message = this.getById(id);
    return !!message && message.senderId === this.session.currentUserId();
  }

  private toggledReactions(reactions: Reaction[], emoji: string, userId: string): Reaction[] {
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

  // Translates the active view into the fields stored on a message.
  private locationOf(view: ActiveView): { channelId?: string; directChatId?: string } | null {
    if (view.type === 'channel') return { channelId: view.id };
    const userId = this.session.currentUserId();
    return userId ? { directChatId: directChatId(userId, view.id) } : null;
  }

  private add(data: Omit<Message, 'id' | 'createdAt' | 'reactions'>): void {
    const message: Message = { ...data, id: crypto.randomUUID(), createdAt: Date.now(), reactions: [] };
    this.messagesState.update((list) => [...list, message]);
  }
}

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Der MessageService ist für Nachrichten, Threads und Reaktionen
 * zuständig.
 *
 * Lesen:
 * - messagesFor(): Gibt alle Hauptnachrichten des aktuellen Channels
 *   oder der Direktnachricht zurück. Thread-Antworten werden
 *   herausgefiltert (!message.threadId), weil sie nur im Thread-Panel
 *   erscheinen. sort() sortiert nach Zeitstempel, älteste zuerst.
 * - repliesOf(): Alle Antworten zu einer Nachricht.
 *
 * Schreiben:
 * - send(): Neue Nachricht im aktuellen Channel oder Chat.
 * - reply(): Neue Thread-Antwort. Sie übernimmt Channel bzw. Chat der
 *   Ursprungsnachricht und bekommt deren ID als threadId.
 * - edit() und delete(): Prüfen zuerst mit isOwnMessage(), ob die
 *   Nachricht dem eingeloggten Benutzer gehört. Vorher hat nur das
 *   HTML die Buttons versteckt, der Service selbst hätte jede Nachricht
 *   gelöscht. delete() entfernt auch alle Thread-Antworten.
 *   Hinweis: Diese Prüfung im Browser ist nur die zweite Sicherung.
 *   Die echte Sicherheit kommt später durch die Zugriffsregeln der
 *   Datenbank.
 *
 * Reaktionen (Fehler behoben):
 * - toggleReaction(): Echtes Umschalten. Hat man schon reagiert, wird
 *   die eigene Reaktion entfernt, sonst hinzugefügt. Ist niemand mehr
 *   übrig, verschwindet das Emoji ganz. Vorher wurde nur hochgezählt.
 * - hasReacted(): Prüft, ob ich selbst reagiert habe, damit die
 *   Oberfläche meine Reaktion hervorheben kann.
 *
 * Private Hilfsmethoden (nur innerhalb des Services nutzbar):
 * - locationOf(): Übersetzt die aktive Ansicht in channelId oder
 *   directChatId.
 * - add(): Ergänzt ID, Zeitstempel und leere Reaktionen und fügt die
 *   Nachricht hinzu. Omit<Message, ...> ist ein Utility Type: der Typ
 *   Message ohne die genannten Felder, weil add() diese selbst setzt.
 *
 * Syntax-Hinweise:
 * - !! wandelt einen Wert in true/false um.
 * - { ...message, text } kopiert ein Objekt und überschreibt einzelne
 *   Felder. So bleibt das Original unverändert (Immutability).
 */
