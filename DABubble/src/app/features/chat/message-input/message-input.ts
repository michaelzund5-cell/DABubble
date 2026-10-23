import { Component, computed, effect, ElementRef, inject, input, output, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChannelService } from '../../../core/data/channel.service';
import { MessageService } from '../../../core/data/message.service';
import { UserService } from '../../../core/data/user.service';
import { WorkspaceStateService } from '../../../core/data/workspace-state.service';
import { EmojiPicker } from '../../../shared/components/emoji-picker/emoji-picker';
import { Popover } from '../../../shared/components/popover/popover';
import { Emoji } from '../../../shared/models/emojis';
import { ActiveView } from '../../../shared/models/view.model';
import { MAX_MESSAGE_LENGTH } from '../../../shared/utils/limits';
import { MentionList } from '../mention-list/mention-list';
import { MentionInput } from './mention-input';

/** Text field for messages and thread replies, with emojis and mentions. */
@Component({
  selector: 'app-message-input',
  imports: [FormsModule, EmojiPicker, MentionList, Popover],
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

  /** In "Neue Nachricht" sending is only possible once a valid recipient is entered. */
  readonly hasTarget = computed(() => this.state.activeView().type !== 'new' || !!this.targetView());

  readonly placeholder = computed(() => this.placeholderText());

  private readonly field = viewChild<ElementRef<HTMLTextAreaElement>>('field');

  /** A new chat or thread: put the cursor into the field ("Schreiben" user story 1). */
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

  /**
   * Adds the emoji to the text.
   * * @param emoji - Chosen emoji
   *
   * @param emoji - Chosen emoji
   */
  insertEmoji(emoji: Emoji): void {
    this.text += emoji.char;
    this.pickerAnchor.set(null);
  }

  /**
   * Figma: "Nachricht an #Entwicklerteam" / "Nachricht an Sofia Müller" / "Antworten..." / "Starte eine neue Nachricht"
   * * @returns Placeholder for the open chat or thread
   *
   * @returns Placeholder for the open chat or thread
   */
  private placeholderText(): string {
    const view = this.state.activeView();
    if (this.threadId()) return 'Antworten...';
    if (view.type === 'new') return 'Starte eine neue Nachricht';
    if (view.type === 'channel') return `Nachricht an #${this.channelService.getById(view.id)?.name ?? ''}`;
    return `Nachricht an ${this.userService.getById(view.id)?.name ?? ''}`;
  }
}
