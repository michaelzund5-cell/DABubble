import { Directive, ElementRef, inject, signal, viewChild } from '@angular/core';
import { MentionList, MentionTrigger } from '../mention-list/mention-list';

// Shared logic for text fields with "@person" and "#channel" suggestions.
// Used by the message input and by "Neue Nachricht".
@Directive({ host: { '(document:pointerdown)': 'closeListOutside($event)' } })
export abstract class MentionInput {
  text = '';
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly pickerAnchor = signal<HTMLElement | null>(null); // emoji button of the open picker, null = closed
  readonly trigger = signal<MentionTrigger | null>(null);
  readonly query = signal('');
  private readonly mentionList = viewChild(MentionList);

  abstract send(): void;

  // A click anywhere outside the field closes the @/# list (feedback: overlays close when clicking next to them).
  closeListOutside(event: PointerEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) this.trigger.set(null);
  }

  togglePicker(button: HTMLElement): void {
    this.pickerAnchor.set(this.pickerAnchor() ? null : button);
  }

  // Looks at the last word: "@no" -> trigger '@', query 'no'.
  onTextChange(): void {
    const match = /(^|\s)([@#])([^\s@#]*)$/.exec(this.text);
    this.trigger.set(match ? (match[2] as MentionTrigger) : null);
    this.query.set(match ? match[3] : '');
  }

  // Replaces the started word with the chosen name, e.g. "@no" -> "@Noah Braun ".
  insertMention(label: string): void {
    this.text = this.text.replace(/([@#])[^\s@#]*$/, `$1${label} `);
    this.trigger.set(null);
  }

  // "@" button in the toolbar.
  startMention(): void {
    this.text += this.text && !this.text.endsWith(' ') ? ' @' : '@';
    this.onTextChange();
  }

  // Enter sends, Shift+Enter creates a new line. Escape closes the list.
  // With an open list, Enter picks the first entry instead of sending.
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') this.trigger.set(null);
    if (event.key !== 'Enter' || event.shiftKey) return;
    event.preventDefault();
    if (this.trigger() && this.mentionList()?.pickFirst()) return;
    if (this.text.trim()) this.send();
  }
}

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Gemeinsame Logik für @-Erwähnungen und #-Channels (User Story 4 und 6).
 * - @Directive() abstract class: eine Basisklasse, von der Komponenten
 *   erben (extends). Sie kann selbst nicht angezeigt werden.
 * - onTextChange(): prüft das letzte Wort. Beginnt es mit @ oder #, wird
 *   die Liste mit dem Rest als Suchbegriff geöffnet. Der reguläre
 *   Ausdruck sucht am Textende: Leerzeichen/Anfang, dann @ oder #, dann
 *   beliebige Zeichen ohne Leerzeichen.
 * - insertMention(): ersetzt das angefangene Wort durch den Namen.
 *   $1 im Ersatztext ist das gefundene @ bzw. #.
 * - startMention(): Klick auf das @-Icon fügt ein @ ein.
 * - onKeydown(): Enter sendet, Shift+Enter macht eine neue Zeile. Ist die
 *   Liste offen, wählt Enter den ersten Eintrag (mentionList.pickFirst()).
 * - abstract send(): Jede Unterklasse legt fest, was Senden heißt.
 * - closeListOutside(): Klick ausserhalb des Feldes schliesst die
 *   @/#-Liste. host: '(document:pointerdown)' hört auf jeden Klick auf
 *   der Seite, contains() prüft, ob er im eigenen Element war.
 * - pickerAnchor / togglePicker(): Emoji-Auswahl im Popover, am
 *   Smiley-Button ausgerichtet. null = geschlossen.
 */
