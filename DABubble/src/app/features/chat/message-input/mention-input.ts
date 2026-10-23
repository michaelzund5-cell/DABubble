import { Directive, ElementRef, inject, signal, viewChild } from '@angular/core';
import { MentionList, MentionTrigger } from '../mention-list/mention-list';

/**
 * Shared logic for text fields with `@person` and "#channel" suggestions.
 * Used by the message input and by "Neue Nachricht".
 */
@Directive({ host: { '(document:pointerdown)': 'closeListOutside($event)' } })
export abstract class MentionInput {
  text = '';
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly pickerAnchor = signal<HTMLElement | null>(null); // emoji button of the open picker, null = closed
  readonly trigger = signal<MentionTrigger | null>(null);
  readonly query = signal('');
  private readonly mentionList = viewChild(MentionList);

  abstract send(): void;

  /**
   * A click anywhere outside the field closes the `@`/`#` list.
   * * @param event - Any click on the page
   *
   * @param event - Any click on the page
   */
  closeListOutside(event: PointerEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) this.trigger.set(null);
  }

  /**
   * Opens or closes the emoji picker.
   * * @param button - Emoji button the picker is aligned to
   *
   * @param button - Emoji button the picker is aligned to
   */
  togglePicker(button: HTMLElement): void {
    this.pickerAnchor.set(this.pickerAnchor() ? null : button);
  }

  /** Looks at the last word: `@no` to trigger `@`, query 'no'. */
  onTextChange(): void {
    const match = /(^|\s)([@#])([^\s@#]*)$/.exec(this.text);
    this.trigger.set(match ? (match[2] as MentionTrigger) : null);
    this.query.set(match ? match[3] : '');
  }

  /**
   * Replaces the started word with the chosen name, e.g. `@no` to `@Noah Braun `.
   * * @param label - Name of the chosen person or channel
   *
   * @param label - Name of the chosen person or channel
   */
  insertMention(label: string): void {
    this.text = this.text.replace(/([@#])[^\s@#]*$/, `$1${label} `);
    this.trigger.set(null);
  }

  /** `@` button in the toolbar. */
  startMention(): void {
    this.text += this.text && !this.text.endsWith(' ') ? ' @' : '@';
    this.onTextChange();
  }

  /**
   * Enter sends, Shift+Enter creates a new line. Escape closes the list.
   * With an open list, Enter picks the first entry instead of sending.
   * * @param event - Key pressed in the text field
   *
   * @param event - Key pressed in the text field
   */
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') this.trigger.set(null);
    if (event.key !== 'Enter' || event.shiftKey) return;
    event.preventDefault();
    if (this.trigger() && this.mentionList()?.pickFirst()) return;
    if (this.text.trim()) this.send();
  }
}
