import { Unsubscribe } from 'firebase/firestore';

/** Keeps exactly one live listener per key (e.g. one per channel) and closes the ones no longer needed. */
export class ListenerSet {
  private readonly listeners = new Map<string, Unsubscribe>();

  /**
   * Opens listeners for new keys and closes listeners for keys that disappeared.
   *
   * @param keys - Keys that need a listener
   * @param open - Opens the listener for one key
   */
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

  /**
   * Opens the listener for a key again, e.g. after an error. Does nothing if the key is no longer needed.
   *
   * @param key - Key of the listener
   * @param open - Opens the listener again
   */
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
