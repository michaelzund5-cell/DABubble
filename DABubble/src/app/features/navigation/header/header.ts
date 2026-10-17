import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SessionService } from '../../../core/auth/session.service';
import { UserService } from '../../../core/data/user.service';
import { WorkspaceStateService } from '../../../core/data/workspace-state.service';
import { ViewportService } from '../../../core/layout/viewport.service';
import { Avatar } from '../../../shared/components/avatar/avatar';
import { Dialog } from '../../../shared/components/dialog/dialog';
import { SearchBox } from '../search-box/search-box';

// Top bar: logo (or back arrow on mobile), search, profile with menu.
@Component({
  selector: 'app-header',
  imports: [Avatar, Dialog, SearchBox],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);
  readonly state = inject(WorkspaceStateService);
  readonly userService = inject(UserService);
  readonly viewport = inject(ViewportService);

  // Mobile chat or thread view: back arrow instead of the logo (Figma page 48).
  readonly showBack = computed(() => this.viewport.isMobile() && this.state.mobileChatOpen());

  logout(): void {
    this.state.closeDialog();
    this.session.logout();
    void this.router.navigate(['/login']);
  }
}

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Logik der Kopfzeile.
 * - showBack: Auf dem Handy im Chat zeigt der Header den Zurück-Pfeil.
 * - Die Suche steckt in der Komponente SearchBox.
 * - logout(): meldet ab und geht zur Anmeldung.
 * - Das Menü (Profil / Log out) ist ein Dialog im WorkspaceStateService,
 *   damit immer nur ein Fenster offen ist.
 */
