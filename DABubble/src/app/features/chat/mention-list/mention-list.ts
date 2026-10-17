import { Component, computed, inject, input, output } from '@angular/core';
import { ChannelService } from '../../../core/data/channel.service';
import { UserService } from '../../../core/data/user.service';
import { Avatar } from '../../../shared/components/avatar/avatar';
import { Channel } from '../../../shared/models/channel.model';
import { User } from '../../../shared/models/user.model';

export type MentionTrigger = '@' | '#';

// Dropdown with people (@) or channels (#), filtered while typing (Figma pages 46, 47).
@Component({
  selector: 'app-mention-list',
  imports: [Avatar],
  templateUrl: './mention-list.html',
  styleUrl: './mention-list.scss',
})
export class MentionList {
  private readonly userService = inject(UserService);
  private readonly channelService = inject(ChannelService);

  readonly trigger = input.required<MentionTrigger>();
  readonly query = input('');
  readonly pickedUser = output<User>();
  readonly pickedChannel = output<Channel>();

  readonly users = computed(() =>
    this.userService.users().filter((user) => this.matches(user.name) || this.matches(user.email)));

  readonly channels = computed(() =>
    this.channelService.myChannels().filter((channel) => this.matches(channel.name)));

  readonly currentUserId = computed(() => this.userService.currentUser()?.id);

  // Enter in the text field picks the first (highlighted) entry.
  pickFirst(): boolean {
    const user = this.trigger() === '@' ? this.users()[0] : undefined;
    const channel = this.trigger() === '#' ? this.channels()[0] : undefined;
    if (user) this.pickedUser.emit(user);
    if (channel) this.pickedChannel.emit(channel);
    return !!user || !!channel;
  }

  private matches(value: string): boolean {
    return value.toLowerCase().includes(this.query().trim().toLowerCase());
  }
}

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Auswahlliste für @ (Personen) und # (Channels).
 * - trigger: '@' oder '#', bestimmt was angezeigt wird.
 * - query: der Text nach dem Zeichen, z. B. "no" bei "@no".
 * - users / channels: computed, filtern bei jedem Tastendruck neu
 *   (Echtzeit, User Story 6). Personen auch über die E-Mail findbar,
 *   wie das Feld "An:" in Figma verspricht.
 * - pickedUser / pickedChannel: melden die Auswahl an das Eingabefeld.
 * - pickFirst(): Enter wählt den ersten Treffer (hell hinterlegt).
 * - "(Du)" hinter dem eigenen Namen.
 */
