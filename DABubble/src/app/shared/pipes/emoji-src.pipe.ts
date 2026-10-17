import { Pipe, PipeTransform } from '@angular/core';
import { emojiById } from '../models/emojis';

// Usage in a template: <img [src]="reaction.emoji | emojiSrc">
@Pipe({ name: 'emojiSrc' })
export class EmojiSrcPipe implements PipeTransform {
  transform(id: string): string {
    return emojiById(id)?.src ?? '';
  }
}

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Pipe: wandelt eine Emoji-ID in den Bildpfad um.
 * - Eine Pipe ist eine kleine Umwandlung direkt im HTML, geschrieben
 *   mit dem senkrechten Strich: {{ wert | pipeName }}.
 * - ?? '': Unbekannte ID ergibt einen leeren Pfad statt eines Fehlers.
 */
