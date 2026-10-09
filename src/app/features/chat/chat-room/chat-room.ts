import { Component } from '@angular/core';
import { MessageComposer } from '../message-composer/message-composer';

@Component({
  selector: 'app-chat-room',
  imports: [MessageComposer],
  templateUrl: './chat-room.html',
  styleUrl: './chat-room.scss',
})
export class ChatRoom {
  // TODO: Nachrichten, aktiver Channel und Aktionen per TypeScript anbinden.
}
