import { Component, inject, signal } from '@angular/core';
import { ChannelService } from '../../core/data/channel.service';
import { PresenceService } from '../../core/data/presence.service';
import { WorkspaceStateService } from '../../core/data/workspace-state.service';
import { AddMembersDialog } from '../../features/channel/add-members-dialog/add-members-dialog';
import { ChannelDetails } from '../../features/channel/channel-details/channel-details';
import { CreateChannelDialog } from '../../features/channel/create-channel-dialog/create-channel-dialog';
import { MembersDialog } from '../../features/channel/members-dialog/members-dialog';
import { ChannelView } from '../../features/chat/channel-view/channel-view';
import { NewMessage } from '../../features/chat/new-message/new-message';
import { ThreadPanel } from '../../features/chat/thread-panel/thread-panel';
import { Header } from '../../features/navigation/header/header';
import { Sidebar } from '../../features/navigation/sidebar/sidebar';
import { ProfileDialog } from '../../features/profile/profile-dialog/profile-dialog';

/** Page layout after login: header + sidebar + chat + optional thread panel. */
@Component({
  selector: 'app-workspace',
  imports: [
    Header, Sidebar, ChannelView, NewMessage, ThreadPanel,
    ProfileDialog, ChannelDetails, MembersDialog, AddMembersDialog, CreateChannelDialog,
  ],
  templateUrl: './workspace.html',
  styleUrl: './workspace.scss',
})
export class Workspace {
  readonly state = inject(WorkspaceStateService);
  readonly channelService = inject(ChannelService);
  readonly sidebarOpen = signal(true);

  constructor() {
    inject(PresenceService); // starts the online heartbeat as soon as the workspace is open
  }
}
