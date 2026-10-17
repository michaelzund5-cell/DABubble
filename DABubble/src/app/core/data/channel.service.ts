import { computed, inject, Injectable, signal } from '@angular/core';
import { Channel } from '../../shared/models/channel.model';
import { User } from '../../shared/models/user.model';
import { SessionService } from '../auth/session.service';
import { DEMO_CHANNELS } from './demo-seed';
import { UserService } from './user.service';

const MAX_NAME_LENGTH = 40;

// Responsible for channels and their members.
@Injectable({ providedIn: 'root' })
export class ChannelService {
  private readonly session = inject(SessionService);
  private readonly userService = inject(UserService);

  private readonly channelsState = signal<Channel[]>(DEMO_CHANNELS);
  readonly channels = this.channelsState.asReadonly();

  // Channels the logged-in user is a member of (shown in the sidebar).
  readonly myChannels = computed(() => {
    const userId = this.session.currentUserId();
    return this.channels().filter((channel) => !!userId && channel.memberIds.includes(userId));
  });

  getById(id: string): Channel | undefined {
    return this.channels().find((channel) => channel.id === id);
  }

  // Turns the member IDs of a channel into full user objects.
  membersOf(channelId: string): User[] {
    const channel = this.getById(channelId);
    if (!channel) return [];
    return channel.memberIds
      .map((id) => this.userService.getById(id))
      .filter((user): user is User => user !== undefined);
  }

  // Error text for a channel name, or '' if it is fine. ignoreId: the channel being renamed.
  validateName(name: string, ignoreId?: string): string {
    const cleanName = toChannelName(name);
    if (!cleanName) return 'Bitte gib einen Channel-Namen ein.';
    if (cleanName.length > MAX_NAME_LENGTH) return `Maximal ${MAX_NAME_LENGTH} Zeichen.`;
    if (this.nameExists(cleanName, ignoreId)) return 'Diesen Channel-Namen gibt es schon.';
    return '';
  }

  // Creates a channel with the current user as only member. Returns null if the name is not valid.
  create(name: string, description: string): Channel | null {
    const userId = this.session.currentUserId();
    if (!userId || this.validateName(name)) return null;
    const channel: Channel = {
      id: crypto.randomUUID(),
      name: toChannelName(name),
      description: description.trim(),
      memberIds: [userId],
      createdBy: userId,
      createdAt: Date.now(),
    };
    this.channelsState.update((list) => [...list, channel]);
    return channel;
  }

  // Returns an error text, or '' when the new name was saved. Only members may edit.
  rename(id: string, name: string): string {
    const error = this.isMember(id) ? this.validateName(name, id) : 'Nur Mitglieder können den Channel ändern.';
    if (!error) this.patch(id, { name: toChannelName(name) });
    return error;
  }

  updateDescription(id: string, description: string): string {
    if (!this.isMember(id)) return 'Nur Mitglieder können den Channel ändern.';
    this.patch(id, { description: description.trim() });
    return '';
  }

  // Every member may add other users (user story "Management von Channels" 2).
  addMembers(id: string, userIds: string[]): void {
    const channel = this.getById(id);
    if (!channel || !this.isMember(id)) return;
    this.patch(id, { memberIds: [...new Set([...channel.memberIds, ...userIds])] });
  }

  leave(id: string): void {
    const userId = this.session.currentUserId();
    const channel = this.getById(id);
    if (!userId || !channel) return;
    this.patch(id, { memberIds: channel.memberIds.filter((memberId) => memberId !== userId) });
  }

  isMember(id: string): boolean {
    const userId = this.session.currentUserId();
    return !!userId && !!this.getById(id)?.memberIds.includes(userId);
  }

  // Duplicate check ignores upper/lower case: "Entwicklerteam" = "entwicklerteam".
  private nameExists(name: string, ignoreId?: string): boolean {
    const lower = name.toLowerCase();
    return this.channels().some((channel) => channel.id !== ignoreId && channel.name.toLowerCase() === lower);
  }

  private patch(id: string, changes: Partial<Channel>): void {
    this.channelsState.update((list) => list.map((channel) => channel.id === id ? { ...channel, ...changes } : channel));
  }
}

// "  Office team " -> "Office-team" (a leading "#" is removed, the UI adds it).
export function toChannelName(name: string): string {
  return name.trim().replace(/^#+/, '').trim().replace(/\s+/g, '-');
}

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Der ChannelService ist nur für Channels zuständig.
 *
 * - myChannels: Channels, in denen du Mitglied bist (für die Sidebar).
 * - membersOf(): Wandelt die gespeicherten Mitglieder-IDs in echte
 *   Benutzer-Objekte um. "user is User" ist ein Type Guard: Danach sind
 *   nur noch echte User im Array.
 * - validateName(): Prüft den Namen und liefert einen Fehlertext, z. B.
 *   "Diesen Channel-Namen gibt es schon." (Duplikat-Prüfung aus der
 *   Checkliste, Gross-/Kleinschreibung egal). ignoreId: Beim Umbenennen
 *   darf der Channel seinen eigenen Namen behalten.
 * - create(): Legt einen Channel an, du bist erstes Mitglied und
 *   Ersteller. crypto.randomUUID() erzeugt eine eindeutige ID.
 * - rename() / updateDescription(): Name und Beschreibung ändern. Gibt
 *   einen Fehlertext zurück, damit die Oberfläche ihn anzeigen kann.
 * - addMembers(): fügt Personen hinzu. new Set() entfernt doppelte IDs.
 * - leave(): Du trittst aus dem Channel aus.
 * - patch(): ändert einen Channel. Es entsteht eine NEUE Liste (map mit
 *   Spread-Operator), so erkennt Angular die Änderung sicher.
 * - toChannelName(): "Office team" wird zu "Office-team".
 * Wichtig: Diese Prüfungen sind nur für die Oberfläche. Mit Firebase
 * müssen die Firestore-Regeln dasselbe auf dem Server prüfen.
 */
