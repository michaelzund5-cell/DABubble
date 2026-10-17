// Shape of a channel (a group chat on one topic).
export interface Channel {
  id: string;
  name: string;
  description: string;
  memberIds: string[]; // IDs of the users in this channel (references to User.id)
  createdBy: string; // User.id of the creator (Figma: "Erstellt von")
  createdAt: number; // Timestamp in milliseconds
}

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Diese Datei beschreibt, wie ein Channel aussieht.
 *
 * - memberIds speichert nur die IDs der Mitglieder, nicht die ganzen
 *   Benutzer-Objekte. Das ist eine Referenz, wie in einer Datenbank:
 *   Ändert ein Benutzer seinen Namen, muss nur der Benutzer geändert
 *   werden, nicht jeder Channel.
 * - createdBy / createdAt: Wer den Channel wann erstellt hat. Wird in den
 *   Channel-Details ("Erstellt von") und im leeren Channel angezeigt.
 */
