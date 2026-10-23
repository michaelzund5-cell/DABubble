/** A piece of a message text: normal text, or a mention that links to a person or a channel. */
export interface TextPart {
  text: string;
  kind: 'text' | 'user' | 'channel';
  id?: string; // user ID or channel ID, only for mentions
}

/** Something that can be mentioned: `@Sofia Müller` (user) or "#Entwicklerteam" (channel). */
export interface MentionTarget {
  name: string;
  kind: 'user' | 'channel';
  id: string;
}

/**
 * Splits a message into text and mentions. Only known names become mentions, the rest stays text.
 *
 * @param text - Message text
 * @param targets - Known people and channels
 * @returns Text parts and mentions in order
 */
export function splitMentions(text: string, targets: MentionTarget[]): TextPart[] {
  const pattern = mentionPattern(targets);
  if (!pattern) return [{ text, kind: 'text' }];
  const parts: TextPart[] = [];
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    if (match.index > last) parts.push({ text: text.slice(last, match.index), kind: 'text' });
    parts.push(toMention(match[0], targets));
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last), kind: 'text' });
  return parts;
}

/**
 * `@` followed by a user name or "#" followed by a channel name, not inside a word.
 *
 * @param targets - Known people and channels
 * @returns Regular expression, or null when nothing can be mentioned
 */
function mentionPattern(targets: MentionTarget[]): RegExp | null {
  const users = namesOf(targets, 'user');
  const channels = namesOf(targets, 'channel');
  const alternatives: string[] = [];
  if (users.length) alternatives.push(`@(?:${users.join('|')})`);
  if (channels.length) alternatives.push(`#(?:${channels.join('|')})`);
  if (!alternatives.length) return null;
  return new RegExp(`(?:${alternatives.join('|')})(?![\\p{L}\\p{N}])`, 'giu');
}

/**
 * Longest names first, so `@Noah Braun` wins over a user called "Noah". Empty names are skipped.
 *
 * @param targets - Known people and channels
 * @param kind - user or channel
 * @returns Escaped names, longest first
 */
function namesOf(targets: MentionTarget[], kind: MentionTarget['kind']): string[] {
  return targets
    .filter((target) => target.kind === kind && target.name.trim())
    .map((target) => escapeRegExp(target.name))
    .sort((a, b) => b.length - a.length);
}

/**
 * Turns a match into a mention.
 *
 * @param found - Matched text, e.g. `@Sofia Müller`
 * @param targets - Known people and channels
 * @returns Mention with ID, or plain text when nobody matches
 */
function toMention(found: string, targets: MentionTarget[]): TextPart {
  const kind = found.startsWith('@') ? 'user' : 'channel';
  const name = found.slice(1).toLowerCase();
  const target = targets.find((item) => item.kind === kind && item.name.toLowerCase() === name);
  return target ? { text: found, kind, id: target.id } : { text: found, kind: 'text' };
}

/**
 * Names may contain characters with a special meaning in regular expressions, e.g. "C++".
 *
 * @param value - Any name
 * @returns The name with special characters escaped
 */
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
