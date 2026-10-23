import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { RegistrationService } from '../../../core/auth/registration.service';
import { AVATARS, DEFAULT_AVATAR } from '../../../shared/models/avatars';
import { Toast } from '../../../shared/components/toast/toast';

const TOAST_DURATION_MS = 2000;

/** Second sign-up step (Figma page 4): choose an avatar. */
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

  /**
   * Chooses an avatar.
   *
   * @param avatar - Path of the avatar
   */
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

  /** Back to step 1: the half-created account is deleted first. */
  async back(): Promise<void> {
    this.busy.set(true);
    await this.registration.cancel();
    void this.router.navigate(['/register']);
  }
}
