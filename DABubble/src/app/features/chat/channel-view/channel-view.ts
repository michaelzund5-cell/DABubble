import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChannelService } from '../../../core/data/channel.service';
import { MessageService } from '../../../core/data/message.service';
import { UserService } from '../../../core/data/user.service';
import { WorkspaceStateService } from '../../../core/data/workspace-state.service';
import { User } from '../../../shared/models/user.model';
import { MessageInput } from '../message-input/message-input';

@Component({
  selector: 'app-channel-view',
  imports: [FormsModule, DatePipe, MessageInput],
  templateUrl: './channel-view.html',
  styleUrl: './channel-view.scss',
})
export class ChannelView {
  readonly messageService = inject(MessageService);
  readonly userService = inject(UserService);
  readonly state = inject(WorkspaceStateService);
  private readonly channelService = inject(ChannelService);

  private readonly maxAvatars = 3;

  readonly infoOpen = signal(false);
  readonly editingId = signal<string | null>(null);
  editText = '';

  // Messages of the open chat. Recalculated when the view or the messages change.
  readonly messages = computed(() => this.messageService.messagesFor(this.state.activeView()));

  // Members shown in the header: channel members, or the other person in a direct chat.
  readonly members = computed<User[]>(() => {
    const view = this.state.activeView();
    if (view.type === 'channel') return this.channelService.membersOf(view.id);
    const partner = this.userService.getById(view.id);
    return partner ? [partner] : [];
  });
  readonly visibleMembers = computed(() => this.members().slice(0, this.maxAvatars));
  readonly hiddenMemberCount = computed(() => Math.max(0, this.members().length - this.maxAvatars));

  readonly description = computed(() => {
    const view = this.state.activeView();
    return view.type === 'channel'
      ? this.channelService.getById(view.id)?.description ?? ''
      : 'Private Unterhaltung zwischen zwei Teammitgliedern.';
  });

  startEditing(id: string, text: string): void {
    this.editingId.set(id);
    this.editText = text;
  }

  saveEdit(id: string): void {
    if (this.messageService.edit(id, this.editText)) this.editingId.set(null);
  }

  cancelEdit(): void {
    this.editingId.set(null);
  }

  deleteMessage(id: string): void {
    // Close the thread panel if its root message is deleted.
    if (this.messageService.delete(id) && this.state.openThreadId() === id) this.state.closeThread();
  }
}

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Die Chat-Ansicht: Kopfzeile, Nachrichtenliste und Eingabefeld.
 *
 * - imports: DatePipe formatiert den Zeitstempel als Uhrzeit,
 *   MessageInput ist das Eingabefeld (Kind-Component).
 * - messages: computed. Holt die Nachrichten des geöffneten Chats.
 *   Wechselt der Chat oder kommt eine Nachricht dazu, wird die Liste
 *   automatisch neu berechnet.
 * - members, visibleMembers, hiddenMemberCount: Die Avatare im Kopf
 *   kommen jetzt aus den echten Mitgliedern (vorher fest im HTML).
 *   Es werden höchstens 3 gezeigt, der Rest als "+2" usw.
 *   Math.max(0, ...) verhindert negative Zahlen.
 * - description: Text für die Info-Karte beim Klick auf den Titel.
 * - Bearbeiten: startEditing() merkt sich die Nachricht und den Text,
 *   saveEdit() speichert über den Service, cancelEdit() bricht ab.
 *   editingId ist ein Signal. Ist es gesetzt, zeigt das HTML statt der
 *   Sprechblase ein Textfeld.
 * - deleteMessage(): Löscht über den Service. Ist zu dieser Nachricht
 *   gerade der Thread offen, wird er geschlossen. Das && heißt: Der
 *   rechte Teil wird nur geprüft, wenn das Löschen geklappt hat.
 */
