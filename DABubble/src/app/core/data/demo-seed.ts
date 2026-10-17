import { Channel } from '../../shared/models/channel.model';
import { Message } from '../../shared/models/message.model';
import { User } from '../../shared/models/user.model';

// DEMO ONLY: starting data until the real database is connected.
// Names, avatars and texts are taken from Figma.

// Timestamp for today at the given time.
function todayAt(hours: number, minutes: number): number {
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.getTime();
}

// Figma shows "Dienstag, 14 Januar": 14 January 2025 was a Tuesday.
function figmaDayAt(hours: number, minutes: number): number {
  return new Date(2025, 0, 14, hours, minutes).getTime();
}

const avatar = (n: number) => `img/avatars/avatar-${n}.svg`;

export const DEMO_USERS: User[] = [
  { id: 'u1', name: 'Frederik Beck', email: 'test@test.ch', initials: 'FB', status: 'online', avatar: avatar(3) },
  { id: 'u2', name: 'Sofia Müller', email: 'sofia@dabubble.ch', initials: 'SM', status: 'online', avatar: avatar(5) },
  { id: 'u3', name: 'Noah Braun', email: 'noah@dabubble.ch', initials: 'NB', status: 'online', avatar: avatar(6) },
  { id: 'u4', name: 'Elise Roth', email: 'elise@dabubble.ch', initials: 'ER', status: 'offline', avatar: avatar(1) },
  { id: 'u5', name: 'Elias Neumann', email: 'elias@dabubble.ch', initials: 'EN', status: 'online', avatar: avatar(2) },
  { id: 'u6', name: 'Steffen Hoffmann', email: 'steffen@dabubble.ch', initials: 'SH', status: 'online', avatar: avatar(4) },
];

export const DEMO_CHANNELS: Channel[] = [
  {
    id: 'c1', name: 'Entwicklerteam', memberIds: ['u3', 'u2', 'u1'], createdBy: 'u3', createdAt: figmaDayAt(9, 0),
    description: 'Dieser Channel ist für alles rund um #dfsdf vorgesehen. Hier kannst du zusammen mit deinem Team Meetings abhalten, Dokumente teilen und Entscheidungen treffen.',
  },
  {
    id: 'c2', name: 'Allgemein', description: 'Alles, was das gesamte Team betrifft.',
    memberIds: ['u2', 'u3', 'u4', 'u5', 'u6'], createdBy: 'u2', createdAt: figmaDayAt(9, 0),
  },
];

const LOREM = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque blandit odio efficitur lectus '
  + 'vestibulum, quis accumsan ante vulputate. Quisque tristique iaculis erat, eu faucibus lacus iaculis ac.';

export const DEMO_MESSAGES: Message[] = [
  { id: 'm1', channelId: 'c1', senderId: 'u3', createdAt: figmaDayAt(14, 25),
    text: 'Welche Version ist aktuell von Angular?', reactions: [] },
  // Thread replies: same channel, threadId points to the root message m1
  { id: 'm2', channelId: 'c1', threadId: 'm1', senderId: 'u2', createdAt: figmaDayAt(14, 30),
    reactions: [{ emoji: 'nerd', userIds: ['u3'] }],
    text: 'Ich habe die gleiche Frage. Ich habe gegoogelt und es scheint, dass die aktuelle Version Angular 13 ist. '
      + 'Vielleicht weiß Frederik, ob es wahr ist.' },
  { id: 'm3', channelId: 'c1', threadId: 'm1', senderId: 'u1', createdAt: figmaDayAt(14, 56),
    text: 'Ja das ist es.', reactions: [{ emoji: 'thumbs', userIds: ['u2'] }] },
  { id: 'm4', channelId: 'c1', senderId: 'u1', createdAt: todayAt(15, 6), text: LOREM,
    reactions: [{ emoji: 'rocket', userIds: ['u2'] }, { emoji: 'check', userIds: ['u3'] }] },
];

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Demo-Daten (Startdaten zum Testen), Namen und Texte aus Figma.
 * - todayAt(): Zeitstempel für heute zu einer Uhrzeit ("Heute").
 * - figmaDayAt(): 14. Januar 2025. Das war ein Dienstag, so steht in
 *   der Trennlinie wie in Figma "Dienstag, 14 Januar".
 * - DEMO_USERS: die sechs Personen aus Figma mit ihrem Avatar.
 *   u1 (Frederik Beck) ist der Demo-Login test@test.ch.
 * - Reaktionen speichern eine Emoji-ID ('rocket', 'check'), nicht das
 *   Zeichen. Angezeigt wird das Bild aus Figma (shared/models/emojis.ts),
 *   damit es auf jedem Gerät gleich aussieht.
 * - m2 und m3 sind Thread-Antworten auf m1 (threadId: 'm1').
 * - Keine Direktnachrichten: In Figma (Seiten 21 bis 26) sind alle
 *   Direktnachrichten leer und zeigen den Begrüssungstext.
 * Kommt die echte Datenbank, wird diese Datei gelöscht.
 */
