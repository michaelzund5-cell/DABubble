/** Shape of a channel (a group chat on one topic). */
export interface Channel {
  id: string;
  name: string;
  description: string;
  memberIds: string[]; // IDs of the users in this channel (references to User.id)
  createdBy: string; // User.id of the creator (Figma: "Erstellt von")
  createdAt: number; // Timestamp in milliseconds
  isPublic?: boolean; // "Allgemein": every user may join
}
