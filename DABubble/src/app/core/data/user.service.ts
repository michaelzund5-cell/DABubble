import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { collection, doc, onSnapshot, Unsubscribe, updateDoc } from 'firebase/firestore';
import { AVATARS, DEFAULT_AVATAR } from '../../shared/models/avatars';
import { User } from '../../shared/models/user.model';
import { validateName } from '../../shared/utils/validators';
import { SessionService } from '../auth/session.service';
import { ONLINE_WINDOW_MS } from './presence.service';
import { db } from '../firebase/firebase';
import { toUser } from '../firebase/mappers';
import { reportError } from '../firebase/report-error';

/** Responsible for user data. All users are loaded live from Firestore while someone is logged in. */
@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly session = inject(SessionService);

  /** Users as they come from Firestore. Components only see the checked and sorted list below. */
  private readonly usersState = signal<User[]>([]);
  private readonly now = signal(Date.now()); // ticks every 30 s, so stale "online" users turn offline

  /** Users in a stable order: yourself first, then alphabetical. */
  readonly users = computed(() => this.usersState()
    .map((user) => this.withPresence(user))
    .sort((a, b) => this.rank(a) - this.rank(b) || a.name.localeCompare(b.name, 'de')));

  /** The logged-in user (undefined if nobody is logged in). */
  readonly currentUser = computed(() => this.getById(this.session.currentUserId()));

  /** All users except the logged-in one, e.g. for the direct message list. */
  readonly otherUsers = computed(() => this.users().filter((user) => user.id !== this.session.currentUserId()));

  private unsubscribe: Unsubscribe | null = null;

  constructor() {
    effect(() => this.listen(this.session.currentUserId()));
    setInterval(() => this.now.set(Date.now()), 30_000);
  }

  /**
   * Finds a user.
   *
   * @param id - User ID
   * @returns The user, or undefined
   */
  getById(id: string | null | undefined): User | undefined {
    if (!id) return undefined;
    return this.users().find((user) => user.id === id);
  }

  /**
   * Messages may outlive their sender (e.g. deleted guest accounts): show "Unbekannt" instead of nothing.
   *
   * @param id - User ID
   * @returns The user, or a placeholder "Unbekannt"
   */
  displayUser(id: string): User {
    return this.getById(id) ?? { id, name: 'Unbekannt', email: '', initials: '?', status: 'offline', avatar: DEFAULT_AVATAR };
  }

  /**
   * User story 4: change own name and avatar. Returns an error text, or '' when saved.
   *
   * @param name - New name
   * @param avatar - Path of the chosen avatar
   * @returns Error text, or an empty string when saved
   */
  updateProfile(name: string, avatar: string): string {
    const error = validateName(name);
    const id = this.session.currentUserId();
    if (error || !id) return error || 'Bitte melde dich erneut an.';
    if (!AVATARS.includes(avatar)) return 'Bitte wähle einen Avatar aus der Liste.';
    const cleanName = name.trim().replace(/\s+/g, ' ');
    updateDoc(doc(db, 'users', id), { name: cleanName, avatar }).catch((err) => reportError('Profil speichern', err));
    return '';
  }

  /**
   * "online" only counts with a recent sign of life (closed tabs send none). You are always online yourself.
   *
   * @param user - User from Firestore
   * @returns The user with the checked status
   */
  private withPresence(user: User): User {
    const own = user.id === this.session.currentUserId();
    const recent = (user.lastActive ?? 0) > this.now() - ONLINE_WINDOW_MS;
    return user.status === 'online' && (own || recent) ? user : { ...user, status: 'offline' };
  }

  /**
   * Sort rank.
   *
   * @param user - A user
   * @returns 0 for yourself, 1 for everyone else
   */
  private rank(user: User): number {
    return user.id === this.session.currentUserId() ? 0 : 1;
  }

  /**
   * Starts the live list after login, stops it after logout.
   * * @param userId - Current user, null after logout
   *
   * @param userId - Current user, null after logout
   */
  private listen(userId: string | null): void {
    this.unsubscribe?.();
    this.unsubscribe = null;
    this.usersState.set([]);
    if (!userId) return;
    this.unsubscribe = onSnapshot(collection(db, 'users'),
      (snapshot) => this.usersState.set(snapshot.docs.map(toUser)),
      (error) => reportError('Benutzer laden', error));
  }
}
