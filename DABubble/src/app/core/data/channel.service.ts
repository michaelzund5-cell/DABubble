import { inject, Injectable, signal } from '@angular/core';
import { Channel } from '../../shared/models/channel.model';
import { User } from '../../shared/models/user.model';
import { SessionService } from '../auth/session.service';
import { DEMO_CHANNELS } from './demo-seed';
import { UserService } from './user.service';

// Responsible for channels and their members.
@Injectable({ providedIn: 'root' })
export class ChannelService {
  private readonly session = inject(SessionService);
  private readonly userService = inject(UserService);

  private readonly channelsState = signal<Channel[]>(DEMO_CHANNELS);
  readonly channels = this.channelsState.asReadonly();

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

  // Creates a channel and returns it, or null if the name is empty or already taken.
  create(name: string): Channel | null {
    const userId = this.session.currentUserId();
    const cleanName = name.trim().toLowerCase().replace(/\s+/g, '-'); // "Mein Team" -> "mein-team"
    if (!userId || !cleanName || this.channels().some((channel) => channel.name === cleanName)) return null;

    const channel: Channel = {
      id: crypto.randomUUID(),
      name: cleanName,
      description: 'Neu angelegter Team-Channel.',
      memberIds: [userId],
    };
    this.channelsState.update((list) => [...list, channel]);
    return channel;
  }
}

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Der ChannelService ist nur für Channels zuständig.
 *
 * - getById(): Sucht einen Channel anhand seiner ID.
 * - membersOf(): Wandelt die gespeicherten Mitglieder-IDs in echte
 *   Benutzer-Objekte um. map() wandelt jede ID in einen Benutzer um,
 *   filter() entfernt nicht gefundene Benutzer (undefined).
 *   "user is User" ist ein Type Guard: Er sagt TypeScript, dass danach
 *   nur noch echte User im Array sind.
 *   Damit werden die Avatare im Channel-Kopf jetzt aus den echten
 *   Mitgliedern erzeugt. Vorher waren sie fest im HTML eingetragen.
 * - create(): Legt einen neuen Channel an.
 *   - Der Name wird bereinigt: Leerzeichen weg, Kleinbuchstaben,
 *     Leerzeichen in der Mitte werden zu Bindestrichen (Regex /\s+/g).
 *   - Leere oder doppelte Namen werden abgelehnt (Rückgabe null).
 *   - crypto.randomUUID() erzeugt eine eindeutige ID.
 *   - update() mit [...list, channel]: Es entsteht eine NEUE Liste mit
 *     dem neuen Channel am Ende (Spread-Operator). Die alte Liste wird
 *     nicht verändert. So erkennt Angular die Änderung sicher.
 */
