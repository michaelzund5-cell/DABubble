import { computed, inject, Injectable, signal } from '@angular/core';
import { ViewType } from '../../shared/models/view.model';
import { ChannelService } from './channel.service';
import { UserService } from './user.service';

export interface SearchResult {
  type: ViewType; // 'channel' or 'direct', so a result can be opened directly
  id: string;
  label: string;
}

// Search over channels and users.
@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly channelService = inject(ChannelService);
  private readonly userService = inject(UserService);
  private readonly maxResults = 8;

  readonly term = signal('');

  // Recalculated automatically whenever the term, the channels or the users change.
  readonly results = computed<SearchResult[]>(() => {
    const query = this.term().trim().toLowerCase();
    if (!query) return [];

    const channelHits: SearchResult[] = this.channelService.channels()
      .filter((channel) => channel.name.toLowerCase().includes(query))
      .map((channel) => ({ type: 'channel', id: channel.id, label: `# ${channel.name}` }));

    const userHits: SearchResult[] = this.userService.otherUsers()
      .filter((user) => user.name.toLowerCase().includes(query))
      .map((user) => ({ type: 'direct', id: user.id, label: user.name }));

    return [...channelHits, ...userHits].slice(0, this.maxResults);
  });

  clear(): void {
    this.term.set('');
  }
}

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Der SearchService durchsucht Channels und Benutzer.
 *
 * - SearchResult: Ein Treffer hat type ('channel' oder 'direct'), id
 *   und label (angezeigter Text). Weil type dieselben Werte wie die
 *   Ansicht hat, kann ein Treffer direkt geöffnet werden. Vorher gab es
 *   'person' und 'direkt', die extra umgewandelt werden mussten.
 * - term: Der eingegebene Suchbegriff (Signal).
 * - results: computed. Bei jeder Eingabe wird automatisch neu gesucht:
 *   - toLowerCase(): Groß-/Kleinschreibung egal.
 *   - includes(): Enthält der Name den Suchbegriff?
 *   - map(): Wandelt jeden Treffer in ein SearchResult um.
 *   - slice(0, 8): Höchstens 8 Treffer anzeigen.
 *   Die eigene Person wird nicht gefunden (otherUsers), weil man sich
 *   selbst keine Direktnachricht schreibt.
 * - clear(): Suchfeld leeren.
 */
