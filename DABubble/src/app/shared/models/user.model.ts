// Possible presence states of a user. A union type only allows these three values.
export type UserStatus = 'online' | 'away' | 'offline';

// Shape of a user object. Every service and component uses this same structure.
export interface User {
  id: string;
  name: string;
  email: string;
  initials: string; // Short form shown in avatars, e.g. "MZ"
  status: UserStatus;
  avatar?: string; // Path to the chosen avatar image
}

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Diese Datei beschreibt, wie ein Benutzer aussieht (Modell).
 *
 * - UserStatus: Ein Union Type. Der Status darf nur 'online', 'away'
 *   (abwesend) oder 'offline' sein. Tippfehler wie 'onlin' meldet
 *   TypeScript sofort als Fehler.
 * - User: Ein Interface. Es legt fest, welche Felder ein Benutzer hat
 *   und welchen Datentyp jedes Feld hat. Es enthält keine Logik.
 *
 * Warum? Alle Teile der App arbeiten mit derselben Struktur. Wird ein
 * Feld geändert, zeigt TypeScript überall an, wo der Code angepasst
 * werden muss.
 */
