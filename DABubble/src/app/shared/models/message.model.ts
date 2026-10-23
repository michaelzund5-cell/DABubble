/**
 * One emoji reaction on a message.
 * We store WHO reacted (userIds) instead of only a counter.
 * This allows a real toggle: clicking again removes your own reaction.
 */
export interface Reaction {
  emoji: string;
  userIds: string[];
}

/**
 * Shape of a chat message.
 * A message belongs EITHER to a channel (channelId) OR to a direct chat (directChatId).
 */
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
