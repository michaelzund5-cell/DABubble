import { computed, inject, Injectable, signal } from '@angular/core';
import { Message } from '../../shared/models/message.model';
import { User } from '../../shared/models/user.model';
import { ActiveView } from '../../shared/models/view.model';
import { SessionService } from '../auth/session.service';
import { ChannelService } from './channel.service';
import { MessageService } from './message.service';
import { UserService } from './user.service';

/** One entry in the search results: a channel, a person or a message. */
export interface SearchResult {
  kind: 'channel' | 'user' | 'message';
  key: string; // unique for @for track
  view: ActiveView; // chat that opens on click
  label: string;
  context?: string; // messages: "# Entwicklerteam · Noah Braun"
  user?: User; // users and message senders: shown with avatar
  messageId?: string;
  threadId?: string; // set when the hit is a thread reply
}

/** Search over channels, people and messages (user story "Schreiben" 6). */
@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly session = inject(SessionService);
  private readonly channelService = inject(ChannelService);
  private readonly userService = inject(UserService);
  private readonly messageService = inject(MessageService);
  private readonly maxResults = 8;

  readonly term = signal('');

  /** "#" only channels, `@` only people, otherwise channels, people and messages. */
  readonly results = computed<SearchResult[]>(() => {
    const raw = this.term().trim();
    const query = raw.replace(/^[#@]/, '').toLowerCase();
    if (raw.startsWith('#')) return this.channelHits(query);
    if (raw.startsWith('@')) return this.userHits(query);
    if (!query) return [];
    return [...this.channelHits(query), ...this.userHits(query), ...this.messageHits(query)];
  });

  clear(): void {
    this.term.set('');
  }

  /**
   * Own channels that match.
   *
   * @param query - Search text in lower case
   * @returns Matching channels
   */
  private channelHits(query: string): SearchResult[] {
    return this.channelService.myChannels()
      .filter((channel) => channel.name.toLowerCase().includes(query))
      .slice(0, this.maxResults)
      .map((channel) => ({
        kind: 'channel', key: `c-${channel.id}`, view: { type: 'channel', id: channel.id }, label: channel.name,
      }));
  }

  /**
   * People that match.
   *
   * @param query - Search text in lower case
   * @returns Matching people
   */
  private userHits(query: string): SearchResult[] {
    return this.userService.users()
      .filter((user) => user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query))
      .slice(0, this.maxResults)
      .map((user) => ({
        kind: 'user', key: `u-${user.id}`, view: { type: 'direct', id: user.id }, label: user.name, user,
      }));
  }

  /**
   * Only messages the user may read: own channels and own direct chats.
   *
   * @param query - Search text in lower case
   * @returns Matching messages
   */
  private messageHits(query: string): SearchResult[] {
    return this.messageService.messages()
      .filter((message) => message.text.toLowerCase().includes(query) && this.canRead(message))
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, this.maxResults)
      .map((message) => this.toMessageResult(message));
  }

  /**
   * Checks if the user may see the message.
   *
   * @param message - A loaded message
   * @returns true for own channels and own direct chats
   */
  private canRead(message: Message): boolean {
    const userId = this.session.currentUserId() ?? '';
    if (message.channelId) return this.channelService.isMember(message.channelId);
    return !!message.directChatId?.split('_').includes(userId);
  }

  /**
   * Builds the result entry of a message.
   *
   * @param message - Matching message
   * @returns Search result with context
   */
  private toMessageResult(message: Message): SearchResult {
    const sender = this.userService.getById(message.senderId);
    return {
      kind: 'message', key: `m-${message.id}`, view: this.viewOf(message), label: message.text, user: sender,
      context: `${this.placeOf(message)} · ${sender?.name ?? ''}`, messageId: message.id, threadId: message.threadId,
    };
  }

  /**
   * Where a message is shown.
   *
   * @param message - A message
   * @returns The channel or direct chat view
   */
  private viewOf(message: Message): ActiveView {
    if (message.channelId) return { type: 'channel', id: message.channelId };
    const userId = this.session.currentUserId() ?? '';
    const partnerId = message.directChatId?.split('_').slice(1).find((id) => id !== userId) ?? userId;
    return { type: 'direct', id: partnerId };
  }

  /**
   * Short label of the place.
   *
   * @param message - A message
   * @returns e.g. "#Allgemein" or the name of the person
   */
  private placeOf(message: Message): string {
    if (message.channelId) return `# ${this.channelService.getById(message.channelId)?.name ?? ''}`;
    return this.userService.getById(this.viewOf(message).id)?.name ?? 'Direktnachricht';
  }
}
