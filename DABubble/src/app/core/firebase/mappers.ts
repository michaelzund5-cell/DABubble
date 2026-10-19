import { DocumentData, QueryDocumentSnapshot, Timestamp } from 'firebase/firestore';
import { DEFAULT_AVATAR } from '../../shared/models/avatars';
import { Channel } from '../../shared/models/channel.model';
import { Message, Reaction } from '../../shared/models/message.model';
import { User, UserStatus } from '../../shared/models/user.model';

type Snapshot = QueryDocumentSnapshot<DocumentData>;

// Where a message lives: in a channel or in a direct chat.
export interface MessageLocation {
  channelId?: string;
  directChatId?: string;
}

// Server timestamps are null for a moment while a write is pending: "estimate" fills in the local time.
function readData(snapshot: Snapshot): DocumentData {
  return snapshot.data({ serverTimestamps: 'estimate' });
}

function toMillis(value: unknown): number {
  return value instanceof Timestamp ? value.toMillis() : Date.now();
}

export function toUser(snapshot: Snapshot): User {
  const data = readData(snapshot);
  const name = String(data['name'] ?? 'Gast');
  const status: UserStatus = data['status'] === 'online' ? 'online' : 'offline';
  return { id: snapshot.id, name, email: String(data['email'] ?? ''), initials: toInitials(name), status,
    avatar: String(data['avatar'] ?? DEFAULT_AVATAR) };
}

export function toChannel(snapshot: Snapshot): Channel {
  const data = readData(snapshot);
  return {
    id: snapshot.id, name: String(data['name'] ?? ''), description: String(data['description'] ?? ''),
    memberIds: (data['memberIds'] ?? []) as string[], createdBy: String(data['createdBy'] ?? ''),
    createdAt: toMillis(data['createdAt']), isPublic: data['isPublic'] === true,
  };
}

export function toMessage(snapshot: Snapshot, location: MessageLocation): Message {
  const data = readData(snapshot);
  return {
    ...location, id: snapshot.id, senderId: String(data['senderId'] ?? ''), text: String(data['text'] ?? ''),
    createdAt: toMillis(data['createdAt']), threadId: data['threadId'] ?? undefined, edited: data['edited'] === true,
    reactions: (data['reactions'] ?? []) as Reaction[],
  };
}

// "Frederik Beck" -> "FB"
export function toInitials(name: string): string {
  return name.trim().split(/\s+/).map((part) => part[0] ?? '').slice(0, 2).join('').toUpperCase();
}

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Übersetzt Firestore-Dokumente in die Modelle der App (User, Channel,
 * Message).
 * - So kennt nur diese Datei das Format in der Datenbank. Die Components
 *   arbeiten weiter mit denselben Modellen wie vorher.
 * - Jedes Feld bekommt einen Ersatzwert (??), falls es fehlt. Kaputte
 *   oder fremde Daten bringen die App so nicht zum Absturz.
 * - String(...) erzwingt Text: Steht in der Datenbank etwas anderes,
 *   wird es nie als Code ausgeführt.
 * - Zeitstempel: Firestore liefert Timestamp-Objekte, die App rechnet in
 *   Millisekunden. 'estimate': Solange der Server die Zeit noch nicht
 *   gesetzt hat, wird die lokale Zeit genommen.
 * - Status: alles ausser "online" gilt als "offline".
 */
