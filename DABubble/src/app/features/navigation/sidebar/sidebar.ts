import { Component, inject, output, signal } from '@angular/core';
import { ChannelService } from '../../../core/data/channel.service';
import { UserService } from '../../../core/data/user.service';
import { WorkspaceStateService } from '../../../core/data/workspace-state.service';
import { Avatar } from '../../../shared/components/avatar/avatar';
import { ViewType } from '../../../shared/models/view.model';
import { SearchBox } from '../search-box/search-box';

/** Workspace menu: channels and direct messages, can be collapsed. */
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

  /** Event to the workspace: a chat was chosen (mobile switches to the chat view). */
  readonly navigationSelected = output<void>();

  readonly channelsOpen = signal(true);
  readonly directOpen = signal(true);

  /**
   * Checks if an entry is open.
   *
   * @param type - channel or direct
   * @param id - Channel or user ID
   * @returns true for the open chat
   */
  isActive(type: ViewType, id: string): boolean {
    const view = this.state.activeView();
    return view.type === type && view.id === id;
  }

  /**
   * Opens a channel or direct chat.
   *
   * @param type - channel or direct
   * @param id - Channel or user ID
   */
  open(type: ViewType, id: string): void {
    this.state.openView(type, id);
    this.navigationSelected.emit();
  }
}
