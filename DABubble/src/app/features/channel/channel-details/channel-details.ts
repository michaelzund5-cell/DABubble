import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChannelService } from '../../../core/data/channel.service';
import { UserService } from '../../../core/data/user.service';
import { WorkspaceStateService } from '../../../core/data/workspace-state.service';
import { Dialog } from '../../../shared/components/dialog/dialog';
import { MemberList } from '../member-list/member-list';

// Channel settings (Figma pages 11 and 14, mobile 60 and 61): rename, describe, leave.
@Component({
  selector: 'app-channel-details',
  imports: [Dialog, FormsModule, MemberList],
  templateUrl: './channel-details.html',
  styleUrl: './channel-details.scss',
})
export class ChannelDetails {
  private readonly channelService = inject(ChannelService);
  private readonly userService = inject(UserService);
  readonly state = inject(WorkspaceStateService);

  readonly channel = computed(() => {
    const view = this.state.activeView();
    return view.type === 'channel' ? this.channelService.getById(view.id) : undefined;
  });

  readonly creator = computed(() => this.userService.getById(this.channel()?.createdBy));

  // Name and description can be edited at the same time (Figma page 14).
  readonly editingName = signal(false);
  readonly editingDescription = signal(false);
  readonly nameError = signal('');
  nameDraft = '';
  descriptionDraft = '';

  startName(): void {
    this.nameDraft = this.channel()?.name ?? '';
    this.nameError.set('');
    this.editingName.set(true);
  }

  // The error text stays visible until the name is valid.
  saveName(): void {
    const channel = this.channel();
    if (!channel) return;
    this.nameError.set(this.channelService.rename(channel.id, this.nameDraft));
    if (!this.nameError()) this.editingName.set(false);
  }

  startDescription(): void {
    this.descriptionDraft = this.channel()?.description ?? '';
    this.editingDescription.set(true);
  }

  saveDescription(): void {
    const channel = this.channel();
    if (channel && !this.channelService.updateDescription(channel.id, this.descriptionDraft)) {
      this.editingDescription.set(false);
    }
  }

  leave(): void {
    const channel = this.channel();
    if (!channel) return;
    this.channelService.leave(channel.id);
    this.state.closeDialog();
    this.state.openFirstChannel();
  }
}

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Channel-Details (Figma Seiten 11 und 14, Handy 60 und 61).
 * - editingName / editingDescription: welches Feld gerade bearbeitet
 *   wird. Beide gleichzeitig sind möglich (Figma Seite 14).
 * - nameDraft / descriptionDraft: Text im Eingabefeld, wird erst beim
 *   Speichern übernommen.
 * - saveName(): Der ChannelService prüft den Namen (leer, zu lang, doppelt)
 *   und gibt einen Fehlertext zurück. Er erscheint unter dem Feld
 *   (Checkliste: Warnung, wenn die Änderung nicht erfolgreich war).
 * - Änderungen sind sofort für alle sichtbar, weil alle Ansichten das
 *   gleiche Signal im Service lesen.
 * - leave(): Channel verlassen, danach öffnet der erste eigene Channel.
 * - Auf dem Handy zeigt die Karte auch die Mitglieder (Figma 60, 61).
 */
