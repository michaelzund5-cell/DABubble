import { computed, inject, Injectable, signal } from '@angular/core';
import { ActiveView, DialogType, ViewType } from '../../shared/models/view.model';
import { ChannelService } from './channel.service';
import { UserService } from './user.service';

// UI state of the workspace: which chat is open and which thread is open.
// This is NOT data from the database, only what the user is currently looking at.
@Injectable({ providedIn: 'root' })
export class WorkspaceStateService {
  private readonly channelService = inject(ChannelService);
  private readonly userService = inject(UserService);

  readonly activeView = signal<ActiveView>({ type: 'channel', id: 'c1' });
  readonly openThreadId = signal<string | null>(null);
  readonly mobileChatOpen = signal(false); // mobile: chat instead of the menu (user story 5)
  readonly dialog = signal<DialogType | null>(null);
  readonly profileUserId = signal<string | null>(null); // whose profile the 'profile' dialog shows
  readonly highlightId = signal<string | null>(null); // message found by the search

  // Title above the chat: "# channel-name" or the name of the other person.
  readonly activeTitle = computed(() => {
    const view = this.activeView();
    if (view.type === 'channel') return `# ${this.channelService.getById(view.id)?.name ?? 'Channel'}`;
    return this.userService.getById(view.id)?.name ?? 'Direktnachricht';
  });

  openView(type: ViewType, id: string): void {
    this.activeView.set({ type, id });
    this.openThreadId.set(null); // A thread from the previous chat makes no sense here
    this.mobileChatOpen.set(true);
  }

  // After leaving a channel: first own channel, or "Neue Nachricht" if there is none.
  openFirstChannel(): void {
    const first = this.channelService.myChannels()[0];
    if (first) this.openView('channel', first.id);
    else this.openNewMessage();
  }

  // Figma page 20: "Neue Nachricht" (pencil icon in the sidebar).
  openNewMessage(): void {
    this.openView('new', '');
  }

  openThread(messageId: string): void {
    this.openThreadId.set(messageId);
  }

  closeThread(): void {
    this.openThreadId.set(null);
  }

  // Mobile back arrow: thread -> chat -> menu.
  mobileBack(): void {
    if (this.openThreadId()) this.closeThread();
    else this.mobileChatOpen.set(false);
  }

  openDialog(type: DialogType): void {
    this.dialog.set(type);
  }

  // Own profile opens the version with "Bearbeiten" (Figma page 10).
  openProfile(userId: string): void {
    const own = userId === this.userService.currentUser()?.id;
    this.profileUserId.set(userId);
    this.dialog.set(own ? 'ownProfile' : 'profile');
  }

  closeDialog(): void {
    this.dialog.set(null);
  }

  // Search hit: highlight the message and scroll it into view once it is rendered.
  revealMessage(messageId: string): void {
    this.highlightId.set(messageId);
    setTimeout(() => document.getElementById(`message-${messageId}`)?.scrollIntoView({ block: 'center' }));
    setTimeout(() => this.highlightId.set(null), 2500);
  }
}

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Dieser Service speichert den Zustand der Oberfläche (UI-State), keine
 * Daten aus der Datenbank.
 *
 * - activeView: Welcher Channel oder welche Direktnachricht gerade
 *   offen ist. Start: Channel c1.
 * - openThreadId: Welcher Thread offen ist, oder null für keinen.
 * - activeTitle: Der Titel über dem Chat, automatisch berechnet. Der
 *   Operator ?? liefert einen Ersatzwert, falls links null oder
 *   undefined steht.
 * - openView(): Wechselt den Chat und schließt einen offenen Thread.
 * - openFirstChannel(): nach dem Verlassen eines Channels.
 * - openThread() / closeThread(): Thread-Panel öffnen und schließen.
 * - mobileChatOpen: Auf dem Handy sind Menü und Chat getrennte Ansichten
 *   (User Story 5). openView() wechselt zum Chat, mobileBack() geht
 *   zurück: vom Thread zum Chat, vom Chat zum Menü.
 * - revealMessage(): Suchtreffer kurz hervorheben und hinscrollen.
 *   setTimeout wartet, bis Angular den Chat angezeigt hat.
 * - dialog: welches Fenster offen ist, null = keines. openDialog() öffnet,
 *   closeDialog() schließt. openProfile() merkt sich die Person und
 *   öffnet beim eigenen Profil die Version mit "Bearbeiten".
 *
 * Warum ein eigener Service? Vorher war dieser Zustand mit allen Daten
 * im großen DemoDatenService gemischt. Jetzt ist klar getrennt: Was
 * gespeichert wird (Daten-Services) und was nur angezeigt wird
 * (dieser Service).
 */
