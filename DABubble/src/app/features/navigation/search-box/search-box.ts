import { Component, computed, ElementRef, inject, input } from '@angular/core';
import { SearchResult, SearchService } from '../../../core/data/search.service';
import { UserService } from '../../../core/data/user.service';
import { WorkspaceStateService } from '../../../core/data/workspace-state.service';
import { Avatar } from '../../../shared/components/avatar/avatar';

/** Search field with live results (header on desktop, "Gehe zu..." in the mobile menu). */
@Component({
  selector: 'app-search-box',
  imports: [Avatar],
  templateUrl: './search-box.html',
  styleUrl: './search-box.scss',
  host: { '[class.open]': 'hasTerm()', '(document:pointerdown)': 'closeOutside($event)' },
})
export class SearchBox {
  private readonly state = inject(WorkspaceStateService);
  private readonly userService = inject(UserService);
  readonly search = inject(SearchService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly placeholder = input('Devspace durchsuchen');

  readonly hasTerm = computed(() => !!this.search.term().trim());
  readonly ownId = computed(() => this.userService.currentUser()?.id);

  /**
   * Updates the search text.
   * * @param event - Input event of the field
   *
   * @param event - Input event of the field
   */
  onInput(event: Event): void {
    this.search.term.set((event.target as HTMLInputElement).value);
  }

  /**
   * A click next to the results closes them. Only the visible search box reacts
   * (header and mobile menu share one search, offsetParent is null while hidden).
   * * @param event - Any click on the page
   *
   * @param event - Any click on the page
   */
  closeOutside(event: PointerEvent): void {
    const element = this.host.nativeElement;
    if (!this.hasTerm() || !element.offsetParent || element.contains(event.target as Node)) return;
    this.search.clear();
  }

  /**
   * Opens the chat of the hit, for a thread reply also the thread, and scrolls to the message.
   * * @param result - Clicked search result
   *
   * @param result - Clicked search result
   */
  open(result: SearchResult): void {
    this.state.openView(result.view.type, result.view.id);
    if (result.threadId) this.state.openThread(result.threadId);
    if (result.messageId) this.state.revealMessage(result.messageId);
    this.search.clear();
  }
}
