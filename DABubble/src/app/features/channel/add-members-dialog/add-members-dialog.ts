import { Component, computed, inject, signal } from '@angular/core';
import { ChannelService } from '../../../core/data/channel.service';
import { WorkspaceStateService } from '../../../core/data/workspace-state.service';
import { Dialog } from '../../../shared/components/dialog/dialog';
import { PeoplePicker } from '../people-picker/people-picker';

// "Leute hinzufügen": every member can invite more people (channel user story 2).
@Component({
  selector: 'app-add-members-dialog',
  imports: [Dialog, PeoplePicker],
  templateUrl: './add-members-dialog.html',
  styleUrl: './add-members-dialog.scss',
})
export class AddMembersDialog {
  private readonly channelService = inject(ChannelService);
  readonly state = inject(WorkspaceStateService);

  readonly selectedIds = signal<string[]>([]);

  readonly channel = computed(() => {
    const view = this.state.activeView();
    return view.type === 'channel' ? this.channelService.getById(view.id) : undefined;
  });

  add(): void {
    const channel = this.channel();
    if (!channel || !this.selectedIds().length) return;
    this.channelService.addMembers(channel.id, this.selectedIds());
    this.state.closeDialog();
  }
}

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Fenster "Leute hinzufügen" (Button mit Personen-Icon im Channel-Kopf
 * oder "Mitglieder hinzufügen" in der Liste).
 * - selectedIds: die gewählten Personen aus dem PeoplePicker.
 * - Wer schon Mitglied ist, wird nicht angeboten (excludeIds).
 * - add(): fügt alle gewählten Personen hinzu und schliesst das Fenster.
 * - Design ist eine Annahme, Figma zeigt dieses Fenster nicht.
 */
