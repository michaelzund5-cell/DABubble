import { afterNextRender, Component, ElementRef, input, output, signal, viewChild } from '@angular/core';

const GAP = 8; // space between the button and the popup
const MARGIN = 16; // the popup keeps this distance to the screen edge

// Popup next to a button (emoji picker, message menu). Fixed on the screen, so no scroll area can cut it off.
// Clicking next to it, Escape or resizing the window closes it.
@Component({
  selector: 'app-popover',
  templateUrl: './popover.html',
  styleUrl: './popover.scss',
  host: { '(document:keydown.escape)': 'closed.emit()', '(window:resize)': 'closed.emit()' },
})
export class Popover {
  readonly anchor = input.required<HTMLElement>(); // the button that opened the popup
  readonly label = input.required<string>();
  readonly closed = output<void>();

  private readonly card = viewChild.required<ElementRef<HTMLElement>>('card');
  readonly position = signal<{ top: number; left: number } | null>(null);

  constructor() {
    afterNextRender(() => this.place());
  }

  // Below the button. Opens towards the middle of the screen: left-aligned with a button on the left half,
  // right-aligned with a button on the right half. Moves up or sideways when there is not enough room.
  private place(): void {
    const button = this.anchor().getBoundingClientRect();
    const card = this.card().nativeElement.getBoundingClientRect();
    const fitsBelow = button.bottom + GAP + card.height <= window.innerHeight - MARGIN;
    const top = fitsBelow ? button.bottom + GAP : button.top - GAP - card.height;
    const onLeftHalf = button.left + button.width / 2 < window.innerWidth / 2;
    const left = onLeftHalf ? button.left : button.right - card.width;
    this.position.set({
      top: clamp(top, window.innerHeight - card.height),
      left: clamp(left, window.innerWidth - card.width),
    });
  }
}

// Keeps a value between the left/top margin and the largest value that still fits on the screen.
function clamp(value: number, max: number): number {
  return Math.max(MARGIN, Math.min(value, max - MARGIN));
}

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Kleines Popup neben einem Button (Emoji-Auswahl, Menü einer
 * Nachricht). Feedback: Popups wurden im Thread abgeschnitten und
 * schlossen sich nicht beim Klick daneben.
 * - position: fixed (scss): Das Popup liegt über der ganzen Seite. Kein
 *   Bereich mit overflow (Chat, Thread) kann es mehr abschneiden.
 * - place(): misst nach dem ersten Anzeigen den Button (anchor) und das
 *   Popup. Normal unter dem Button. Es öffnet sich zur Bildschirmmitte
 *   hin: Button links = linksbündig, Button rechts = rechtsbündig.
 *   Passt es unten nicht, geht es nach oben. clamp() hält es immer 16 px vom Bildschirmrand.
 * - Bis die Position berechnet ist, ist das Popup unsichtbar (kein
 *   kurzes Springen).
 * - Schliessen: Klick auf die unsichtbare Fläche daneben (backdrop),
 *   Escape oder wenn sich die Fenstergrösse ändert.
 */
