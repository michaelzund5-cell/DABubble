import { DestroyRef, inject, Injectable, signal } from '@angular/core';

// Same breakpoint as in the SCSS files: below 1000 px the mobile layout is used.
export const MOBILE_QUERY = '(max-width: 999px)';

// Tells components whether the mobile layout is active (for logic, not for styles).
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

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Merkt sich, ob gerade die Handy-Ansicht aktiv ist (unter 1000 px).
 * - matchMedia(): dieselbe Abfrage wie @media im CSS. Ändert sich die
 *   Fensterbreite, aktualisiert das 'change'-Ereignis das Signal.
 * - Wird für Logik gebraucht, die CSS nicht kann: z. B. Menü und Chat
 *   als getrennte Ansichten (User Story 5) oder 7 statt 20 sichtbare
 *   Reaktionen.
 * - DestroyRef: entfernt den Listener sauber, wenn der Service endet.
 */
