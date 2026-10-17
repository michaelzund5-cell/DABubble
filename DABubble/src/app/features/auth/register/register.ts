import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RegistrationService } from '../../../core/auth/registration.service';
import { UserService } from '../../../core/data/user.service';
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
  private readonly userService = inject(UserService);

  name = '';
  email = '';
  password = '';
  privacyAccepted = false;
  // Errors only show after the user has left a field once.
  readonly touched = { name: false, email: false, password: false };

  constructor() {
    this.restoreDraft();
  }

  getNameError(): string {
    return validateName(this.name);
  }

  getEmailError(): string {
    const error = validateEmail(this.email);
    if (error) return error;
    return this.userService.emailExists(this.email) ? 'Diese E-Mail-Adresse wird bereits verwendet.' : '';
  }

  getPasswordError(): string {
    return validatePassword(this.password);
  }

  isValid(): boolean {
    return !this.getNameError() && !this.getEmailError() && !this.getPasswordError() && this.privacyAccepted;
  }

  next(): void {
    if (!this.isValid()) return;
    this.registration.saveDraft({ name: this.name.trim(), email: this.email.trim(), password: this.password });
    void this.router.navigate(['/register/avatar']);
  }

  // Coming back from the avatar step: fill in what was already typed.
  private restoreDraft(): void {
    const draft = this.registration.draft();
    if (!draft) return;
    this.name = draft.name;
    this.email = draft.email;
    this.password = draft.password;
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
 * - next(): speichert die Eingaben im RegistrationService und wechselt zur
 *   Avatar-Auswahl.
 * - restoreDraft(): Kommt man mit dem Zurück-Pfeil von der Avatar-Seite,
 *   sind die Eingaben noch da.
 * - getEmailError(): prüft zusätzlich, ob die E-Mail schon ein Konto hat.
 */
