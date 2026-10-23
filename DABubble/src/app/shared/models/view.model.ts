/** Kind of view in the middle column. */
export type ViewType = 'channel' | 'direct' | 'new';

/** What is open in the middle column: a channel, a direct chat or "new message". */
export interface ActiveView {
  type: ViewType;
  /** For 'channel': the channel ID. For 'direct': the ID of the other user. For 'new': empty. */
  id: string;
}

/** Popups and dialogs of the workspace (Figma pages 10-14, 59). null = none open. */
export type DialogType = 'channelDetails' | 'members' | 'addMembers' | 'createChannel' | 'profile' | 'ownProfile' | 'headerMenu';
