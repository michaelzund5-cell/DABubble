import { Component, output, signal } from '@angular/core';

const STORAGE_KEY = 'dabubble-intro-shown';

// Start animation (Figma pages 1 and 34): logo in the middle, text slides out, logo moves to its place.
@Component({
  selector: 'app-intro-splash',
  templateUrl: './intro-splash.html',
  styleUrl: './intro-splash.scss',
})
export class IntroSplash {
  readonly finished = output<void>();
  readonly visible = signal(shouldPlay());

  // Called when the last animation (fade-out of the background) has ended.
  // Only the event of the background itself counts, not the bubbled ones of the logo.
  onAnimationEnd(event: AnimationEvent): void {
    if (event.target !== event.currentTarget) return;
    this.visible.set(false);
    rememberShown();
    this.finished.emit();
  }
}

// Plays once per browser tab and never for users who prefer less motion.
function shouldPlay(): boolean {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  try {
    return sessionStorage.getItem(STORAGE_KEY) !== '1';
  } catch {
    return true;
  }
}

function rememberShown(): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, '1');
  } catch {
    // Private mode: the intro may play again next time, that is fine.
  }
}

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Start-Animation auf der Anmeldeseite (Figma Seiten 1 und 34).
 * - Lila Hintergrund, Logo-Symbol in der Mitte. Der Schriftzug
 *   "DABubble" gleitet hinter dem Symbol hervor, dann wandert das Logo
 *   an seinen Platz (Desktop oben links, Handy oben mittig) und der
 *   Hintergrund verschwindet.
 * - Läuft nur einmal pro Browser-Tab (sessionStorage). Zugriffe in
 *   try/catch, weil sessionStorage im privaten Modus Fehler werfen kann.
 * - prefers-reduced-motion: Wer im System "weniger Bewegung" eingestellt
 *   hat, sieht keine Animation (Barrierefreiheit).
 * - onAnimationEnd(): Nach der letzten Animation wird die Ebene entfernt.
 */
