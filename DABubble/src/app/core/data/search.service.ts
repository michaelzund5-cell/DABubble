import { computed, inject, Injectable, signal } from '@angular/core';
import { Message } from '../../shared/models/message.model';
import { User } from '../../shared/models/user.model';
import { ActiveView } from '../../shared/models/view.model';
import { SessionService } from '../auth/session.service';
import { ChannelService } from './channel.service';
import { MessageService } from './message.service';
import { UserService } from './user.service';

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

// Search over channels, people and messages (user story "Schreiben" 6).
@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly session = inject(SessionService);
  private readonly channelService = inject(ChannelService);
  private readonly userService = inject(UserService);
  private readonly messageService = inject(MessageService);
  private readonly maxResults = 8;

  readonly term = signal('');

  // "#" only channels, "@" only people, otherwise channels, people and messages.
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

  private channelHits(query: string): SearchResult[] {
    return this.channelService.myChannels()
      .filter((channel) => channel.name.toLowerCase().includes(query))
      .slice(0, this.maxResults)
      .map((channel) => ({
        kind: 'channel', key: `c-${channel.id}`, view: { type: 'channel', id: channel.id }, label: channel.name,
      }));
  }

  private userHits(query: string): SearchResult[] {
    return this.userService.users()
      .filter((user) => user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query))
      .slice(0, this.maxResults)
      .map((user) => ({
        kind: 'user', key: `u-${user.id}`, view: { type: 'direct', id: user.id }, label: user.name, user,
      }));
  }

  // Only messages the user may read: own channels and own direct chats.
  private messageHits(query: string): SearchResult[] {
    return this.messageService.messages()
      .filter((message) => message.text.toLowerCase().includes(query) && this.canRead(message))
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, this.maxResults)
      .map((message) => this.toMessageResult(message));
  }

  private canRead(message: Message): boolean {
    const userId = this.session.currentUserId() ?? '';
    if (message.channelId) return this.channelService.isMember(message.channelId);
    return !!message.directChatId?.split('_').includes(userId);
  }

  private toMessageResult(message: Message): SearchResult {
    const sender = this.userService.getById(message.senderId);
    return {
      kind: 'message', key: `m-${message.id}`, view: this.viewOf(message), label: message.text, user: sender,
      context: `${this.placeOf(message)} · ${sender?.name ?? ''}`, messageId: message.id, threadId: message.threadId,
    };
  }

  private viewOf(message: Message): ActiveView {
    if (message.channelId) return { type: 'channel', id: message.channelId };
    const userId = this.session.currentUserId() ?? '';
    const partnerId = message.directChatId?.split('_').slice(1).find((id) => id !== userId) ?? userId;
    return { type: 'direct', id: partnerId };
  }

  private placeOf(message: Message): string {
    if (message.channelId) return `# ${this.channelService.getById(message.channelId)?.name ?? ''}`;
    return this.userService.getById(this.viewOf(message).id)?.name ?? 'Direktnachricht';
  }
}

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Suche im Header (User Story "Nachrichten suchen").
 * - term: der eingegebene Text. results wird bei jeder Änderung neu
 *   berechnet (computed), die Liste ist also in Echtzeit aktuell.
 * - "#..." zeigt nur Channels, "@..." nur Personen (Dropdown wie in der
 *   Checkliste verlangt). Ohne Zeichen: Channels, Personen, Nachrichten.
 * - Nachrichten-Treffer zeigen den Kontext: Ort (# Channel oder Person)
 *   und Absender. Klick öffnet den Chat, bei Thread-Antworten auch den
 *   Thread.
 * - canRead(): Nur Nachrichten aus eigenen Channels und eigenen
 *   Direktnachrichten. Mit Firebase sichern das die Firestore-Regeln.
 * - directChatId hat die Form "dm_u1_u2", deshalb split('_').
 */
