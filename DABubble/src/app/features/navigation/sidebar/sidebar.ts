import { Component, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChannelService } from '../../../core/data/channel.service';
import { UserService } from '../../../core/data/user.service';
import { WorkspaceStateService } from '../../../core/data/workspace-state.service';
import { ViewType } from '../../../shared/models/view.model';

@Component({
  selector: 'app-sidebar',
  imports: [FormsModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  readonly channelService = inject(ChannelService);
  readonly userService = inject(UserService);
  readonly state = inject(WorkspaceStateService);

  // Event to the parent (workspace): "the user picked a chat", used to close the mobile menu.
  readonly navigationSelected = output<void>();

  readonly createDialogOpen = signal(false);
  newChannelName = '';
  createError = '';

  isActive(type: ViewType, id: string): boolean {
    const view = this.state.activeView();
    return view.type === type && view.id === id;
  }

  open(type: ViewType, id: string): void {
    this.state.openView(type, id);
    this.navigationSelected.emit();
  }

  openCreateDialog(): void {
    this.newChannelName = '';
    this.createError = '';
    this.createDialogOpen.set(true);
  }

  createChannel(): void {
    const channel = this.channelService.create(this.newChannelName);
    if (!channel) {
      this.createError = 'Name fehlt oder ist schon vergeben.';
      return;
    }
    this.createDialogOpen.set(false);
    this.open('channel', channel.id);
  }
}

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Die Seitenleiste mit Channels und Direktnachrichten.
 *
 * - Die drei Services werden per inject() geholt und sind "readonly"
 *   öffentlich, damit das HTML sie benutzen kann.
 * - navigationSelected = output<void>(): Ein Output ist ein Ereignis an
 *   die Eltern-Component (Workspace). Es sagt nur: "Der Benutzer hat
 *   einen Chat gewählt", damit das mobile Menü schließt.
 *   Neu: output() ist die moderne Schreibweise statt @Output() mit
 *   EventEmitter. Der Tippfehler "navigationGewaeht" ist behoben.
 * - createDialogOpen: Signal, ob das Fenster "Channel erstellen" offen
 *   ist.
 * - isActive(): Ist dieser Eintrag gerade geöffnet? Dann wird er im
 *   HTML hervorgehoben.
 * - open(): Öffnet einen Channel oder Chat und meldet das per emit()
 *   nach oben.
 * - createChannel(): Legt den Channel an. Neu: Bei leerem oder
 *   doppeltem Namen erscheint jetzt eine Fehlermeldung. Vorher schloss
 *   sich das Fenster einfach, ohne dass etwas passierte.
 */
