// What is currently shown in the main chat area: a channel or a direct chat.
export type ViewType = 'channel' | 'direct';

export interface ActiveView {
  type: ViewType;
  // For 'channel': the channel ID. For 'direct': the ID of the other user.
  id: string;
}

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
 */
