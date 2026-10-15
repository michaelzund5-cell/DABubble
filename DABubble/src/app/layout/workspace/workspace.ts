import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SessionService } from '../../core/auth/session.service';
import { SearchResult, SearchService } from '../../core/data/search.service';
import { UserService } from '../../core/data/user.service';
import { WorkspaceStateService } from '../../core/data/workspace-state.service';
import { ChannelView } from '../../features/chat/channel-view/channel-view';
import { ThreadPanel } from '../../features/chat/thread-panel/thread-panel';
import { Sidebar } from '../../features/navigation/sidebar/sidebar';

// Page layout after login: top bar + sidebar + chat + optional thread panel.
@Component({
  selector: 'app-workspace',
  imports: [Sidebar, ChannelView, ThreadPanel],
  templateUrl: './workspace.html',
  styleUrl: './workspace.scss',
})
export class Workspace {
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);
  readonly userService = inject(UserService);
  readonly search = inject(SearchService);
  readonly state = inject(WorkspaceStateService);

  readonly profileMenuOpen = signal(false);
  readonly mobileNavOpen = signal(false);

  onSearchInput(event: Event): void {
    this.search.term.set((event.target as HTMLInputElement).value);
  }

  openSearchResult(result: SearchResult): void {
    this.state.openView(result.type, result.id);
    this.search.clear();
    this.mobileNavOpen.set(false);
  }

  logout(): void {
    this.session.logout();
    void this.router.navigate(['/login']);
  }
}

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Der Arbeitsbereich nach dem Login (Layout).
 * Er setzt die Bausteine zusammen: Kopfzeile mit Suche und Profil,
 * Seitenleiste, Chat und optional das Thread-Panel.
 *
 * - profileMenuOpen, mobileNavOpen: Signals für das Profil-Menü und
 *   das mobile Navigationsmenü (offen oder zu).
 * - onSearchInput(): Schreibt den Suchtext in den SearchService.
 *   "as HTMLInputElement" ist eine Typ-Zusicherung (Type Assertion):
 *   Wir sagen TypeScript, dass das Ereignis von einem Eingabefeld
 *   kommt. Vorher stand im HTML $any(...), das schaltet die
 *   Typprüfung komplett ab.
 * - openSearchResult(): Öffnet den gefundenen Channel bzw. Chat, leert
 *   die Suche und schließt das mobile Menü. Weil der Treffer jetzt
 *   direkt type 'channel' oder 'direct' hat, entfällt die frühere
 *   Umwandlung von 'person' in 'direkt'.
 * - logout(): Abmelden und zurück zur Login-Seite.
 */
