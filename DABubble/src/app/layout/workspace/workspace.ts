import { Component, inject, signal } from '@angular/core';
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

// Page layout after login: header + sidebar + chat + optional thread panel.
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
  readonly sidebarOpen = signal(true);
}

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Logik des Seitenrahmens.
 * - Die Kopfzeile ist jetzt eine eigene Komponente (Header) mit Suche
 *   und Profilmenü. Der Workspace setzt nur noch die Teile zusammen.
 * - sidebarOpen: Signal für das Ein- und Ausklappen der Sidebar.
 * - state.openThreadId(): Ist ein Thread offen, kommt die dritte Spalte.
 * - Die Fenster (Dialoge) werden hier eingebunden, damit sie über allen
 *   Spalten liegen.
 */
