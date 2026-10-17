import { Component, computed, inject } from '@angular/core';
import { WorkspaceStateService } from '../../../core/data/workspace-state.service';
import { Dialog } from '../../../shared/components/dialog/dialog';
import { MemberList } from '../member-list/member-list';

// Desktop popup below the member avatars in the channel header.
@Component({
  selector: 'app-members-dialog',
  imports: [Dialog, MemberList],
  templateUrl: './members-dialog.html',
  styleUrl: './members-dialog.scss',
})
export class MembersDialog {
  readonly state = inject(WorkspaceStateService);

  readonly channelId = computed(() => {
    const view = this.state.activeView();
    return view.type === 'channel' ? view.id : null;
  });
}

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Fenster "Mitglieder" (Klick auf die Avatare im Channel-Kopf).
 * Zeigt die Mitgliederliste des offenen Channels. Figma zeigt dieses
 * Fenster nur auf dem Handy (Seite 61), Desktop-Design ist eine Annahme
 * im gleichen Stil.
 */
