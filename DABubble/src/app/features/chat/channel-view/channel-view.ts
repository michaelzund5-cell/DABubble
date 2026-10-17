import { Component, computed, inject } from '@angular/core';
import { ChannelService } from '../../../core/data/channel.service';
import { MessageService } from '../../../core/data/message.service';
import { UserService } from '../../../core/data/user.service';
import { WorkspaceStateService } from '../../../core/data/workspace-state.service';
import { Avatar } from '../../../shared/components/avatar/avatar';
import { User } from '../../../shared/models/user.model';
import { ChatDatePipe } from '../../../shared/pipes/chat-date.pipe';
import { groupByDay } from '../../../shared/utils/group-by-day';
import { ChatIntro } from '../chat-intro/chat-intro';
import { MessageInput } from '../message-input/message-input';
import { MessageItem } from '../message-item/message-item';

// Chat of a channel or a direct conversation (Figma pages 17, 19, 21-26).
@Component({
  selector: 'app-channel-view',
  imports: [Avatar, ChatDatePipe, ChatIntro, MessageInput, MessageItem],
  templateUrl: './channel-view.html',
  styleUrl: './channel-view.scss',
})
export class ChannelView {
  private readonly messageService = inject(MessageService);
  private readonly channelService = inject(ChannelService);
  private readonly userService = inject(UserService);
  readonly state = inject(WorkspaceStateService);

  private readonly maxAvatars = 3;

  readonly channel = computed(() => {
    const view = this.state.activeView();
    return view.type === 'channel' ? this.channelService.getById(view.id) : undefined;
  });

  readonly partner = computed(() => {
    const view = this.state.activeView();
    return view.type === 'direct' ? this.userService.getById(view.id) : undefined;
  });

  readonly isSelf = computed(() => this.partner()?.id === this.userService.currentUser()?.id);

  readonly days = computed(() => groupByDay(this.messageService.messagesFor(this.state.activeView())));

  readonly members = computed<User[]>(() => {
    const channel = this.channel();
    return channel ? this.channelService.membersOf(channel.id) : [];
  });

  readonly visibleMembers = computed(() => this.members().slice(0, this.maxAvatars));
}

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Logik der Chat-Ansicht (Channel oder Direktnachricht).
 * - channel / partner: Was ist offen? Ein Channel oder eine Person.
 *   Eines davon ist immer undefined.
 * - isSelf: Direktnachricht an dich selbst, Figma zeigt dann "(Du)".
 * - days: Nachrichten des offenen Chats, nach Tagen gruppiert, für die
 *   Datums-Trennlinien ("Dienstag, 14 Januar", "Heute"). Ist die Liste
 *   leer, zeigt <app-chat-intro> den Begrüssungstext (Figma 19, 21-26).
 * - members / visibleMembers: Mitglieder für die Avatare in der
 *   Kopfzeile, höchstens 3 sichtbar (Figma). Die Zahl daneben zeigt
 *   alle Mitglieder.
 */
