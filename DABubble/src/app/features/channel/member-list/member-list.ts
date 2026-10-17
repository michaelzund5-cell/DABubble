import { Component, computed, inject, input } from '@angular/core';
import { ChannelService } from '../../../core/data/channel.service';
import { UserService } from '../../../core/data/user.service';
import { WorkspaceStateService } from '../../../core/data/workspace-state.service';
import { Avatar } from '../../../shared/components/avatar/avatar';

// Members of a channel with "Mitglieder hinzufügen" (Figma mobile page 61).
@Component({
  selector: 'app-member-list',
  imports: [Avatar],
  templateUrl: './member-list.html',
  styleUrl: './member-list.scss',
})
export class MemberList {
  private readonly channelService = inject(ChannelService);
  private readonly userService = inject(UserService);
  readonly state = inject(WorkspaceStateService);

  readonly channelId = input.required<string>();
  readonly showTitle = input(true);

  // You first, then the newest members (Figma page 60: "Frederik Beck (Du)", Sofia, Noah).
  readonly members = computed(() => {
    const list = [...this.channelService.membersOf(this.channelId())].reverse();
    const ownIndex = list.findIndex((member) => member.id === this.currentUserId());
    if (ownIndex > 0) list.unshift(...list.splice(ownIndex, 1));
    return list;
  });
  readonly currentUserId = computed(() => this.userService.currentUser()?.id);
}

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Liste der Channel-Mitglieder.
 * - Wird im Mitglieder-Fenster (Desktop) und in den Channel-Details
 *   (Handy, Figma Seite 61) benutzt. Deshalb eine eigene Komponente.
 * - Klick auf eine Person öffnet ihr Profil.
 * - "(Du)" hinter dem eigenen Namen, wie in der Sidebar.
 * - Reihenfolge: du zuoberst, danach die neuesten Mitglieder (Figma 60).
 * - Letzte Zeile "Mitglieder hinzufügen" öffnet das Fenster dafür.
 */
