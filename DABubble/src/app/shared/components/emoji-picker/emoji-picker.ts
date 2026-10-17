import { Component, output } from '@angular/core';
import { Emoji, EMOJI_LIST } from '../../models/emojis';

// Small popup with all emojis. The parent decides what happens with the choice.
@Component({
  selector: 'app-emoji-picker',
  templateUrl: './emoji-picker.html',
  styleUrl: './emoji-picker.scss',
})
export class EmojiPicker {
  readonly emojis = EMOJI_LIST;
  readonly picked = output<Emoji>();
}

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Emoji-Auswahl als Popup.
 * - Zeigt alle Emojis aus emojis.ts.
 * - picked: meldet das gewählte Emoji an die Elternkomponente. Bei
 *   einer Nachricht wird es zur Reaktion, im Eingabefeld wird das
 *   Zeichen in den Text eingefügt. So ist die Komponente doppelt nutzbar.
 * - Figma hat kein Design für die Auswahl: Aussehen ist eine Annahme im
 *   Stil der übrigen Popups (weiß, runde Ecken, Schatten).
 */
