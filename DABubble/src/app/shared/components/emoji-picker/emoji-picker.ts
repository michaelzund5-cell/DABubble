import { Component, output } from '@angular/core';
import { Emoji, EMOJI_LIST } from '../../models/emojis';

/** Small popup with all emojis. The parent decides what happens with the choice. */
@Component({
  selector: 'app-emoji-picker',
  templateUrl: './emoji-picker.html',
  styleUrl: './emoji-picker.scss',
})
export class EmojiPicker {
  readonly emojis = EMOJI_LIST;
  readonly picked = output<Emoji>();
}
