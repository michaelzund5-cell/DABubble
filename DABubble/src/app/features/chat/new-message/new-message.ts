import { afterNextRender, Component, computed, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChannelService } from '../../../core/data/channel.service';
import { UserService } from '../../../core/data/user.service';
import { WorkspaceStateService } from '../../../core/data/workspace-state.service';
import { ActiveView } from '../../../shared/models/view.model';
import { MentionList } from '../mention-list/mention-list';
import { MessageInput } from '../message-input/message-input';
import { MentionInput } from '../message-input/mention-input';

// "Neue Nachricht" (Figma page 20): choose a recipient, then write the first message.
@Component({
  selector: 'app-new-message',
  imports: [FormsModule, MentionList, MessageInput],
  templateUrl: './new-message.html',
  styleUrl: './new-message.scss',
})
export class NewMessage extends MentionInput {
  private readonly channelService = inject(ChannelService);
  private readonly userService = inject(UserService);
  private readonly state = inject(WorkspaceStateService);

  private readonly recipient = signal('');
  private readonly recipientField = viewChild<ElementRef<HTMLInputElement>>('recipientField');

  constructor() {
    super();
    afterNextRender(() => this.recipientField()?.nativeElement.focus());
  }

  // "#Entwicklerteam", "@Sofia Müller" or "sofia@dabubble.ch" -> chat to open, or null.
  readonly target = computed<ActiveView | null>(() => {
    const value = this.recipient().trim().toLowerCase();
    if (value.startsWith('#')) return this.channelTarget(value.slice(1));
    const user = this.userService.users().find((person) =>
      `@${person.name.toLowerCase()}` === value || person.email.toLowerCase() === value);
    return user ? { type: 'direct', id: user.id } : null;
  });

  readonly showError = computed(() => !!this.recipient().trim() && !this.trigger() && !this.target());

  onRecipientChange(): void {
    this.onTextChange();
    this.recipient.set(this.text);
  }

  pick(label: string): void {
    this.insertMention(label);
    this.recipient.set(this.text);
  }

  // Enter in the recipient field does not send anything, the message is written below.
  send(): void {
    this.trigger.set(null);
  }

  openChat(view: ActiveView): void {
    this.state.openView(view.type, view.id);
  }

  // Only channels the user is a member of can receive a message.
  private channelTarget(name: string): ActiveView | null {
    const channel = this.channelService.myChannels().find((item) => item.name.toLowerCase() === name);
    return channel ? { type: 'channel', id: channel.id } : null;
  }
}

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Ansicht "Neue Nachricht" (Figma Seite 20), geöffnet über den Stift in
 * der Sidebar.
 * - Oben das Feld "An:". Mit # erscheint die Channel-Liste, mit @ die
 *   Personen-Liste (geerbt von MentionInput). Eine E-Mail-Adresse geht
 *   auch.
 * - target: wandelt die Eingabe in einen Chat um (Channel oder Person).
 *   Ist nichts Passendes gefunden, ist es null und Senden bleibt gesperrt.
 * - showError: Hinweis, wenn der Empfänger nicht existiert (Annahme,
 *   in Figma nicht gezeigt).
 * - Channels: nur solche, in denen du Mitglied bist.
 * - afterNextRender(): Sobald die Ansicht da ist, steht der Cursor im
 *   Feld "An:".
 * - openChat(): Nach dem Senden springt die Ansicht in den Chat, in dem
 *   die Nachricht jetzt steht.
 */
