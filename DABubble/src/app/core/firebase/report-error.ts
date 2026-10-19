// Central place for unexpected Firebase errors (network, missing rights).
// Only technical details go to the console. Users get their own, short messages in the pages.
export function reportError(context: string, error: unknown): void {
  console.error(`[DABubble] ${context}`, error);
}

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Eine Stelle für unerwartete Firebase-Fehler (kein Netz, fehlende
 * Rechte durch die Sicherheitsregeln).
 * - Technische Details landen nur in der Browser-Konsole, für die
 *   Fehlersuche. Benutzer sehen kurze, eigene Meldungen auf der Seite.
 * - Im Normalbetrieb kommt hier nichts an. Erscheint etwas in der
 *   Konsole, stimmt etwas mit den Regeln oder der Verbindung nicht.
 */
