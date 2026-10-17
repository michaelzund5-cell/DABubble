import { DatePipe } from '@angular/common';
import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from '../../../core/data/message.service';
import { UserService } from '../../../core/data/user.service';
import { WorkspaceStateService } from '../../../core/data/workspace-state.service';
import { ViewportService } from '../../../core/layout/viewport.service';
import { Avatar } from '../../../shared/components/avatar/avatar';
import { EmojiPicker } from '../../../shared/components/emoji-picker/emoji-picker';
import { Emoji } from '../../../shared/models/emojis';
import { Message, Reaction } from '../../../shared/models/message.model';
import { EmojiSrcPipe } from '../../../shared/pipes/emoji-src.pipe';
import { MAX_MESSAGE_LENGTH } from '../../../shared/utils/limits';

// One chat message: avatar, name, time, bubble, reactions, thread link, hover menu, edit mode.
@Component({
  selector: 'app-message-item',
  imports: [Avatar, DatePipe, EmojiPicker, EmojiSrcPipe, FormsModule],
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
  readonly state = inject(WorkspaceStateService);
  private readonly viewport = inject(ViewportService);

  readonly message = input.required<Message>();
  readonly showThreadInfo = input(true);
  readonly compact = input(false); // thread panel: smaller spacing
  readonly openThread = output<string>();

  readonly sender = computed(() => this.userService.getById(this.message().senderId));
  readonly isOwn = computed(() => this.messageService.isOwnMessage(this.message().id));
  readonly replies = computed(() => this.messageService.repliesOf(this.message().id));
  readonly lastReplyAt = computed(() => this.replies().at(-1)?.createdAt ?? null);

  // User story 2: 20 reactions visible on desktop, 7 on mobile and in the thread, then "x weitere".
  readonly reactionLimit = computed(() => this.compact() || this.viewport.isMobile() ? 7 : 20);
  readonly showAllReactions = signal(false);
  readonly visibleReactions = computed(() => {
    const all = this.message().reactions;
    return this.showAllReactions() ? all : all.slice(0, this.reactionLimit());
  });
  readonly hiddenReactions = computed(() => this.message().reactions.length - this.visibleReactions().length);
  readonly canCollapse = computed(() => this.showAllReactions() && this.message().reactions.length > this.reactionLimit());

  readonly avatarSize = computed(() => this.viewport.isMobile() ? 50 : 70); // Figma: 70 desktop, 50 mobile

  readonly pickerOpen = signal(false);
  readonly menuOpen = signal(false);
  readonly editing = signal(false);
  editText = '';

  toggleReaction(emoji: string): void {
    this.messageService.toggleReaction(this.message().id, emoji);
  }

  // Tooltip text: who reacted, "Du" for yourself (user story 2).
  reactedBy(reaction: Reaction): string {
    const names = reaction.userIds.map((id) => id === this.userService.currentUser()?.id
      ? 'Du' : this.userService.getById(id)?.name ?? 'Unbekannt');
    if (names.length === 1) return `${names[0]} ${names[0] === 'Du' ? 'hast' : 'hat'} reagiert`;
    return `${names.slice(0, -1).join(', ')} und ${names.at(-1)} haben reagiert`;
  }

  pickReaction(emoji: Emoji): void {
    this.toggleReaction(emoji.id);
    this.pickerOpen.set(false);
  }

  startEditing(): void {
    this.editText = this.message().text;
    this.menuOpen.set(false);
    this.editing.set(true);
  }

  saveEdit(): void {
    if (this.messageService.edit(this.message().id, this.editText)) this.editing.set(false);
  }

  insertEmoji(emoji: Emoji): void {
    this.editText += emoji.char;
    this.pickerOpen.set(false);
  }
}

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Eine einzelne Nachricht (Figma Seiten 15, 17, 27).
 * - host: setzt Klassen am Element. "own" spiegelt die eigene Nachricht
 *   nach rechts, "compact" ist der Thread-Modus, "editing" der
 *   Bearbeiten-Modus (hellgrauer Hintergrund, Figma Seite 27).
 * - computed(): sender, isOwn, replies, lastReplyAt rechnen sich neu,
 *   sobald sich Daten ändern. replies().at(-1) = neueste Antwort.
 * - Hover-Leiste: zwei zuletzt genutzte Emojis, Emoji-Auswahl, Thread,
 *   und bei eigenen Nachrichten "Nachricht bearbeiten".
 * - pickReaction(): Reaktion aus der Auswahl. insertEmoji(): Emoji beim
 *   Bearbeiten in den Text einfügen. Dieselbe Auswahl-Komponente.
 * - saveEdit(): Der Service prüft selbst, ob die Nachricht dir gehört.
 * - Reaktionen (User Story 2): Desktop zeigt bis 20, Handy und Thread
 *   bis 7 (reactionLimit). Der Rest versteckt sich hinter "x weitere",
 *   aufgeklappt gibt es "Weniger anzeigen" (Figma Seiten 12, 13).
 * - reactedBy(): Text für das Hover-Feld, z. B. "Sofia Müller und Du
 *   haben reagiert".
 * - maxLength: höchstens 4000 Zeichen pro Nachricht (shared/utils/limits.ts).
 */
