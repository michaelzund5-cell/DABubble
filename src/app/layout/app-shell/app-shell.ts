import { Component } from '@angular/core';
import { WorkspaceSidebar } from '../../features/workspace/sidebar/sidebar';
import { ChatRoom } from '../../features/chat/chat-room/chat-room';
import { ThreadPanel } from '../../features/thread/thread-panel/thread-panel';

@Component({
  selector: 'app-shell',
  imports: [WorkspaceSidebar, ChatRoom, ThreadPanel],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.scss',
})
export class AppShell {
  // TODO: Shell-Zustand (aktiver Channel, mobiles Menü, Thread) ergänzen.
}
