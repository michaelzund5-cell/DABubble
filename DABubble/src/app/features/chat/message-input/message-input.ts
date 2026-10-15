import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from '../../../core/data/message.service';
import { WorkspaceStateService } from '../../../core/data/workspace-state.service';

@Component({
  selector: 'app-message-input',
  imports: [FormsModule],
  templateUrl: './message-input.html',
  styleUrl: './message-input.scss',
})
export class MessageInput {
  private readonly messageService = inject(MessageService);
  readonly state = inject(WorkspaceStateService);

  text = '';

  send(): void {
    this.messageService.send(this.text, this.state.activeView());
    this.text = '';
  }

  // Enter sends, Shift+Enter creates a new line.
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // Stop the textarea from adding a line break
      this.send();
    }
  }
}

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Das Eingabefeld für neue Nachrichten.
 *
 * - send(): Gibt den Text und den aktuell geöffneten Chat an den
 *   MessageService weiter und leert danach das Feld. Die Component
 *   weiß nicht, wie gespeichert wird. Das ist Aufgabe des Services.
 * - onKeydown(): Enter sendet die Nachricht, Shift+Enter macht eine
 *   neue Zeile. preventDefault() verhindert das normale Verhalten des
 *   Textfelds (Zeilenumbruch).
 */
