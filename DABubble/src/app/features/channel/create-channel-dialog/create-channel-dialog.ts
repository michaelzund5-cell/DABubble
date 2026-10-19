import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChannelService } from '../../../core/data/channel.service';
import { UserService } from '../../../core/data/user.service';
import { WorkspaceStateService } from '../../../core/data/workspace-state.service';
import { Dialog } from '../../../shared/components/dialog/dialog';
import { PeoplePicker } from '../people-picker/people-picker';

type AddMode = 'all' | 'some';

// "Channel erstellen" (Figma mobile page 59), then step 2: choose the members.
@Component({
  selector: 'app-create-channel-dialog',
  imports: [Dialog, FormsModule, PeoplePicker],
  templateUrl: './create-channel-dialog.html',
  styleUrl: './create-channel-dialog.scss',
})
export class CreateChannelDialog {
  private readonly channelService = inject(ChannelService);
  private readonly userService = inject(UserService);
  readonly state = inject(WorkspaceStateService);

  readonly step = signal<1 | 2>(1);
  readonly nameError = signal('');
  readonly addMode = signal<AddMode>('all');
  readonly selectedIds = signal<string[]>([]);
  name = '';
  description = '';

  // Step 1: check the name before going on, so a duplicate shows up at once.
  next(): void {
    const error = this.channelService.validateName(this.name);
    this.nameError.set(error);
    if (!error) this.step.set(2);
  }

  // Step 2: create the channel, add the chosen people and open it.
  create(): void {
    const channel = this.channelService.create(this.name, this.description, this.memberIds());
    if (!channel) return this.backToName();
    this.state.closeDialog();
    this.state.openView('channel', channel.id);
  }

  private memberIds(): string[] {
    return this.addMode() === 'all' ? this.userService.users().map((user) => user.id) : this.selectedIds();
  }

  // The name was taken in the meantime: show the error in step 1 again.
  private backToName(): void {
    this.nameError.set(this.channelService.validateName(this.name));
    this.step.set(1);
  }
}

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Fenster "Channel erstellen" in zwei Schritten.
 * - Schritt 1 (Figma Seite 59): Name und Beschreibung (optional).
 *   next() prüft den Namen sofort (leer, zu lang, gibt es schon) und
 *   zeigt den Fehler unter dem Feld.
 * - Schritt 2 "Leute hinzufügen": Alle Mitglieder von Devspace oder
 *   bestimmte Personen (PeoplePicker). Figma zeigt diesen Schritt nicht,
 *   er erfüllt die Checkliste "Der Ersteller kann andere Benutzer
 *   einladen".
 * - create(): legt den Channel an, du bist Ersteller und Mitglied, dann
 *   öffnet der neue Channel (leer, mit Begrüssung wie Figma Seite 19).
 */
