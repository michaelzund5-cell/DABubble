
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login-page',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginPage {
  email = '';
  password = '';
  errorMessage = '';

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  login(): void {
    this.errorMessage = '';

    if (!this.email.trim() || !this.password.trim()) {
      this.errorMessage = 'Bitte E-Mail und Passwort eingeben.';
      return;
    }

    const loginSuccessful = this.authService.login(
      this.email,
      this.password
    );

    if (loginSuccessful) {
      this.router.navigate(['/workspace']);
      return;
    }

    this.errorMessage = 'E-Mail oder Passwort ist falsch.';
  }
}