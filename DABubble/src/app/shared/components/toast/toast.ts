import { Component, input } from '@angular/core';

/** Speech-bubble notice from Figma ("Konto erfolgreich erstellt!", "E-Mail gesendet"). */
@Component({
  selector: 'app-toast',
  templateUrl: './toast.html',
  styleUrl: './toast.scss',
})
export class Toast {
  readonly text = input.required<string>();
  readonly icon = input<string>(); // optional image path, e.g. the send icon
}
