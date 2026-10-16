import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PasswordResetService } from '../../../core/auth/password-reset.service';
import { Toast } from '../../../shared/components/toast/toast';
import { validateEmail } from '../../../shared/utils/validators';

const TOAST_DURATION_MS = 2000;

@Component({
  selector: 'app-password-reset-page',
  imports: [FormsModule, RouterLink, Toast],
  templateUrl: './password-reset.html',
  styleUrl: './password-reset.scss',
})
export class PasswordResetPage {
  private readonly passwordReset = inject(PasswordResetService);
  private readonly router = inject(Router);

  email = '';
  emailTouched = false;
  readonly sent = signal(false);

  getEmailError(): string {
    return validateEmail(this.email);
  }

  async send(): Promise<void> {
    if (this.getEmailError() || this.sent()) return;
    await this.passwordReset.sendResetEmail(this.email.trim());
    this.sent.set(true);
    setTimeout(() => void this.router.navigate(['/login']), TOAST_DURATION_MS);
  }
}

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Logik der Seite "Passwort zurücksetzen", Schritt 1.
 * - email: über [(ngModel)] mit dem Eingabefeld verbunden.
 * - getEmailError(): nutzt die gemeinsame Prüfung aus validators.ts.
 * - sent: Signal. true nach dem Senden. Dann erscheint die Bubble und
 *   der Button wird gesperrt.
 * - send():
 *   1. Abbruch, wenn die E-Mail ungültig ist oder schon gesendet wurde.
 *   2. Mit await auf den Service warten (später Firebase).
 *   3. Bubble zeigen, nach 2 Sekunden zurück zur Anmeldung.
 * - TOAST_DURATION_MS: feste Zahl als Konstante mit Namen statt einer
 *   "magischen" 2000 mitten im Code.
 */
