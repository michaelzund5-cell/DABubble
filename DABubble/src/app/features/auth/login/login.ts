import { Component, computed, inject, signal } from '@angular/core';
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

/** Which button is waiting for Firebase. That button shows "Bitte warten …" (instant reaction on click). */
type LoginKind = 'email' | 'guest' | 'google';

/** Login page (Figma page 2): email, Google and guest login. */
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
  readonly pending = signal<LoginKind | null>(null);
  readonly busy = computed(() => this.pending() !== null);
  readonly googleHint = signal('');

  async login(): Promise<void> {
    if (!this.validateInputs()) return;
    await this.handle('email', () => this.session.login(this.email, this.password), (text) => this.passwordError = text);
  }

  async loginAsGuest(): Promise<void> {
    await this.handle('guest', () => this.session.loginAsGuest(), (text) => this.googleHint.set(text));
  }

  async loginWithGoogle(): Promise<void> {
    await this.handle('google', () => this.session.loginWithGoogle(), (text) => this.googleHint.set(text));
  }

  /** Runs one login method: blocks double clicks, opens the workspace or shows the message. */
  private async handle(
    kind: LoginKind, attempt: () => Promise<LoginResult>, showError: (text: string) => void,
  ): Promise<void> {
    if (this.busy()) return;
    this.pending.set(kind);
    this.googleHint.set('');
    const result = await attempt();
    this.pending.set(null);
    if (result === 'ok') void this.router.navigate(['/workspace']);
    else if (result !== 'cancelled') showError(MESSAGES[result]);
  }

  /**
   * Checks the fields before Firebase is asked.
   *
   * @returns true when both fields are fine
   */
  private validateInputs(): boolean {
    this.emailError = validateEmail(this.email);
    this.passwordError = this.password ? '' : 'Bitte gib dein Passwort ein.';
    return !this.emailError && !this.passwordError;
  }
}
