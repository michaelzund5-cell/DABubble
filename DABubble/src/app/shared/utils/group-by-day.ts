import { Message } from '../models/message.model';
import { isSameDay } from '../pipes/chat-date.pipe';

export interface DayGroup {
  day: number; // timestamp of the first message of that day
  messages: Message[];
}

// Splits a sorted message list into days, for the date dividers in the chat.
export function groupByDay(messages: Message[]): DayGroup[] {
  const groups: DayGroup[] = [];
  for (const message of messages) {
    const last = groups.at(-1);
    if (last && isSameDay(new Date(last.day), new Date(message.createdAt))) last.messages.push(message);
    else groups.push({ day: message.createdAt, messages: [message] });
  }
  return groups;
}

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Teilt die Nachrichten nach Tagen auf.
 * - Die Liste ist schon nach Zeit sortiert. Für jede Nachricht: Ist sie
 *   vom selben Tag wie die letzte Gruppe, kommt sie dazu, sonst beginnt
 *   eine neue Gruppe.
 * - Pro Gruppe zeigt die Chat-Ansicht eine Trennlinie mit Datum.
 */
