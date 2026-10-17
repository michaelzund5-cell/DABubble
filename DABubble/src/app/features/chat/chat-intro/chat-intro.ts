import { Component, computed, inject, input } from '@angular/core';
import { UserService } from '../../../core/data/user.service';
import { WorkspaceStateService } from '../../../core/data/workspace-state.service';
import { ViewportService } from '../../../core/layout/viewport.service';
import { Avatar } from '../../../shared/components/avatar/avatar';
import { Channel } from '../../../shared/models/channel.model';
import { User } from '../../../shared/models/user.model';
import { isSameDay } from '../../../shared/pipes/chat-date.pipe';

// Welcome text of an empty chat (Figma page 19: channel, pages 21-26: direct message).
@Component({
  selector: 'app-chat-intro',
  imports: [Avatar],
  templateUrl: './chat-intro.html',
  styleUrl: './chat-intro.scss',
})
export class ChatIntro {
  private readonly userService = inject(UserService);
  readonly state = inject(WorkspaceStateService);
  readonly viewport = inject(ViewportService);

  readonly channel = input<Channel | undefined>(undefined);
  readonly partner = input<User | undefined>(undefined);
  readonly isSelf = input(false);

  readonly creatorIsMe = computed(() => this.channel()?.createdBy === this.userService.currentUser()?.id);
  readonly creatorName = computed(() => this.userService.getById(this.channel()?.createdBy)?.name ?? '');
  // "heute" or "am 14. Januar 2025"
  readonly createdLabel = computed(() => {
    const created = new Date(this.channel()?.createdAt ?? 0);
    if (isSameDay(created, new Date())) return 'heute';
    return `am ${created.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })}`;
  });
}

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Begrüssungstext, wenn ein Chat noch keine Nachricht hat.
 * - Channel (Figma Seite 19): "# Office-team" und "Du hast diesen
 *   Channel heute erstellt. Das ist der Anfang des Channels ...".
 *   Hat jemand anderes den Channel erstellt oder war es nicht heute,
 *   steht dort der Name bzw. das Datum (Figma zeigt nur den eigenen
 *   Fall von heute, der Rest ist eine Annahme).
 * - Direktnachricht (Figma Seiten 21 bis 25): grosser Avatar, Name und
 *   "Diese Unterhaltung findet nur zwischen @Name und dir statt.".
 *   Klick auf @Name öffnet das Profil.
 * - Nachricht an dich selbst (Figma Seite 26): eigener Text "Dieser Raum
 *   ist nur für dich da ...".
 */
