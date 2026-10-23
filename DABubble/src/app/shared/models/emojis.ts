/** One emoji: short ID, the real character and its image. */
export interface Emoji {
  id: string;
  char: string; // inserted into message text
  src: string; // image from Figma, used for reactions
}

const png = (name: string) => `img/emojis/${name}.png`;

/**
 * The 20 emojis available in DABubble. The first four come from Figma (SVG),
 * the others are from Noto Color Emoji (Apache License 2.0).
 * Images instead of system emojis: they look the same on every device.
 */
export const EMOJI_LIST: readonly Emoji[] = [
  { id: 'check', char: '✅', src: 'img/emojis/check.svg' },
  { id: 'thumbs', char: '👍', src: 'img/emojis/thumbs.svg' },
  { id: 'rocket', char: '🚀', src: 'img/emojis/rocket.svg' },
  { id: 'nerd', char: '🤓', src: 'img/emojis/nerd.svg' },
  { id: 'joy', char: '😂', src: png('joy') },
  { id: 'heart', char: '❤️', src: png('heart') },
  { id: 'party', char: '🎉', src: png('party') },
  { id: 'eyes', char: '👀', src: png('eyes') },
  { id: 'pray', char: '🙏', src: png('pray') },
  { id: 'wow', char: '😮', src: png('wow') },
  { id: 'sad', char: '😢', src: png('sad') },
  { id: 'fire', char: '🔥', src: png('fire') },
  { id: 'clap', char: '👏', src: png('clap') },
  { id: 'hundred', char: '💯', src: png('hundred') },
  { id: 'sweat', char: '😅', src: png('sweat') },
  { id: 'thinking', char: '🤔', src: png('thinking') },
  { id: 'smile', char: '😊', src: png('smile') },
  { id: 'cool', char: '😎', src: png('cool') },
  { id: 'muscle', char: '💪', src: png('muscle') },
  { id: 'bulb', char: '💡', src: png('bulb') },
];

/** Shown in the quick bar until the user has reacted twice (user story 2). */
export const DEFAULT_QUICK_EMOJIS: readonly string[] = ['check', 'thumbs'];

/**
 * Finds an emoji.
 *
 * @param id - Emoji ID, e.g. "rocket"
 * @returns The emoji, or undefined for unknown IDs
 */
export function emojiById(id: string): Emoji | undefined {
  return EMOJI_LIST.find((emoji) => emoji.id === id);
}
