// A piece of a message text: normal text, or a mention that links to a person or a channel.
export interface TextPart {
  text: string;
  kind: 'text' | 'user' | 'channel';
  id?: string; // user ID or channel ID, only for mentions
}

// Something that can be mentioned: "@Sofia Müller" (user) or "#Entwicklerteam" (channel).
export interface MentionTarget {
  name: string;
  kind: 'user' | 'channel';
  id: string;
}

// Splits a message into text and mentions. Only known names become mentions, the rest stays text.
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

// "@" followed by a user name or "#" followed by a channel name, not inside a word.
function mentionPattern(targets: MentionTarget[]): RegExp | null {
  const users = namesOf(targets, 'user');
  const channels = namesOf(targets, 'channel');
  const alternatives: string[] = [];
  if (users.length) alternatives.push(`@(?:${users.join('|')})`);
  if (channels.length) alternatives.push(`#(?:${channels.join('|')})`);
  if (!alternatives.length) return null;
  return new RegExp(`(?:${alternatives.join('|')})(?![\\p{L}\\p{N}])`, 'giu');
}

// Longest names first, so "@Noah Braun" wins over a user called "Noah". Empty names are skipped.
function namesOf(targets: MentionTarget[], kind: MentionTarget['kind']): string[] {
  return targets
    .filter((target) => target.kind === kind && target.name.trim())
    .map((target) => escapeRegExp(target.name))
    .sort((a, b) => b.length - a.length);
}

function toMention(found: string, targets: MentionTarget[]): TextPart {
  const kind = found.startsWith('@') ? 'user' : 'channel';
  const name = found.slice(1).toLowerCase();
  const target = targets.find((item) => item.kind === kind && item.name.toLowerCase() === name);
  return target ? { text: found, kind, id: target.id } : { text: found, kind: 'text' };
}

// Names may contain characters with a special meaning in regular expressions, e.g. "C++".
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Zerlegt den Text einer Nachricht in Teile, damit @Name und #Channel
 * als Link angezeigt werden können (Feedback der Akademie).
 * - splitMentions(): sucht alle Erwähnungen und gibt eine Liste zurück:
 *   normaler Text und Erwähnungen abwechselnd. Der Text selbst wird nie
 *   als HTML behandelt, nur aufgeteilt (Sicherheit: kein innerHTML).
 * - mentionPattern(): baut aus den bekannten Namen einen regulären
 *   Ausdruck, zum Beispiel @(Sofia Müller|Noah Braun)|#(Allgemein).
 * - namesOf(): Namen einer Art (Personen oder Channels), längere zuerst,
 *   damit "@Noah Braun" nicht nur "@Noah" trifft. Leere Namen fallen weg.
 *   (?![\p{L}\p{N}]): Direkt nach dem Namen darf kein Buchstabe und keine
 *   Zahl kommen, sonst wäre "#Allgemeines" ein Treffer für "#Allgemein".
 *   Flag i: Gross- und Kleinschreibung egal, u: Umlaute zählen als
 *   Buchstaben.
 * - toMention(): sucht zum Treffer die passende Person bzw. den Channel.
 * - escapeRegExp(): Sonderzeichen in Namen (z. B. "C++") werden
 *   maskiert, damit der Ausdruck nicht kaputtgeht.
 * - Nur Channels, in denen man Mitglied ist, werden zum Link. Die
 *   anderen kennt die App gar nicht, sie bleiben normaler Text.
 */
