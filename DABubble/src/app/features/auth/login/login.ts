import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LoginResult, SessionService } from '../../../core/auth/session.service';
import { validateEmail } from '../../../shared/utils/validators';
import { IntroSplash } from '../intro-splash/intro-splash';

const MESSAGES: Record<Exclude<LoginResult, 'ok' | 'cancelled'>, string> = {
  invalid: 'E-Mail oder Passwort ist falsch.',
  blocked: 'Zu viele Versuche. Bitte warte kurz und versuche es dann nochmals.',
  failed: 'Anmeldung nicht möglich. Bitte prüfe deine Internetverbindung.',
};

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
  readonly busy = signal(false);
  readonly googleHint = signal('');

  async login(): Promise<void> {
    if (!this.validateInputs()) return;
    await this.handle(() => this.session.login(this.email, this.password), (text) => this.passwordError = text);
  }

  async loginAsGuest(): Promise<void> {
    await this.handle(() => this.session.loginAsGuest(), (text) => this.googleHint.set(text));
  }

  async loginWithGoogle(): Promise<void> {
    await this.handle(() => this.session.loginWithGoogle(), (text) => this.googleHint.set(text));
  }

  // Runs one login method: blocks double clicks, opens the workspace or shows the message.
  private async handle(attempt: () => Promise<LoginResult>, showError: (text: string) => void): Promise<void> {
    if (this.busy()) return;
    this.busy.set(true);
    this.googleHint.set('');
    const result = await attempt();
    this.busy.set(false);
    if (result === 'ok') void this.router.navigate(['/workspace']);
    else if (result !== 'cancelled') showError(MESSAGES[result]);
  }

  private validateInputs(): boolean {
    this.emailError = validateEmail(this.email);
    this.passwordError = this.password ? '' : 'Bitte gib dein Passwort ein.';
    return !this.emailError && !this.passwordError;
  }
}

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Logik der Login-Seite, jetzt mit Firebase.
 * - login(): prüft die Eingaben, dann Anmeldung mit E-Mail und Passwort.
 * - Bewusst dieselbe Meldung für falsche E-Mail und falsches Passwort.
 *   So kann niemand herausfinden, welche E-Mails ein Konto haben.
 * - loginAsGuest(): anonymes Gastkonto bei Firebase.
 * - loginWithGoogle(): Google-Fenster. Wird es geschlossen, passiert
 *   nichts (kein Fehler).
 * - handle(): gemeinsamer Ablauf aller drei Wege. busy verhindert
 *   Doppelklicks, danach Workspace öffnen oder Meldung zeigen.
 * - MESSAGES: kurze, verständliche Texte. Technische Details von
 *   Firebase sieht der Benutzer nie.
 */
