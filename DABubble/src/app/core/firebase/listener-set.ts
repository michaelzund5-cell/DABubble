import { Unsubscribe } from 'firebase/firestore';

// Keeps exactly one live listener per key (e.g. one per channel) and closes the ones no longer needed.
export class ListenerSet {
  private readonly listeners = new Map<string, Unsubscribe>();

  // Opens listeners for new keys and closes listeners for keys that disappeared.
  sync(keys: string[], open: (key: string) => Unsubscribe): void {
    for (const [key, close] of this.listeners) {
      if (!keys.includes(key)) {
        close();
        this.listeners.delete(key);
      }
    }
    for (const key of keys) {
      if (!this.listeners.has(key)) this.listeners.set(key, open(key));
    }
  }

  // Opens the listener for a key again, e.g. after an error. Does nothing if the key is no longer needed.
  reopen(key: string, open: (key: string) => Unsubscribe): void {
    const close = this.listeners.get(key);
    if (!close) return;
    close();
    this.listeners.set(key, open(key));
  }

  closeAll(): void {
    this.sync([], () => () => undefined);
  }
}

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Verwaltet Echtzeit-Verbindungen zu Firestore (Listener).
 * - Pro Schlüssel (z. B. pro Channel) gibt es genau einen Listener.
 * - sync(): öffnet Listener für neue Channels und schliesst Listener für
 *   Channels, die weggefallen sind (z. B. nach "Channel verlassen").
 * - reopen(): öffnet einen Listener neu, z. B. nach einem Fehler. Ist der
 *   Channel inzwischen weg, passiert nichts.
 * - closeAll(): schliesst alles, z. B. beim Abmelden. Offene Listener
 *   würden sonst nach dem Logout an den Sicherheitsregeln scheitern und
 *   Speicher verbrauchen.
 */
