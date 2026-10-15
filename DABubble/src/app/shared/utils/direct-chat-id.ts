// Builds one stable ID for the direct chat between two users.
// The IDs are sorted, so directChatId('u1', 'u2') === directChatId('u2', 'u1').
// Both users therefore see the same conversation.
export function directChatId(userA: string, userB: string): string {
  const [first, second] = [userA, userB].sort();
  return `dm_${first}_${second}`;
}

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Eine kleine Hilfsfunktion (Utility).
 *
 * Sie erzeugt eine eindeutige ID für die Unterhaltung zwischen zwei
 * Personen. Die beiden Benutzer-IDs werden sortiert, damit immer
 * dieselbe ID herauskommt, egal wer von beiden fragt.
 * Beispiel: u2 und u1 ergeben immer "dm_u1_u2".
 *
 * Vorher wurde nur die ID der anderen Person gespeichert. Das klappte
 * nur aus Sicht eines Benutzers. Mit mehreren echten Benutzern hätte
 * jeder etwas anderes gesehen.
 *
 * Syntax: const [first, second] = ... ist Destructuring. Die zwei
 * Werte aus dem sortierten Array werden direkt in zwei Variablen
 * gespeichert. Die Backticks `...${}` sind ein Template-String.
 */
