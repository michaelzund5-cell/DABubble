import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RegistrationService } from '../../../core/auth/registration.service';
import { validateEmail, validateName, validatePassword } from '../../../shared/utils/validators';

@Component({
  selector: 'app-register-page',
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class RegisterPage {
  private readonly registration = inject(RegistrationService);
  private readonly router = inject(Router);

  name = '';
  email = '';
  password = '';
  privacyAccepted = false;
  // Errors only show after the user has left a field once.
  readonly touched = { name: false, email: false, password: false };
  readonly busy = signal(false);
  readonly formError = signal('');
  private takenEmail = ''; // Firebase reported: this email already has an account

  constructor() {
    this.restoreDraft();
  }

  getNameError(): string {
    return validateName(this.name);
  }

  getEmailError(): string {
    const error = validateEmail(this.email);
    if (error) return error;
    return this.email.trim() === this.takenEmail ? 'Diese E-Mail-Adresse wird bereits verwendet.' : '';
  }

  getPasswordError(): string {
    return validatePassword(this.password);
  }

  isValid(): boolean {
    return !this.getNameError() && !this.getEmailError() && !this.getPasswordError() && this.privacyAccepted;
  }

  async next(): Promise<void> {
    if (!this.isValid() || this.busy()) return;
    this.busy.set(true);
    this.formError.set('');
    const result = await this.registration.createAccount(this.name.trim(), this.email, this.password);
    this.busy.set(false);
    if (result === 'ok') void this.router.navigate(['/register/avatar']);
    else this.showError(result);
  }

  private showError(result: 'email-in-use' | 'weak-password' | 'failed'): void {
    if (result === 'email-in-use') this.takenEmail = this.email.trim();
    this.touched.email = true;
    if (result === 'weak-password') this.formError.set('Dieses Passwort ist zu schwach.');
    if (result === 'failed') this.formError.set('Das hat nicht geklappt. Bitte prüfe deine Internetverbindung.');
  }

  // Coming back from the avatar step: fill in what was already typed.
  private restoreDraft(): void {
    const draft = this.registration.draft();
    if (!draft) return;
    this.name = draft.name;
    this.email = draft.email;
    this.privacyAccepted = true;
  }
}

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Logik der Registrierung, Schritt 1.
 * - touched: Fehler erscheinen erst, nachdem ein Feld verlassen wurde.
 * - getNameError() usw.: gemeinsame Prüfungen aus validators.ts.
 * - isValid(): Alle Felder gültig und Datenschutz akzeptiert. Steuert, ob
 *   der Weiter-Button aktiv ist.
 * - next(): legt das Konto bei Firebase an (RegistrationService). busy
 *   sperrt den Button, damit ein Doppelklick kein zweites Konto versucht.
 * - showError(): E-Mail schon vergeben (Meldung unter dem Feld),
 *   Passwort zu schwach oder keine Verbindung (Meldung über dem Button).
 * - takenEmail: merkt sich die vergebene E-Mail. Ändert man sie, ist die
 *   Meldung weg.
 * - restoreDraft(): Kommt man mit dem Zurück-Pfeil von der Avatar-Seite,
 *   sind Name und E-Mail wieder da. Das Passwort muss neu eingegeben
 *   werden, es wird nirgends gespeichert.
 */
