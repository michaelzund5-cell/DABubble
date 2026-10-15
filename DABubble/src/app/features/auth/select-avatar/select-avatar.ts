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

  select(avatar: string): void {
    this.selected.set(avatar);
  }

  finish(): void {
    const avatar = this.selected();
    if (!avatar || !this.registration.complete(avatar)) return;
    this.finished.set(true);
    setTimeout(() => void this.router.navigate(['/login']), TOAST_DURATION_MS);
  }
}
