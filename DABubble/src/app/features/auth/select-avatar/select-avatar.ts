import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { RegistrationService } from '../../../core/auth/registration.service';
import { AVATARS, DEFAULT_AVATAR } from '../../../shared/models/avatars';
import { Toast } from '../../../shared/components/toast/toast';

const TOAST_DURATION_MS = 2000;

@Component({
  selector: 'app-select-avatar-page',
  imports: [RouterLink, Toast],
  templateUrl: './select-avatar.html',
  styleUrl: './select-avatar.scss',
})
export class SelectAvatarPage {
  private readonly registration = inject(RegistrationService);
  private readonly router = inject(Router);

  readonly avatars = AVATARS;
  readonly defaultAvatar = DEFAULT_AVATAR;
  readonly userName = this.registration.draft()?.name ?? '';
  readonly selected = signal<string | null>(null);
  readonly finished = signal(false);
  readonly busy = signal(false);
  readonly error = signal('');

  select(avatar: string): void {
    this.selected.set(avatar);
  }

  async finish(): Promise<void> {
    const avatar = this.selected();
    if (!avatar || this.busy()) return;
    this.busy.set(true);
    if (await this.registration.complete(avatar)) {
      this.finished.set(true);
      setTimeout(() => void this.router.navigate(['/login']), TOAST_DURATION_MS);
      return;
    }
    this.busy.set(false);
    this.error.set('Speichern hat nicht geklappt. Bitte versuche es nochmals.');
  }

  // Back to step 1: the half-created account is deleted first.
  async back(): Promise<void> {
    this.busy.set(true);
    await this.registration.cancel();
    void this.router.navigate(['/register']);
  }
}

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Logik der Avatar-Auswahl, Schritt 2 der Registrierung.
 * - userName: Name aus Schritt 1, angezeigt unter dem Avatar.
 * - selected: Signal mit dem gewählten Avatar. null = noch keiner.
 * - finished: Signal. true nach dem Abschließen, dann erscheint die Bubble.
 * - finish(): speichert den Avatar (RegistrationService), zeigt die
 *   Bubble und wechselt nach 2 Sekunden zur Anmeldung. Klappt das
 *   Speichern nicht, erscheint eine Meldung.
 * - back(): Zurück-Pfeil. Das halb angelegte Konto wird gelöscht, dann
 *   geht es zurück zu "Konto erstellen".
 * - busy: sperrt die Buttons, solange Firebase arbeitet.
 */
