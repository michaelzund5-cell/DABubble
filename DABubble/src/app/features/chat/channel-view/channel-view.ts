import { afterRenderEffect, Component, computed, ElementRef, inject, viewChild } from '@angular/core';
import { ChannelService } from '../../../core/data/channel.service';
import { MessageService } from '../../../core/data/message.service';
import { UserService } from '../../../core/data/user.service';
import { WorkspaceStateService } from '../../../core/data/workspace-state.service';
import { Avatar } from '../../../shared/components/avatar/avatar';
import { User } from '../../../shared/models/user.model';
import { ActiveView } from '../../../shared/models/view.model';
import { ChatDatePipe } from '../../../shared/pipes/chat-date.pipe';
import { groupByDay } from '../../../shared/utils/group-by-day';
import { ChatIntro } from '../chat-intro/chat-intro';
import { MessageInput } from '../message-input/message-input';
import { MessageItem } from '../message-item/message-item';

// Closer than this to the bottom counts as "reading the newest messages".
const NEAR_BOTTOM_PX = 300;

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
  private readonly list = viewChild<ElementRef<HTMLElement>>('list');
  private lastView: ActiveView | null = null;
  private lastCount = 0;

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

  private readonly messages = computed(() => this.days().flatMap((group) => group.messages));

  constructor() {
    afterRenderEffect(() => this.scrollToNewest(this.state.activeView(), this.messages().length));
  }

  // Runs after the new messages are on screen, so scrollHeight already includes them.
  private scrollToNewest(view: ActiveView, count: number): void {
    const list = this.list()?.nativeElement;
    if (list && this.shouldScroll(list, view, count)) list.scrollTop = list.scrollHeight;
    this.lastView = view;
    this.lastCount = count;
  }

  // Other chat opened or first messages loaded: always. New message: if it is your own or you were already at the bottom.
  private shouldScroll(list: HTMLElement, view: ActiveView, count: number): boolean {
    if (view !== this.lastView || this.lastCount === 0) return true;
    if (count <= this.lastCount) return false;
    const ownMessage = this.messages().at(-1)?.senderId === this.userService.currentUser()?.id;
    return ownMessage || list.scrollHeight - list.scrollTop - list.clientHeight < NEAR_BOTTOM_PX;
  }
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
 * - scrollToNewest(): springt ans Ende der Nachrichten, damit man neue
 *   Nachrichten sieht, ohne selbst zu scrollen. afterRenderEffect läuft
 *   erst, wenn die neuen Nachrichten schon angezeigt sind.
 * - shouldScroll(): Neuer Chat geöffnet oder erste Nachrichten geladen:
 *   immer nach unten. Neue
 *   Nachricht: nur wenn sie von dir ist oder du schon unten warst
 *   (näher als 300 px). Liest du gerade ältere Nachrichten, springt die
 *   Ansicht nicht weg. Reaktionen oder Bearbeiten lösen nichts aus.
 */
