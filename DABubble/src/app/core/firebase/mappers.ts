import { DocumentData, QueryDocumentSnapshot, Timestamp } from 'firebase/firestore';
import { DEFAULT_AVATAR } from '../../shared/models/avatars';
import { Channel } from '../../shared/models/channel.model';
import { Message, Reaction } from '../../shared/models/message.model';
import { User, UserStatus } from '../../shared/models/user.model';

type Snapshot = QueryDocumentSnapshot<DocumentData>;

/** Where a message lives: in a channel or in a direct chat. */
export interface MessageLocation {
  channelId?: string;
  directChatId?: string;
}

/**
 * Server timestamps are null for a moment while a write is pending: "estimate" fills in the local time.
 *
 * @param snapshot - Firestore document
 * @returns Its data, server times estimated while pending
 */
function readData(snapshot: Snapshot): DocumentData {
  return snapshot.data({ serverTimestamps: 'estimate' });
}

/**
 * Converts a Firestore timestamp.
 *
 * @param value - Timestamp or anything else
 * @returns Milliseconds, the current time when it is no timestamp
 */
function toMillis(value: unknown): number {
  return value instanceof Timestamp ? value.toMillis() : Date.now();
}

/**
 * Converts a user document.
 *
 * @param snapshot - Document from "users"
 * @returns The user
 */
export function toUser(snapshot: Snapshot): User {
  const data = readData(snapshot);
  const name = String(data['name'] ?? 'Gast');
  const status: UserStatus = data['status'] === 'online' ? 'online' : 'offline';
  const lastActive = data['lastActive'] ? toMillis(data['lastActive']) : 0;
  return { id: snapshot.id, name, email: String(data['email'] ?? ''), initials: toInitials(name), status,
    avatar: String(data['avatar'] ?? DEFAULT_AVATAR), lastActive };
}

/**
 * Converts a channel document.
 *
 * @param snapshot - Document from "channels"
 * @returns The channel
 */
export function toChannel(snapshot: Snapshot): Channel {
  const data = readData(snapshot);
  return {
    id: snapshot.id, name: String(data['name'] ?? ''), description: String(data['description'] ?? ''),
    memberIds: (data['memberIds'] ?? []) as string[], createdBy: String(data['createdBy'] ?? ''),
    createdAt: toMillis(data['createdAt']), isPublic: data['isPublic'] === true,
  };
}

/**
 * Converts a message document.
 *
 * @param snapshot - Document from a "messages" collection
 * @param location - Channel or direct chat it belongs to
 * @returns The message
 */
export function toMessage(snapshot: Snapshot, location: MessageLocation): Message {
  const data = readData(snapshot);
  return {
    ...location, id: snapshot.id, senderId: String(data['senderId'] ?? ''), text: String(data['text'] ?? ''),
    createdAt: toMillis(data['createdAt']), threadId: data['threadId'] ?? undefined, edited: data['edited'] === true,
    reactions: (data['reactions'] ?? []) as Reaction[],
  };
}

/**
 * "Frederik Beck" to "FB"
 *
 * @param name - Full name
 * @returns Up to two initials, e.g. "MZ"
 */
export function toInitials(name: string): string {
  return name.trim().split(/\s+/).map((part) => part[0] ?? '').slice(0, 2).join('').toUpperCase();
}
