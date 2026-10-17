import { Location } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-imprint-page',
  imports: [RouterLink],
  templateUrl: './imprint.html',
  styleUrl: './imprint.scss',
})
export class ImprintPage {
  private readonly location = inject(Location);

  // Back to the page the user came from (login, register, ...).
  goBack(): void {
    this.location.back();
  }
}

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Logik des Impressums.
 * - Location: Angular-Dienst für den Browser-Verlauf.
 * - goBack(): wie der Zurück-Button im Browser. Das Impressum ist von
 *   mehreren Seiten aus erreichbar, deshalb kein fester Link.
 */
