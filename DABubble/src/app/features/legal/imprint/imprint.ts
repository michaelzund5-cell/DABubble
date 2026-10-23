import { Location } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Imprint page (Figma page 32). */
@Component({
  selector: 'app-imprint-page',
  imports: [RouterLink],
  templateUrl: './imprint.html',
  styleUrl: './imprint.scss',
})
export class ImprintPage {
  private readonly location = inject(Location);

  /** Back to the page the user came from (login, register, ...). */
  goBack(): void {
    this.location.back();
  }
}
