import { Component, inject, output, signal } from '@angular/core';
import { ChannelService } from '../../../core/data/channel.service';
import { UserService } from '../../../core/data/user.service';
import { WorkspaceStateService } from '../../../core/data/workspace-state.service';
import { Avatar } from '../../../shared/components/avatar/avatar';
import { ViewType } from '../../../shared/models/view.model';
import { SearchBox } from '../search-box/search-box';

@Component({
  selector: 'app-sidebar',
  imports: [Avatar, SearchBox],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  readonly channelService = inject(ChannelService);
  readonly userService = inject(UserService);
  readonly state = inject(WorkspaceStateService);

  // Event to the workspace: a chat was chosen (mobile switches to the chat view).
  readonly navigationSelected = output<void>();

  readonly channelsOpen = signal(true);
  readonly directOpen = signal(true);

  isActive(type: ViewType, id: string): boolean {
    const view = this.state.activeView();
    return view.type === type && view.id === id;
  }

  open(type: ViewType, id: string): void {
    this.state.openView(type, id);
    this.navigationSelected.emit();
  }
}

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Logik der Sidebar.
 * - output<void>(): Ereignis an die Elternkomponente (Workspace).
 *   navigationSelected: ein Chat wurde gewählt. Auf dem Handy wechselt
 *   der Workspace dann vom Menü zum Chat (User Story 5).
 * - "Channel erstellen" öffnet den Dialog über state.openDialog().
 * - channelsOpen / directOpen: Signale für das Ein- und Ausklappen.
 * - isActive(): Ist dieser Channel oder diese Person gerade offen?
 * - open(): öffnet den Chat über den WorkspaceStateService.
 */
