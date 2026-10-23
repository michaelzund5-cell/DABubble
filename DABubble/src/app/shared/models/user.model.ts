/** Possible presence states of a user. A union type only allows these three values. */
export type UserStatus = 'online' | 'away' | 'offline';

/** Shape of a user object. Every service and component uses this same structure. */
export interface User {
  id: string;
  name: string;
  email: string;
  initials: string; // Short form shown in avatars, e.g. "MZ"
  status: UserStatus;
  avatar?: string; // Path to the chosen avatar image
  lastActive?: number; // Last sign of life in milliseconds (presence heartbeat), used to detect closed tabs
}
