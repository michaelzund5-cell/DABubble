import { Component, computed, inject } from '@angular/core';
import { ChannelService } from '../../../core/data/channel.service';
import { MessageService } from '../../../core/data/message.service';
import { UserService } from '../../../core/data/user.service';
import { WorkspaceStateService } from '../../../core/data/workspace-state.service';
import { MessageInput } from '../message-input/message-input';
import { MessageItem } from '../message-item/message-item';

@Component({
  selector: 'app-thread-panel',
  imports: [MessageInput, MessageItem],
  templateUrl: './thread-panel.html',
  styleUrl: './thread-panel.scss',
})
export class ThreadPanel {
  private readonly messageService = inject(MessageService);
  private readonly channelService = inject(ChannelService);
  private readonly userService = inject(UserService);
  readonly state = inject(WorkspaceStateService);

  // The message the thread belongs to, and all replies to it.
  readonly rootMessage = computed(() => {
    const id = this.state.openThreadId();
    return id ? this.messageService.getById(id) : undefined;
  });

  readonly replies = computed(() => {
    const root = this.rootMessage();
    return root ? this.messageService.repliesOf(root.id) : [];
  });

  // "# Entwicklerteam" next to the title, or the person in a direct chat.
  readonly location = computed(() => {
    const root = this.rootMessage();
    if (root?.channelId) return `# ${this.channelService.getById(root.channelId)?.name ?? ''}`;
    const view = this.state.activeView();
    return this.userService.getById(view.id)?.name ?? '';
  });
}

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Logik des Thread-Panels (Figma Seite 15).
 * - rootMessage: die Nachricht, zu der der Thread gehört.
 * - replies: alle Antworten, älteste zuerst.
 * - location: Text neben "Thread", z. B. "# Entwicklerteam".
 * - Nachrichten und Eingabefeld sind dieselben Komponenten wie im Chat
 *   (MessageItem im kompakten Modus, MessageInput mit threadId).
 *   So gibt es den Code nur einmal.
 */
