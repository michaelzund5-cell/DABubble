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

/** After saving, the guess is kept a little longer, so the screen does not flicker until Firestore's update arrives. */
const CONFIRM_DELAY_MS = 2000;

/** Responsible for messages, thread replies and reactions. Loading happens in MessageStore. */
@Injectable({ providedIn: 'root' })
export class MessageService {
  private readonly session = inject(SessionService);
  private readonly store = inject(MessageStore);

  /**
   * Reactions that are shown already but not confirmed by the server yet so the screen reacts at once.
   * base: the reactions from Firestore at the time of the click. As soon as Firestore sends something else,
   * the real data wins again.
   */
  private readonly pendingReactions = signal<Record<string, { base: Reaction[]; next: Reaction[] }>>({});

  readonly messages = computed(() => {
    const pending = this.pendingReactions();
    return this.store.messages().map((message) => {
      const guess = pending[message.id];
      return guess && sameReactions(guess.base, message.reactions) ? { ...message, reactions: guess.next } : message;
    });
  });

  /** The two emojis used last (user story 2). Defaults until the user has reacted. */
  private readonly recentEmojis = signal<string[]>([]);
  readonly quickEmojis = computed(() =>
    [...this.recentEmojis(), ...DEFAULT_QUICK_EMOJIS.filter((id) => !this.recentEmojis().includes(id))].slice(0, 2));

  /**
   * Finds a loaded message.
   *
   * @param id - Message ID
   * @returns The message, or undefined
   */
  getById(id: string): Message | undefined {
    return this.messages().find((message) => message.id === id);
  }

  /**
   * Top-level messages (no thread replies) of a channel or direct chat, oldest first.
   *
   * @param view - Open channel or direct chat
   * @returns Messages without thread replies, oldest first
   */
  messagesFor(view: ActiveView): Message[] {
    const location = this.locationOf(view);
    if (!location) return [];
    const path = locationPath(location);
    return this.messages()
      .filter((message) => !message.threadId && locationPath(message) === path)
      .sort((a, b) => a.createdAt - b.createdAt);
  }

  /**
   * All replies of one thread, oldest first.
   *
   * @param rootId - ID of the message that started the thread
   * @returns Replies, oldest first
   */
  repliesOf(rootId: string): Message[] {
    return this.messages()
      .filter((message) => message.threadId === rootId)
      .sort((a, b) => a.createdAt - b.createdAt);
  }

  /**
   * Sends a new message.
   *
   * @param text - Message text
   * @param view - Channel or direct chat to send to
   */
  send(text: string, view: ActiveView): void {
    const cleanText = cleanMessage(text);
    const location = this.locationOf(view);
    if (!cleanText || !location) return;
    if (location.directChatId && view.type === 'direct') this.ensureDirectChat(location.directChatId, view.id);
    this.add(location, { text: cleanText });
  }

  /**
   * A reply is stored next to its root message, so it stays in the same channel or chat.
   *
   * @param rootId - ID of the message that started the thread
   * @param text - Reply text
   */
  reply(rootId: string, text: string): void {
    const cleanText = cleanMessage(text);
    const root = this.getById(rootId);
    if (!cleanText || !root) return;
    this.add(root, { text: cleanText, threadId: rootId });
  }

  /**
   * Returns false if the text is not valid or the message belongs to someone else.
   *
   * @param id - Message ID
   * @param text - New text
   * @returns false when the text is invalid or the message belongs to someone else
   */
  edit(id: string, text: string): boolean {
    const cleanText = cleanMessage(text);
    const message = this.getById(id);
    if (!cleanText || !message || !this.isOwnMessage(id)) return false;
    const ref = doc(db, locationPath(message), 'messages', id);
    updateDoc(ref, { text: cleanText, edited: true }).catch((error) => reportError('Nachricht bearbeiten', error));
    return true;
  }

  /**
   * Adds the current user's reaction, or removes it if it already exists (real toggle).
   * The change is visible at once, saving happens in the background.
   *
   * @param id - Message ID
   * @param emoji - Emoji ID, e.g. "rocket"
   */
  toggleReaction(id: string, emoji: string): void {
    const userId = this.session.currentUserId();
    const message = this.getById(id);
    if (!userId || !message || !emojiById(emoji)) return;
    this.rememberEmoji(emoji);
    this.showReactionNow(id, toggledReactions(message.reactions, emoji, userId));
    const ref = doc(db, locationPath(message), 'messages', id);
    /** Transaction: two people reacting at the same moment do not overwrite each other. */
    runTransaction(db, async (transaction) => {
      const current = ((await transaction.get(ref)).data()?.['reactions'] ?? []) as Reaction[];
      transaction.update(ref, { reactions: toggledReactions(current, emoji, userId) });
    }).then(() => setTimeout(() => this.forgetReaction(id), CONFIRM_DELAY_MS))
      .catch((error) => this.undoReaction(id, error));
  }

  /**
   * Checks the own reaction.
   *
   * @param reaction - One emoji with its users
   * @returns true when the current user is one of them
   */
  hasReacted(reaction: Reaction): boolean {
    const userId = this.session.currentUserId();
    return !!userId && reaction.userIds.includes(userId);
  }

  /**
   * Checks the sender.
   *
   * @param id - Message ID
   * @returns true when the current user wrote it
   */
  isOwnMessage(id: string): boolean {
    const message = this.getById(id);
    return !!message && message.senderId === this.session.currentUserId();
  }

  /**
   * Shows the new reactions before the server confirms them.
   *
   * @param id - Message ID
   * @param next - Reactions to show
   */
  private showReactionNow(id: string, next: Reaction[]): void {
    const base = this.store.messages().find((message) => message.id === id)?.reactions ?? [];
    this.pendingReactions.update((all) => ({ ...all, [id]: { base, next } }));
  }

  /**
   * Saving failed: drop the guess, the message shows the real reactions from Firestore again.
   *
   * @param id - Message ID
   * @param error - Error from Firestore
   */
  private undoReaction(id: string, error: unknown): void {
    reportError('Reaktion', error);
    this.forgetReaction(id);
  }

  /**
   * Drops the shown guess, the real data counts again.
   * * @param id - Message ID
   *
   * @param id - Message ID
   */
  private forgetReaction(id: string): void {
    this.pendingReactions.update(({ [id]: _done, ...rest }) => rest);
  }

  /**
   * Remembers the two most recent emojis for the quick bar.
   * * @param emoji - Emoji ID
   *
   * @param emoji - Emoji ID
   */
  private rememberEmoji(emoji: string): void {
    this.recentEmojis.update((list) => [emoji, ...list.filter((id) => id !== emoji)].slice(0, 2));
  }

  /**
   * Translates the active view into the place where its messages are stored.
   *
   * @param view - Active view
   * @returns The location, or null for "new message"
   */
  private locationOf(view: ActiveView): MessageLocation | null {
    if (view.type === 'channel') return { channelId: view.id };
    const userId = this.session.currentUserId();
    if (view.type === 'new' || !userId) return null;
    return { directChatId: directChatId(userId, view.id) };
  }

  /**
   * The first message of a direct chat creates the chat document, so the partner sees the conversation.
   *
   * @param chatId - ID like dm_uidA_uidB
   * @param partnerId - The other person
   */
  private ensureDirectChat(chatId: string, partnerId: string): void {
    const userId = this.session.currentUserId();
    if (!userId || this.store.chatIds().includes(chatId)) return;
    const participants = [...new Set([userId, partnerId])];
    setDoc(doc(db, 'directChats', chatId), { participants }).catch((error) => reportError('Chat anlegen', error));
  }

  /**
   * Saves a new message.
   *
   * @param location - Channel or direct chat
   * @param content - Text and optional thread ID
   */
  private add(location: MessageLocation, content: { text: string; threadId?: string }): void {
    const senderId = this.session.currentUserId();
    if (!senderId) return;
    const data = { ...content, senderId, createdAt: serverTimestamp(), reactions: [] };
    addDoc(collection(db, locationPath(location), 'messages'), data)
      .catch((error) => reportError('Nachricht senden', error));
  }
}

/**
 * Same emojis with the same people in the same order.
 *
 * @param a - First list
 * @param b - Second list
 * @returns true when both contain the same emojis and people
 */
function sameReactions(a: Reaction[], b: Reaction[]): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Trimmed text, or '' when it is empty or longer than allowed (the caller then does nothing).
 *
 * @param text - Text as typed
 * @returns Trimmed text, or an empty string when it is too long
 */
function cleanMessage(text: string): string {
  const clean = text.trim();
  return clean.length <= MAX_MESSAGE_LENGTH ? clean : '';
}

/**
 * Adds or removes the reaction of one user.
 *
 * @param reactions - Current reactions
 * @param emoji - Emoji ID
 * @param userId - Who reacts
 * @returns The new list, empty emojis are removed
 */
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
