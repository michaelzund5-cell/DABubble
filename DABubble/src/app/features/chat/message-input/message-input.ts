import { Component, computed, effect, ElementRef, inject, input, output, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChannelService } from '../../../core/data/channel.service';
import { MessageService } from '../../../core/data/message.service';
import { UserService } from '../../../core/data/user.service';
import { WorkspaceStateService } from '../../../core/data/workspace-state.service';
import { EmojiPicker } from '../../../shared/components/emoji-picker/emoji-picker';
import { Emoji } from '../../../shared/models/emojis';
import { ActiveView } from '../../../shared/models/view.model';
import { MAX_MESSAGE_LENGTH } from '../../../shared/utils/limits';
import { MentionList } from '../mention-list/mention-list';
import { MentionInput } from './mention-input';

@Component({
  selector: 'app-message-input',
  imports: [FormsModule, EmojiPicker, MentionList],
  templateUrl: './message-input.html',
  styleUrl: './message-input.scss',
  host: { '[class.narrow]': 'narrow()', '[class.thread]': '!!threadId()' },
})
export class MessageInput extends MentionInput {
  readonly maxLength = MAX_MESSAGE_LENGTH;
  private readonly messageService = inject(MessageService);
  private readonly channelService = inject(ChannelService);
  private readonly userService = inject(UserService);
  private readonly state = inject(WorkspaceStateService);

  readonly threadId = input<string | null>(null); // set: the input answers in this thread
  readonly narrow = input(false); // Figma page 15: smaller margins while a thread is open
  readonly targetView = input<ActiveView | null>(null); // "Neue Nachricht": recipient chosen above
  readonly sent = output<ActiveView>();

  // In "Neue Nachricht" sending is only possible once a valid recipient is entered.
  readonly hasTarget = computed(() => this.state.activeView().type !== 'new' || !!this.targetView());

  readonly placeholder = computed(() => this.placeholderText());

  private readonly field = viewChild<ElementRef<HTMLTextAreaElement>>('field');

  // A new chat or thread: put the cursor into the field ("Schreiben" user story 1).
  private readonly focusTarget = computed(() => this.threadId() ?? this.state.activeView());

  constructor() {
    super();
    effect(() => {
      const target = this.focusTarget();
      if (typeof target === 'string' || target.type !== 'new') this.field()?.nativeElement.focus();
    });
  }

  send(): void {
    const id = this.threadId();
    const view = this.targetView() ?? this.state.activeView();
    if (!this.hasTarget()) return;
    if (id) this.messageService.reply(id, this.text);
    else this.messageService.send(this.text, view);
    this.text = '';
    this.sent.emit(view);
  }

  insertEmoji(emoji: Emoji): void {
    this.text += emoji.char;
    this.pickerOpen.set(false);
  }

  // Figma: "Nachricht an #Entwicklerteam" / "Nachricht an Sofia Müller" / "Antworten..." / "Starte eine neue Nachricht"
  private placeholderText(): string {
    const view = this.state.activeView();
    if (this.threadId()) return 'Antworten...';
    if (view.type === 'new') return 'Starte eine neue Nachricht';
    if (view.type === 'channel') return `Nachricht an #${this.channelService.getById(view.id)?.name ?? ''}`;
    return `Nachricht an ${this.userService.getById(view.id)?.name ?? ''}`;
  }
}

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Eingabefeld für Nachrichten und Thread-Antworten.
 * - extends MentionInput: übernimmt die Logik für @ und # (Liste mit
 *   Personen bzw. Channels beim Tippen). Steht in mention-input.ts,
 *   weil auch "Neue Nachricht" sie nutzt.
 * - threadId: Ist sie gesetzt, antwortet das Feld im Thread.
 * - narrow: kleinerer Rand bei offenem Thread (Figma Seite 15).
 * - targetView: Empfänger aus "Neue Nachricht". Ohne gültigen Empfänger
 *   ist Senden gesperrt (hasTarget).
 * - sent: meldet nach dem Senden, wohin die Nachricht ging. "Neue
 *   Nachricht" öffnet dann diesen Chat.
 * - placeholder: Text im leeren Feld, je nach Ort (Figma).
 * - effect() mit focusTarget: Wechselt der Chat oder öffnet ein Thread,
 *   springt der Cursor ins Feld (Checkliste: Fokus beim Wechsel). Bei
 *   "Neue Nachricht" bekommt zuerst das Empfänger-Feld den Fokus.
 * - insertEmoji(): hängt das Emoji-Zeichen an den Text an.
 * - maxLength: höchstens 4000 Zeichen pro Nachricht (shared/utils/limits.ts).
 */
