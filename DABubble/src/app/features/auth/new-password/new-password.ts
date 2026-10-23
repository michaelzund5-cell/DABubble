import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PasswordResetService } from '../../../core/auth/password-reset.service';
import { validatePassword, validatePasswordRepeat } from '../../../shared/utils/validators';

/** Page "Neues Passwort" (Figma page 6), opened from the reset email. */
@Component({
  selector: 'app-new-password-page',
  imports: [FormsModule, RouterLink],
  templateUrl: './new-password.html',
  styleUrl: './new-password.scss',
})
export class NewPasswordPage {
  private readonly passwordReset = inject(PasswordResetService);
  private readonly router = inject(Router);
  /** Code from the email link: /password-reset/new?oobCode=... */
  private readonly resetCode = inject(ActivatedRoute).snapshot.queryParamMap.get('oobCode');

  password = '';
  repeat = '';
  readonly touched = { password: false, repeat: false };
  readonly saving = signal(false);

  /**
   * Error of the password field.
   * * @returns Error text, or an empty string
   *
   * @returns Error text, or an empty string
   */
  getPasswordError(): string {
    return validatePassword(this.password);
  }

  /**
   * Error of the repeat field.
   * * @returns Error text, or an empty string
   *
   * @returns Error text, or an empty string
   */
  getRepeatError(): string {
    return validatePasswordRepeat(this.password, this.repeat);
  }

  /**
   * Checks both fields.
   * * @returns true when the new password can be saved
   *
   * @returns true when the new password can be saved
   */
  isValid(): boolean {
    return !this.getPasswordError() && !this.getRepeatError();
  }

  readonly linkError = signal('');

  async save(): Promise<void> {
    if (!this.isValid() || this.saving()) return;
    this.saving.set(true);
    if (await this.passwordReset.confirmNewPassword(this.resetCode, this.password)) {
      void this.router.navigate(['/login']);
      return;
    }
    this.saving.set(false);
    this.linkError.set('Der Link ist ungültig oder abgelaufen. Bitte fordere eine neue E-Mail an.');
  }
}
