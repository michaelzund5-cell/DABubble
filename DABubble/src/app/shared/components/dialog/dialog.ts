import { Component, input, output } from '@angular/core';

export type DialogPlacement = 'center' | 'sheet' | 'top-right' | 'channel' | 'members' | 'bottom';

// Frame for every popup: backdrop, white card, closes on backdrop click and Escape.
@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.html',
  styleUrl: './dialog.scss',
  host: {
    '[class]': 'placement()',
    '[class.dim]': 'dim()',
    '(document:keydown.escape)': 'closed.emit()',
  },
})
export class Dialog {
  readonly placement = input<DialogPlacement>('center');
  readonly dim = input(true); // darkened background for real dialogs, not for small menus
  readonly label = input.required<string>();
  readonly closed = output<void>();
}

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Rahmen für alle Fenster (Profil, Channel-Details, Mitglieder,
 * Channel erstellen, Menü oben rechts). So gibt es den Code nur einmal.
 * - placement: Wo das Fenster steht. center = Mitte, top-right = unter
 *   dem Profil oben rechts, channel = unter dem Channel-Titel,
 *   members = unter den Mitglieder-Avataren.
 * - dim: abgedunkelter Hintergrund (Annahme, Figma zeigt nur die
 *   Fenster selbst).
 * - Klick neben das Fenster oder die Escape-Taste schliesst es
 *   (closed). Das ist auch für Tastatur-Nutzer wichtig.
 * - role="dialog" und aria-modal: Screenreader erkennen das Fenster.
 */
