import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SessionService } from '../../../core/auth/session.service';
import { validateEmail } from '../../../shared/utils/validators';
import { IntroSplash } from '../intro-splash/intro-splash';

@Component({
  selector: 'app-login-page',
  imports: [FormsModule, IntroSplash, RouterLink],
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

  readonly googleHint = signal('');

  // Demo: Google sign-in needs Firebase (signInWithPopup). Until then the button explains this.
  loginWithGoogle(): void {
    this.googleHint.set('Google-Anmeldung wird mit Firebase aktiviert. Bitte Gäste-Login nutzen.');
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

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Logik der Login-Seite.
 * - login(): prüft die Eingaben, meldet an und öffnet den Arbeitsbereich.
 * - Bewusst dieselbe Meldung für falsche E-Mail und falsches Passwort.
 *   So kann niemand herausfinden, welche E-Mails ein Konto haben.
 * - loginAsGuest(): Gäste-Login (Demo: Demo-Benutzer).
 * - loginWithGoogle(): zeigt in der Demo einen Hinweis. Mit Firebase
 *   kommt hier signInWithPopup() mit dem Google-Anbieter hin.
 */
