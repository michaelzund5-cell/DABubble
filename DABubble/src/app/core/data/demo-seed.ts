import { Channel } from '../../shared/models/channel.model';
import { Message } from '../../shared/models/message.model';
import { User } from '../../shared/models/user.model';
import { directChatId } from '../../shared/utils/direct-chat-id';

// DEMO ONLY: starting data until the real database is connected.
// When the backend exists, the services load this data from there and this file is deleted.

// Helper: timestamp for today at the given time.
function todayAt(hours: number, minutes: number): number {
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.getTime();
}

export const DEMO_USERS: User[] = [
  { id: 'u1', name: 'Michael', email: 'test@test.ch', initials: 'MZ', status: 'online' },
  { id: 'u2', name: 'Anna Keller', email: 'anna@dabubble.ch', initials: 'AK', status: 'online' },
  { id: 'u3', name: 'Lukas Frei', email: 'lukas@dabubble.ch', initials: 'LF', status: 'away' },
  { id: 'u4', name: 'Sofia Meier', email: 'sofia@dabubble.ch', initials: 'SM', status: 'online' },
];

export const DEMO_CHANNELS: Channel[] = [
  { id: 'c1', name: 'entwicklerteam', description: 'Austausch rund um Entwicklung und Technik.', memberIds: ['u1', 'u2', 'u3', 'u4'] },
  { id: 'c2', name: 'allgemein', description: 'Alles, was das gesamte Team betrifft.', memberIds: ['u1', 'u2', 'u3', 'u4'] },
  { id: 'c3', name: 'projektplanung', description: 'Planung, Aufgaben und Entscheidungen.', memberIds: ['u1', 'u2', 'u4'] },
];

export const DEMO_MESSAGES: Message[] = [
  { id: 'm1', channelId: 'c1', senderId: 'u2', createdAt: todayAt(8, 42),
    text: 'Guten Morgen! Ich habe den neuen Aufbau getestet. Sieht schon sehr sauber aus.',
    reactions: [{ emoji: '👍', userIds: ['u3', 'u4'] }] },
  // Thread reply: same channel, threadId points to the root message m1
  { id: 'm2', channelId: 'c1', threadId: 'm1', senderId: 'u3', createdAt: todayAt(8, 55),
    text: 'Sehe ich auch so. Ich prüfe heute noch die mobile Ansicht.', reactions: [] },
  { id: 'm3', channelId: 'c1', senderId: 'u1', createdAt: todayAt(9, 10),
    text: 'Perfekt. Ich kümmere mich um die TypeScript-Logik und die Datenanbindung.',
    reactions: [{ emoji: '🚀', userIds: ['u2', 'u3', 'u4'] }] },
  { id: 'm4', channelId: 'c2', senderId: 'u4', createdAt: todayAt(10, 4),
    text: 'Bitte denkt daran, eure Commits klein und nachvollziehbar zu halten.',
    reactions: [{ emoji: '✅', userIds: ['u1', 'u2'] }] },
  { id: 'm5', directChatId: directChatId('u1', 'u2'), senderId: 'u2', createdAt: todayAt(11, 20),
    text: 'Hast du später kurz Zeit für einen Architektur-Check?', reactions: [] },
  { id: 'm6', directChatId: directChatId('u1', 'u2'), senderId: 'u1', createdAt: todayAt(11, 24),
    text: 'Ja, machen wir nach dem nächsten Commit.', reactions: [] },
];

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Diese Datei enthält nur Demo-Daten (Startdaten zum Testen).
 *
 * - todayAt(): Erzeugt einen Zeitstempel für heute zu einer bestimmten
 *   Uhrzeit, damit die Demo-Nachrichten realistische Zeiten haben.
 * - DEMO_USERS, DEMO_CHANNELS, DEMO_MESSAGES: Konstanten mit
 *   Beispieldaten. Sie sind mit den Modellen typisiert, z. B. User[].
 *   Fehlt ein Pflichtfeld, meldet TypeScript einen Fehler.
 * - m2 ist eine Thread-Antwort auf m1 (threadId: 'm1').
 *
 * Vorher steckten die Demo-Daten im großen Service. Jetzt sind Daten
 * und Logik getrennt. Kommt die echte Datenbank, wird diese Datei
 * gelöscht und die Services laden die Daten von dort.
 */
