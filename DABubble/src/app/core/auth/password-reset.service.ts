import { Injectable } from '@angular/core';
import { confirmPasswordReset, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { reportError } from '../firebase/report-error';

/** "Passwort vergessen" with Firebase Authentication. */
@Injectable({ providedIn: 'root' })
export class PasswordResetService {
  /**
   * Never reports whether the email has an account: the page shows the same message either way.
   * * @param email - Address the user typed in
   *
   * @param email - Address the user typed in
   */
  async sendResetEmail(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      reportError('Passwort-Mail', error);
    }
  }

  /**
   * The code comes from the link in the email (?oobCode=...). Returns false if it is invalid or expired.
   *
   * @param code - oobCode from the email link, null if missing
   * @param password - The new password
   * @returns true when saved, false when the code is invalid or expired
   */
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
