import { Injectable } from '@angular/core';

// Handles "forgot password". DEMO ONLY until Firebase is connected:
// - sendResetEmail()     -> Firebase: sendPasswordResetEmail(auth, email)
// - confirmNewPassword() -> Firebase: confirmPasswordReset(auth, code, password)
@Injectable({ providedIn: 'root' })
export class PasswordResetService {
  // Always resolves, even for unknown emails.
  // The page shows the same message either way, so nobody can test which emails exist.
  async sendResetEmail(email: string): Promise<void> {
    void email;
  }

  // The code comes from the link in the email (?oobCode=...).
  async confirmNewPassword(code: string | null, password: string): Promise<void> {
    void code;
    void password;
  }
}

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Service für "Passwort vergessen". Zwei Schritte:
 * 1. sendResetEmail(): schickt die E-Mail mit dem Link zum Zurücksetzen.
 * 2. confirmNewPassword(): speichert das neue Passwort. Der Code dafür
 *    steht im Link aus der E-Mail (?oobCode=...).
 *
 * Aktuell Demo: Die Methoden tun nichts. Mit Firebase werden nur diese
 * zwei Methoden ersetzt, die Seiten bleiben gleich.
 *
 * async / Promise: Das Senden dauert (Netzwerk). Die Seite wartet mit
 * await auf das Ergebnis.
 *
 * Sicherheit: Die Seite zeigt immer "E-Mail gesendet", auch wenn die
 * Adresse nicht existiert. Sonst könnte ein Angreifer ausprobieren,
 * welche E-Mail-Adressen ein Konto haben (User Enumeration).
 * void email: markiert den Parameter als bewusst ungenutzt (Demo).
 */
