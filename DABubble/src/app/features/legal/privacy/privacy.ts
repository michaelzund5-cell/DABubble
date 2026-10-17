import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface PrivacySection {
  title: string;
  text: string;
}

// Placeholder text from Figma. Replace with the real privacy policy before submission.
const LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque odio felis, iaculis ut massa eget, ' +
  'ornare lacinia urna. In dignissim justo eu velit sagittis, in scelerisque nulla convallis. Vestibulum eros ' +
  'lorem, sollicitudin eget eros non, varius aliquam mauris. Sed turpis ipsum, condimentum quis nulla at, ' +
  'lobortis facilisis ipsum. Nunc erat justo, hendrerit vel enim vitae, feugiat mattis dui. In auctor dignissim ' +
  'luctus. Mauris ornare ipsum at ultrices eleifend. Praesent tempus congue magna. Quisque libero erat, ' +
  'pharetra a neque et, imperdiet semper justo.';

@Component({
  selector: 'app-privacy-page',
  imports: [RouterLink],
  templateUrl: './privacy.html',
  styleUrl: './privacy.scss',
})
export class PrivacyPage {
  readonly sections: readonly PrivacySection[] = [
    { title: 'Subtitle', text: LOREM },
    { title: 'Subtitle', text: LOREM },
    { title: 'Subtitle', text: `${LOREM} ${LOREM}` },
  ];
}

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Logik der Datenschutz-Seite.
 * - Die Abschnitte stehen als Liste im Code (sections), nicht dreimal
 *   kopiert im HTML. Das HTML zeigt sie mit @for an.
 * - interface PrivacySection: legt fest, dass jeder Abschnitt einen
 *   Titel und einen Text hat. TypeScript prüft das beim Bauen.
 * - LOREM: Platzhalter aus Figma. Vor der Abgabe durch die echte
 *   Datenschutzerklärung ersetzen. Dafür nur diese Liste ändern.
 * - Abschnitt 3 ist in Figma doppelt so lang, daher zweimal LOREM.
 */
