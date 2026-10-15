import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from '../../../core/data/message.service';
import { UserService } from '../../../core/data/user.service';
import { WorkspaceStateService } from '../../../core/data/workspace-state.service';

@Component({
  selector: 'app-thread-panel',
  imports: [FormsModule, DatePipe],
  templateUrl: './thread-panel.html',
  styleUrl: './thread-panel.scss',
})
export class ThreadPanel {
  private readonly messageService = inject(MessageService);
  readonly userService = inject(UserService);
  readonly state = inject(WorkspaceStateService);

  replyText = '';

  // The message the thread belongs to, and all replies to it.
  readonly rootMessage = computed(() => {
    const id = this.state.openThreadId();
    return id ? this.messageService.getById(id) : undefined;
  });
  readonly replies = computed(() => {
    const root = this.rootMessage();
    return root ? this.messageService.repliesOf(root.id) : [];
  });

  sendReply(): void {
    const root = this.rootMessage();
    if (!root) return;
    this.messageService.reply(root.id, this.replyText);
    this.replyText = '';
  }
}

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Das Thread-Panel rechts: eine Nachricht und alle Antworten darauf.
 *
 * - rootMessage: computed. Die Ursprungsnachricht des offenen Threads.
 * - replies: computed. Alle Antworten, die über threadId auf diese
 *   Nachricht zeigen. Vorher steckten die Antworten in der Nachricht
 *   selbst, jetzt sind sie eigene Nachrichten.
 * - sendReply(): Schickt die Antwort über den MessageService und leert
 *   das Feld.
 * - Die Logik liegt jetzt in der Component (TypeScript) statt in
 *   verschachtelten @if-Blöcken im HTML. Das macht das HTML lesbarer.
 */
