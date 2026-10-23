import { Component, input, output } from '@angular/core';

/** Where a dialog appears on the screen. */
export type DialogPlacement = 'center' | 'sheet' | 'top-right' | 'channel' | 'members' | 'bottom';

/** Frame for every popup: backdrop, white card, closes on backdrop click and Escape. */
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
