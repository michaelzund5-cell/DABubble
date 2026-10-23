import { effect, inject, Injectable } from '@angular/core';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { UserStatus } from '../../shared/models/user.model';
import { SessionService } from '../auth/session.service';
import { db } from '../firebase/firebase';
import { reportError } from '../firebase/report-error';

const HEARTBEAT_MS = 60_000; // an open, visible tab reports "still here" every minute

/** Without a sign of life for this long, a user counts as offline (closed tab, crashed browser, no network). */
export const ONLINE_WINDOW_MS = 150_000;

/** Keeps the own online status correct, also when the tab is simply closed. */
@Injectable({ providedIn: 'root' })
export class PresenceService {
  private readonly session = inject(SessionService);
  private timer?: ReturnType<typeof setInterval>;

  constructor() {
    effect(() => this.start(this.session.currentUserId()));
    // Closing or leaving the page: try to say goodbye. If that does not arrive, the heartbeat simply stops.
    window.addEventListener('pagehide', () => this.write('offline'));
    document.addEventListener('visibilitychange', () => this.beatIfVisible());
  }

  /**
   * Starts or stops the heartbeat.
   * * @param userId - Current user, null after logout
   *
   * @param userId - Current user, null after logout
   */
  private start(userId: string | null): void {
    clearInterval(this.timer);
    if (!userId) return;
    this.write('online');
    this.timer = setInterval(() => this.beatIfVisible(), HEARTBEAT_MS);
  }

  /** A tab in the background sends nothing, so after a while it shows as offline. */
  private beatIfVisible(): void {
    if (document.visibilityState === 'visible') this.write('online');
  }

  /**
   * Saves the own status.
   * * @param status - "online" (with server time) or "offline"
   *
   * @param status - "online" (with server time) or "offline"
   */
  private write(status: UserStatus): void {
    const userId = this.session.currentUserId();
    if (!userId) return;
    const data = status === 'online' ? { status, lastActive: serverTimestamp() } : { status };
    updateDoc(doc(db, 'users', userId), data).catch((error) => reportError('Online-Status', error));
  }
}
