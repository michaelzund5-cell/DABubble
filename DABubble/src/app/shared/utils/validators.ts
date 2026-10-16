// Form checks used by login, register and password reset.
// Each function returns an error text, or '' when the value is fine.
// Browser checks are for quick feedback only. Firebase checks again on the server.

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MIN_PASSWORD_LENGTH = 8;

export function validateEmail(value: string): string {
  const email = value.trim();
  if (!email) return 'Bitte gib deine E-Mail-Adresse ein.';
  if (!EMAIL_PATTERN.test(email)) return 'Diese E-Mail-Adresse ist ungültig.';
  return '';
}

export function validateName(value: string): string {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'Bitte gib deinen Namen ein.';
  if (parts.length < 2) return 'Bitte gib Vor- und Nachnamen ein.';
  return '';
}

export function validatePassword(value: string): string {
  if (!value) return 'Bitte gib ein Passwort ein.';
  if (value.length < MIN_PASSWORD_LENGTH) return `Mindestens ${MIN_PASSWORD_LENGTH} Zeichen.`;
  if (!/[a-zA-Z]/.test(value) || !/\d/.test(value)) return 'Mindestens ein Buchstabe und eine Zahl.';
  return '';
}

export function validatePasswordRepeat(password: string, repeat: string): string {
  if (!repeat) return 'Bitte bestätige dein Passwort.';
  if (repeat !== password) return 'Die Passwörter stimmen nicht überein.';
  return '';
}

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Prüfungen für Formulare, gemeinsam genutzt von Login, Registrierung
 * und Passwort zurücksetzen.
 * - Jede Funktion gibt einen Fehlertext zurück, oder '' wenn alles
 *   stimmt. So kann die Seite den Text direkt unter dem Feld anzeigen.
 * - EMAIL_PATTERN: regulärer Ausdruck. Prüft "etwas@etwas.xx".
 * - validateName: mindestens zwei Wörter (Vor- und Nachname).
 * - validatePassword: mindestens 8 Zeichen, ein Buchstabe, eine Zahl.
 * - validatePasswordRepeat: Bestätigung muss gleich sein.
 *
 * Sicherheit: Diese Prüfungen laufen im Browser und können umgangen
 * werden. Sie sind nur Komfort für den Benutzer. Firebase prüft auf
 * dem Server noch einmal.
 */
