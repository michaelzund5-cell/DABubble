import { Pipe, PipeTransform } from '@angular/core';
import { emojiById } from '../models/emojis';

/** Usage in a template: `<img [src]="reaction.emoji | emojiSrc">` */
@Pipe({ name: 'emojiSrc' })
export class EmojiSrcPipe implements PipeTransform {
  /**
   * Image of an emoji.
   *
   * @param id - Emoji ID
   * @returns Path of the emoji image
   */
  transform(id: string): string {
    return emojiById(id)?.src ?? '';
  }
}
