/**
 * Central place for unexpected Firebase errors (network, missing rights).
 * Only technical details go to the console. Users get their own, short messages in the pages.
 *
 * @param context - Short label, e.g. "Nachricht senden"
 * @param error - The error
 */
export function reportError(context: string, error: unknown): void {
  console.error(`[DABubble] ${context}`, error);
}
