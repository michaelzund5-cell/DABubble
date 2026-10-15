import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SessionService } from '../../../core/auth/session.service';
import { validateEmail } from '../../../shared/utils/validators';

@Component({
  selector: 'app-login-page',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginPage {
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);

  email = '';
  password = '';
  emailError = '';
  passwordError = '';

  login(): void {
    if (!this.validateInputs()) return;
    if (this.session.login(this.email, this.password)) {
      this.openWorkspace();
      return;
    }
    // Same message for wrong email and wrong password: attackers cannot test which emails exist.
    this.passwordError = 'E-Mail oder Passwort ist falsch.';
  }

  loginAsGuest(): void {
    this.session.loginAsGuest();
    this.openWorkspace();
  }

  loginWithGoogle(): void {
    // Connected in the Firebase step.
  }

  private validateInputs(): boolean {
    this.emailError = validateEmail(this.email);
    this.passwordError = this.password ? '' : 'Bitte gib dein Passwort ein.';
    return !this.emailError && !this.passwordError;
  }

  private openWorkspace(): void {
    void this.router.navigate(['/workspace']);
  }
}
