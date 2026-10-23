import { DatePipe } from '@angular/common';
import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChannelService } from '../../../core/data/channel.service';
import { MessageService } from '../../../core/data/message.service';
import { UserService } from '../../../core/data/user.service';
import { WorkspaceStateService } from '../../../core/data/workspace-state.service';
import { ViewportService } from '../../../core/layout/viewport.service';
import { Avatar } from '../../../shared/components/avatar/avatar';
import { EmojiPicker } from '../../../shared/components/emoji-picker/emoji-picker';
import { Popover } from '../../../shared/components/popover/popover';
import { Emoji } from '../../../shared/models/emojis';
import { Message, Reaction } from '../../../shared/models/message.model';
import { EmojiSrcPipe } from '../../../shared/pipes/emoji-src.pipe';
import { MAX_MESSAGE_LENGTH } from '../../../shared/utils/limits';
import { MentionTarget, splitMentions, TextPart } from '../../../shared/utils/mention-parts';

/** One chat message: avatar, name, time, bubble, reactions, thread link, hover menu, edit mode. */
@Component({
  selector: 'app-message-item',
  imports: [Avatar, DatePipe, EmojiPicker, EmojiSrcPipe, FormsModule, Popover],
  templateUrl: './message-item.html',
  styleUrl: './message-item.scss',
  host: {
    '[attr.id]': "'message-' + message().id",
    '[class.own]': 'isOwn()',
    '[class.compact]': 'compact()',
    '[class.editing]': 'editing()',
    '[class.highlight]': 'state.highlightId() === message().id',
  },
})
export class MessageItem {
  readonly maxLength = MAX_MESSAGE_LENGTH;
  readonly messageService = inject(MessageService);
  private readonly userService = inject(UserService);
  private readonly channelService = inject(ChannelService);
  readonly state = inject(WorkspaceStateService);
  private readonly viewport = inject(ViewportService);

  readonly message = input.required<Message>();
  readonly showThreadInfo = input(true);
  readonly compact = input(false); // thread panel: smaller spacing
  readonly openThread = output<string>();

  readonly sender = computed(() => this.userService.displayUser(this.message().senderId));
  readonly isOwn = computed(() => this.messageService.isOwnMessage(this.message().id));
  readonly replies = computed(() => this.messageService.repliesOf(this.message().id));
  readonly lastReplyAt = computed(() => this.replies().at(-1)?.createdAt ?? null);

  /** People and own channels that can be mentioned. Mentions of them become links. */
  private readonly mentionTargets = computed<MentionTarget[]>(() => [
    ...this.userService.users().map((user) => ({ name: user.name, kind: 'user' as const, id: user.id })),
    ...this.channelService.channels().map((channel) => ({ name: channel.name, kind: 'channel' as const, id: channel.id })),
  ]);
  readonly parts = computed(() => splitMentions(this.message().text, this.mentionTargets()));

  /** User story 2: 20 reactions visible on desktop, 7 on mobile and in the thread, then "x weitere". */
  readonly reactionLimit = computed(() => this.compact() || this.viewport.isMobile() ? 7 : 20);
  readonly showAllReactions = signal(false);
  readonly visibleReactions = computed(() => {
    const all = this.message().reactions;
    return this.showAllReactions() ? all : all.slice(0, this.reactionLimit());
  });
  readonly hiddenReactions = computed(() => this.message().reactions.length - this.visibleReactions().length);
  readonly canCollapse = computed(() => this.showAllReactions() && this.message().reactions.length > this.reactionLimit());

  readonly avatarSize = computed(() => this.viewport.isMobile() ? 50 : 70); // Figma: 70 desktop, 50 mobile

  /** The button an open popup belongs to, null when it is closed. */
  readonly pickerAnchor = signal<HTMLElement | null>(null);
  readonly menuAnchor = signal<HTMLElement | null>(null);
  readonly editing = signal(false);
  editText = '';

  /**
   * Adds or removes the own reaction.
   *
   * @param emoji - Emoji ID
   */
  toggleReaction(emoji: string): void {
    this.messageService.toggleReaction(this.message().id, emoji);
  }

  /**
   * Tooltip text: who reacted, "Du" for yourself (user story 2).
   *
   * @param reaction - One emoji with its users
   * @returns e.g. "Sofia Müller und Du haben reagiert"
   */
  reactedBy(reaction: Reaction): string {
    const names = reaction.userIds.map((id) => id === this.userService.currentUser()?.id
      ? 'Du' : this.userService.getById(id)?.name ?? 'Unbekannt');
    if (names.length === 1) return `${names[0]} ${names[0] === 'Du' ? 'hast' : 'hat'} reagiert`;
    return `${names.slice(0, -1).join(', ')} und ${names.at(-1)} haben reagiert`;
  }

  /**
   * Opens or closes the emoji picker.
   *
   * @param button - Button the picker is aligned to
   */
  togglePicker(button: HTMLElement): void {
    this.pickerAnchor.set(this.pickerAnchor() ? null : button);
  }

  /**
   * Opens or closes the message menu.
   *
   * @param button - Button the menu is aligned to
   */
  toggleMenu(button: HTMLElement): void {
    this.menuAnchor.set(this.menuAnchor() ? null : button);
  }

  /**
   * Reacts with the chosen emoji.
   *
   * @param emoji - Chosen emoji
   */
  pickReaction(emoji: Emoji): void {
    this.toggleReaction(emoji.id);
    this.pickerAnchor.set(null);
  }

  /**
   * A mention of a person opens the direct message, a mention of a channel opens the channel.
   *
   * @param part - Clicked mention
   */
  openMention(part: TextPart): void {
    if (!part.id) return;
    this.state.openView(part.kind === 'user' ? 'direct' : 'channel', part.id);
  }

  startEditing(): void {
    this.editText = this.message().text;
    this.menuAnchor.set(null);
    this.editing.set(true);
  }

  saveEdit(): void {
    if (this.messageService.edit(this.message().id, this.editText)) this.editing.set(false);
  }

  /**
   * Adds the emoji to the edited text.
   *
   * @param emoji - Chosen emoji
   */
  insertEmoji(emoji: Emoji): void {
    this.editText += emoji.char;
    this.pickerAnchor.set(null);
  }
}
