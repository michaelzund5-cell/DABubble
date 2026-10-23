import { DestroyRef, inject, Injectable, signal } from '@angular/core';

/** Same breakpoint as in the SCSS files: below 1000 px the mobile layout is used. */
export const MOBILE_QUERY = '(max-width: 999px)';

/** Tells components whether the mobile layout is active (for logic, not for styles). */
@Injectable({ providedIn: 'root' })
export class ViewportService {
  private readonly media = window.matchMedia(MOBILE_QUERY);
  readonly isMobile = signal(this.media.matches);

  constructor() {
    const update = (event: MediaQueryListEvent) => this.isMobile.set(event.matches);
    this.media.addEventListener('change', update);
    inject(DestroyRef).onDestroy(() => this.media.removeEventListener('change', update));
  }
}
