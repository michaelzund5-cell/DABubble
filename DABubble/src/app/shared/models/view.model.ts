// What is currently shown in the main chat area: a channel, a direct chat or "new message".
export type ViewType = 'channel' | 'direct' | 'new';

export interface ActiveView {
  type: ViewType;
  // For 'channel': the channel ID. For 'direct': the ID of the other user. For 'new': empty.
  id: string;
}

// Popups and dialogs of the workspace (Figma pages 10-14, 59). null = none open.
export type DialogType = 'channelDetails' | 'members' | 'addMembers' | 'createChannel' | 'profile' | 'ownProfile' | 'headerMenu';

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Diese Datei beschreibt, was gerade im Chat-Bereich angezeigt wird.
 *
 * - type ist entweder 'channel' (Gruppenchat) oder 'direct'
 *   (Direktnachricht).
 * - id ist bei einem Channel die Channel-ID und bei einer
 *   Direktnachricht die ID der anderen Person.
 * - DialogType: Welches Fenster gerade offen ist (Profil, Channel-Details,
 *   Mitglieder, Channel erstellen, Menü oben rechts). Es ist immer nur
 *   eines offen.
 */
