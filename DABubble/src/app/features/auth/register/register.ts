import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RegistrationService } from '../../../core/auth/registration.service';
import { validateEmail, validateName, validatePassword } from '../../../shared/utils/validators';

/** Sign-up page (Figma page 3): name, email, password and privacy consent. */
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
  /** Errors only show after the user has left a field once. */
  readonly touched = { name: false, email: false, password: false };
  readonly busy = signal(false);
  readonly formError = signal('');
  private takenEmail = ''; // Firebase reported: this email already has an account

  constructor() {
    this.restoreDraft();
  }

  /**
   * Error of the name field.
   *
   * @returns Error text, or an empty string
   */
  getNameError(): string {
    return validateName(this.name);
  }

  /**
   * Error of the email field.
   *
   * @returns Error text, or an empty string
   */
  getEmailError(): string {
    const error = validateEmail(this.email);
    if (error) return error;
    return this.email.trim() === this.takenEmail ? 'Diese E-Mail-Adresse wird bereits verwendet.' : '';
  }

  /**
   * Error of the password field.
   *
   * @returns Error text, or an empty string
   */
  getPasswordError(): string {
    return validatePassword(this.password);
  }

  /**
   * Checks the whole form.
   *
   * @returns true when the account can be created
   */
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

  /**
   * Shows why the account was not created.
   *
   * @param result - Result from Firebase
   */
  private showError(result: 'email-in-use' | 'weak-password' | 'failed'): void {
    if (result === 'email-in-use') this.takenEmail = this.email.trim();
    this.touched.email = true;
    if (result === 'weak-password') this.formError.set('Dieses Passwort ist zu schwach.');
    if (result === 'failed') this.formError.set('Das hat nicht geklappt. Bitte prüfe deine Internetverbindung.');
  }

  /** Coming back from the avatar step: fill in what was already typed. */
  private restoreDraft(): void {
    const draft = this.registration.draft();
    if (!draft) return;
    this.name = draft.name;
    this.email = draft.email;
    this.privacyAccepted = true;
  }
}
