import { Component, input } from '@angular/core';
import { DEFAULT_AVATAR } from '../../models/avatars';
import { User } from '../../models/user.model';

// Round user picture, optionally with the online dot (Figma: green / grey).
@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.html',
  styleUrl: './avatar.scss',
  host: { '[style.--size.px]': 'size()' },
})
export class Avatar {
  readonly user = input.required<User>();
  readonly size = input(50);
  readonly showStatus = input(false);
  readonly defaultAvatar = DEFAULT_AVATAR;
}

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Wiederverwendbarer Avatar (Sidebar, Header, Nachrichten).
 * - size: Größe in px. host: '[style.--size.px]' schreibt die Größe als
 *   CSS-Variable an das Element, das SCSS rechnet damit.
 * - showStatus: zeigt den Online-Punkt (grün online, grau sonst).
 * - Ohne eigenes Bild wird der Standard-Avatar gezeigt.
 */
