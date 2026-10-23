import { Message } from '../models/message.model';
import { isSameDay } from '../pipes/chat-date.pipe';

/** Messages of one calendar day, shown under one date divider. */
export interface DayGroup {
  day: number; // timestamp of the first message of that day
  messages: Message[];
}

/**
 * Splits a sorted message list into days, for the date dividers in the chat.
 *
 * @param messages - Messages, oldest first
 * @returns One group per day with its messages
 */
export function groupByDay(messages: Message[]): DayGroup[] {
  const groups: DayGroup[] = [];
  for (const message of messages) {
    const last = groups.at(-1);
    if (last && isSameDay(new Date(last.day), new Date(message.createdAt))) last.messages.push(message);
    else groups.push({ day: message.createdAt, messages: [message] });
  }
  return groups;
}
