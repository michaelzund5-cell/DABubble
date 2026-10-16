import { Component, input } from '@angular/core';

// Speech-bubble notice from Figma ("Konto erfolgreich erstellt!", "E-Mail gesendet").
@Component({
  selector: 'app-toast',
  templateUrl: './toast.html',
  styleUrl: './toast.scss',
})
export class Toast {
  readonly text = input.required<string>();
  readonly icon = input<string>(); // optional image path, e.g. the send icon
}

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Wiederverwendbare Bubble-Komponente.
 * - input.required<string>(): Der Text MUSS übergeben werden, sonst meldet
 *   Angular schon beim Bauen einen Fehler.
 * - input<string>(): Das Icon ist optional.
 * - Benutzung: <app-toast text="E-Mail gesendet" icon="img/icons/send.svg" />
 */
