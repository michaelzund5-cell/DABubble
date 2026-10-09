import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register-page',
  imports: [FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class RegisterPage {
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  errorMessage = '';

  constructor(private readonly router: Router) {}

  register(): void {
    this.errorMessage = '';

    if (
      !this.name.trim() ||
      !this.email.trim() ||
      !this.password.trim() ||
      !this.confirmPassword.trim()
    ) {
      this.errorMessage = 'Bitte alle Felder ausfüllen.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Die Passwörter stimmen nicht überein.';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'Das Passwort muss mindestens 6 Zeichen lang sein.';
      return;
    }

    console.log('Registrierung:', {
      name: this.name,
      email: this.email,
    });

    this.router.navigate(['/login']);
  }
}