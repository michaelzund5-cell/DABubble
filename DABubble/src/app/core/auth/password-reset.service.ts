import { Injectable } from '@angular/core';
import { confirmPasswordReset, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { reportError } from '../firebase/report-error';

// "Passwort vergessen" with Firebase Authentication.
@Injectable({ providedIn: 'root' })
export class PasswordResetService {
  // Never reports whether the email has an account: the page shows the same message either way.
  async sendResetEmail(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      reportError('Passwort-Mail', error);
    }
  }

  // The code comes from the link in the email (?oobCode=...). Returns false if it is invalid or expired.
  async confirmNewPassword(code: string | null, password: string): Promise<boolean> {
    if (!code) return false;
    try {
      await confirmPasswordReset(auth, code, password);
      return true;
    } catch {
      return false;
    }
  }
}

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * "Passwort vergessen" mit Firebase.
 * - sendResetEmail(): Firebase schickt eine E-Mail mit Link. Die Seite
 *   zeigt immer dieselbe Bestätigung, auch wenn es zur E-Mail kein Konto
 *   gibt. So kann niemand testen, welche E-Mails registriert sind.
 * - confirmNewPassword(): Der Link führt auf /password-reset/new mit dem
 *   Code (oobCode). Ist er ungültig oder abgelaufen, kommt false zurück
 *   und die Seite zeigt einen Hinweis.
 * - Damit der Link auf unsere Seite führt, muss in der Firebase-Konsole
 *   unter Authentication > Vorlagen > Passwort zurücksetzen die
 *   Aktions-URL auf .../password-reset/new gesetzt sein.
 */
