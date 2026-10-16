import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PasswordResetService } from '../../../core/auth/password-reset.service';
import { validatePassword, validatePasswordRepeat } from '../../../shared/utils/validators';

@Component({
  selector: 'app-new-password-page',
  imports: [FormsModule, RouterLink],
  templateUrl: './new-password.html',
  styleUrl: './new-password.scss',
})
export class NewPasswordPage {
  private readonly passwordReset = inject(PasswordResetService);
  private readonly router = inject(Router);
  // Code from the email link: /password-reset/new?oobCode=...
  private readonly resetCode = inject(ActivatedRoute).snapshot.queryParamMap.get('oobCode');

  password = '';
  repeat = '';
  readonly touched = { password: false, repeat: false };
  readonly saving = signal(false);

  getPasswordError(): string {
    return validatePassword(this.password);
  }

  getRepeatError(): string {
    return validatePasswordRepeat(this.password, this.repeat);
  }

  isValid(): boolean {
    return !this.getPasswordError() && !this.getRepeatError();
  }

  async save(): Promise<void> {
    if (!this.isValid() || this.saving()) return;
    this.saving.set(true);
    await this.passwordReset.confirmNewPassword(this.resetCode, this.password);
    void this.router.navigate(['/login']);
  }
}

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Logik der Seite "Passwort zurücksetzen", Schritt 2 (neues Passwort).
 * - resetCode: Firebase hängt an den Link in der E-Mail einen Code an
 *   (?oobCode=...). ActivatedRoute liest ihn aus der URL. snapshot heißt:
 *   einmal beim Öffnen lesen.
 * - getPasswordError(), getRepeatError(): gemeinsame Prüfungen aus
 *   validators.ts. Gleiche Regeln wie bei der Registrierung.
 * - saving: Signal. Sperrt den Button während des Speicherns.
 * - save(): prüft, speichert über den Service (später Firebase) und
 *   leitet zur Anmeldung weiter.
 */
