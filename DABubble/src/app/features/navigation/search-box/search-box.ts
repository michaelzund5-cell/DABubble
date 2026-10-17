import { Component, computed, inject, input } from '@angular/core';
import { SearchResult, SearchService } from '../../../core/data/search.service';
import { UserService } from '../../../core/data/user.service';
import { WorkspaceStateService } from '../../../core/data/workspace-state.service';
import { Avatar } from '../../../shared/components/avatar/avatar';

// Search field with live results (header on desktop, "Gehe zu..." in the mobile menu).
@Component({
  selector: 'app-search-box',
  imports: [Avatar],
  templateUrl: './search-box.html',
  styleUrl: './search-box.scss',
  host: { '[class.open]': 'hasTerm()' },
})
export class SearchBox {
  private readonly state = inject(WorkspaceStateService);
  private readonly userService = inject(UserService);
  readonly search = inject(SearchService);

  readonly placeholder = input('Devspace durchsuchen');

  readonly hasTerm = computed(() => !!this.search.term().trim());
  readonly ownId = computed(() => this.userService.currentUser()?.id);

  onInput(event: Event): void {
    this.search.term.set((event.target as HTMLInputElement).value);
  }

  // Opens the chat of the hit, for a thread reply also the thread, and scrolls to the message.
  open(result: SearchResult): void {
    this.state.openView(result.view.type, result.view.id);
    if (result.threadId) this.state.openThread(result.threadId);
    if (result.messageId) this.state.revealMessage(result.messageId);
    this.search.clear();
  }
}

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Suchfeld mit Trefferliste (User Story "Nachrichten suchen").
 * - Desktop: im Header ("Devspace durchsuchen", Figma Seite 17).
 * - Handy: oben im Menü ("Gehe zu...", Figma Seiten 44 bis 47).
 *   Deshalb eine eigene Komponente, der Code steht nur einmal.
 * - onInput(): schreibt den Text in den SearchService. Die Treffer
 *   berechnet der Service in Echtzeit.
 * - open(): öffnet den Chat des Treffers, bei Thread-Antworten auch den
 *   Thread, scrollt zur Nachricht und leert die Suche.
 */
