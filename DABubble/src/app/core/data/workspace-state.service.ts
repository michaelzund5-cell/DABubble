import { computed, inject, Injectable, signal } from '@angular/core';
import { ActiveView, ViewType } from '../../shared/models/view.model';
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

  // Title above the chat: "# channel-name" or the name of the other person.
  readonly activeTitle = computed(() => {
    const view = this.activeView();
    if (view.type === 'channel') return `# ${this.channelService.getById(view.id)?.name ?? 'Channel'}`;
    return this.userService.getById(view.id)?.name ?? 'Direktnachricht';
  });

  openView(type: ViewType, id: string): void {
    this.activeView.set({ type, id });
    this.openThreadId.set(null); // A thread from the previous chat makes no sense here
  }

  openThread(messageId: string): void {
    this.openThreadId.set(messageId);
  }

  closeThread(): void {
    this.openThreadId.set(null);
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
 * - openThread() / closeThread(): Thread-Panel öffnen und schließen.
 *
 * Warum ein eigener Service? Vorher war dieser Zustand mit allen Daten
 * im großen DemoDatenService gemischt. Jetzt ist klar getrennt: Was
 * gespeichert wird (Daten-Services) und was nur angezeigt wird
 * (dieser Service).
 */
