import { computed, inject, Injectable, signal } from '@angular/core';
import { ActiveView, DialogType, ViewType } from '../../shared/models/view.model';
import { PUBLIC_CHANNEL_ID } from '../auth/profile-setup';
import { ChannelService } from './channel.service';
import { UserService } from './user.service';

/**
 * UI state of the workspace: which chat is open and which thread is open.
 * This is NOT data from the database, only what the user is currently looking at.
 */
@Injectable({ providedIn: 'root' })
export class WorkspaceStateService {
  private readonly channelService = inject(ChannelService);
  private readonly userService = inject(UserService);

  readonly activeView = signal<ActiveView>({ type: 'channel', id: PUBLIC_CHANNEL_ID });
  readonly openThreadId = signal<string | null>(null);
  readonly mobileChatOpen = signal(false); // mobile: chat instead of the menu (user story 5)
  readonly dialog = signal<DialogType | null>(null);
  readonly profileUserId = signal<string | null>(null); // whose profile the 'profile' dialog shows
  readonly highlightId = signal<string | null>(null); // message found by the search

  /** Title above the chat: "# channel-name" or the name of the other person. */
  readonly activeTitle = computed(() => {
    const view = this.activeView();
    if (view.type === 'channel') return `# ${this.channelService.getById(view.id)?.name ?? 'Channel'}`;
    return this.userService.getById(view.id)?.name ?? 'Direktnachricht';
  });

  /**
   * Opens a channel, a direct chat or "new message".
   *
   * @param type - channel, direct or new
   * @param id - Channel or user ID
   */
  openView(type: ViewType, id: string): void {
    this.activeView.set({ type, id });
    this.openThreadId.set(null); // A thread from the previous chat makes no sense here
    this.mobileChatOpen.set(true);
  }

  /** After leaving a channel: first own channel, or "Neue Nachricht" if there is none. */
  openFirstChannel(): void {
    const first = this.channelService.myChannels()[0];
    if (first) this.openView('channel', first.id);
    else this.openNewMessage();
  }

  /** Figma page 20: "Neue Nachricht" (pencil icon in the sidebar). */
  openNewMessage(): void {
    this.openView('new', '');
  }

  /**
   * Opens the thread of a message.
   * * @param messageId - ID of the message that started the thread
   *
   * @param messageId - ID of the message that started the thread
   */
  openThread(messageId: string): void {
    this.openThreadId.set(messageId);
  }

  closeThread(): void {
    this.openThreadId.set(null);
  }

  /** Mobile back arrow: thread to chat to menu. */
  mobileBack(): void {
    if (this.openThreadId()) this.closeThread();
    else this.mobileChatOpen.set(false);
  }

  /**
   * Opens a dialog.
   * * @param type - Which dialog
   *
   * @param type - Which dialog
   */
  openDialog(type: DialogType): void {
    this.dialog.set(type);
  }

  /**
   * Own profile opens the version with "Bearbeiten" (Figma page 10).
   * * @param userId - User ID
   *
   * @param userId - User ID
   */
  openProfile(userId: string): void {
    const own = userId === this.userService.currentUser()?.id;
    this.profileUserId.set(userId);
    this.dialog.set(own ? 'ownProfile' : 'profile');
  }

  closeDialog(): void {
    this.dialog.set(null);
  }

  /** After logout: the next user starts fresh in "Allgemein". */
  reset(): void {
    this.activeView.set({ type: 'channel', id: PUBLIC_CHANNEL_ID });
    this.openThreadId.set(null);
    this.mobileChatOpen.set(false);
    this.dialog.set(null);
  }

  /**
   * Search hit: highlight the message and scroll it into view once it is rendered.
   * * @param messageId - Message to scroll to and highlight
   *
   * @param messageId - Message to scroll to and highlight
   */
  revealMessage(messageId: string): void {
    this.highlightId.set(messageId);
    setTimeout(() => document.getElementById(`message-${messageId}`)?.scrollIntoView({ block: 'center' }));
    setTimeout(() => this.highlightId.set(null), 2500);
  }
}
