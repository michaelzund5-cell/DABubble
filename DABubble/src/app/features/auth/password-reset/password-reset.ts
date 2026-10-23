import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PasswordResetService } from '../../../core/auth/password-reset.service';
import { Toast } from '../../../shared/components/toast/toast';
import { validateEmail } from '../../../shared/utils/validators';

const TOAST_DURATION_MS = 2000;

/** Page "Passwort zurücksetzen" (Figma page 5): sends the reset email. */
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

  /**
   * Error of the email field.
   * * @returns Error text, or an empty string
   *
   * @returns Error text, or an empty string
   */
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
