// One emoji reaction on a message.
// We store WHO reacted (userIds) instead of only a counter.
// This allows a real toggle: clicking again removes your own reaction.
export interface Reaction {
  emoji: string;
  userIds: string[];
}

// Shape of a chat message.
// A message belongs EITHER to a channel (channelId) OR to a direct chat (directChatId).
export interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: number; // Timestamp in milliseconds. Formatting happens only in the template.
  channelId?: string;
  directChatId?: string;
  threadId?: string; // Set on thread replies: ID of the root message they answer
  edited?: boolean;
  reactions: Reaction[];
}

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Diese Datei beschreibt Nachrichten und Reaktionen.
 *
 * - Reaction: Speichert das Emoji und die IDs aller Benutzer, die so
 *   reagiert haben. Die Anzahl ist einfach userIds.length.
 *   Vorher wurde nur eine Zahl gespeichert. Dadurch konnte man nicht
 *   wissen, ob man selbst schon reagiert hat, und Umschalten war
 *   unmöglich (Logikfehler).
 *
 * - Message:
 *   - createdAt ist ein Zeitstempel (Zahl), kein Text wie '08:42'.
 *     So kann man nach Datum sortieren. Die Anzeige als Uhrzeit macht
 *     das Template mit der DatePipe.
 *   - channelId oder directChatId: Das Fragezeichen heißt "optional".
 *     Eine Nachricht gehört entweder zu einem Channel oder zu einer
 *     Direktnachricht.
 *   - threadId: Thread-Antworten sind jetzt eigene Nachrichten mit
 *     einem Verweis auf die Ursprungsnachricht. Vorher steckten sie als
 *     Liste in der Nachricht selbst. Für eine Datenbank ist die neue
 *     Variante besser, weil jede Antwort einzeln gespeichert, geladen
 *     und geschützt werden kann.
 */
