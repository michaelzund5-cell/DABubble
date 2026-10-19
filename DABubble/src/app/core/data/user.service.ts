import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { collection, doc, onSnapshot, Unsubscribe, updateDoc } from 'firebase/firestore';
import { AVATARS, DEFAULT_AVATAR } from '../../shared/models/avatars';
import { User } from '../../shared/models/user.model';
import { validateName } from '../../shared/utils/validators';
import { SessionService } from '../auth/session.service';
import { db } from '../firebase/firebase';
import { toUser } from '../firebase/mappers';
import { reportError } from '../firebase/report-error';

// Responsible for user data. All users are loaded live from Firestore while someone is logged in.
@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly session = inject(SessionService);

  // Private writable signal; components only get the read-only version below.
  private readonly usersState = signal<User[]>([]);
  readonly users = this.usersState.asReadonly();

  // The logged-in user (undefined if nobody is logged in).
  readonly currentUser = computed(() => this.getById(this.session.currentUserId()));

  // All users except the logged-in one, e.g. for the direct message list.
  readonly otherUsers = computed(() => this.users().filter((user) => user.id !== this.session.currentUserId()));

  private unsubscribe: Unsubscribe | null = null;

  constructor() {
    effect(() => this.listen(this.session.currentUserId()));
  }

  getById(id: string | null | undefined): User | undefined {
    if (!id) return undefined;
    return this.users().find((user) => user.id === id);
  }

  // Messages may outlive their sender (e.g. deleted guest accounts): show "Unbekannt" instead of nothing.
  displayUser(id: string): User {
    return this.getById(id) ?? { id, name: 'Unbekannt', email: '', initials: '?', status: 'offline', avatar: DEFAULT_AVATAR };
  }

  // User story 4: change own name and avatar. Returns an error text, or '' when saved.
  updateProfile(name: string, avatar: string): string {
    const error = validateName(name);
    const id = this.session.currentUserId();
    if (error || !id) return error || 'Bitte melde dich erneut an.';
    if (!AVATARS.includes(avatar)) return 'Bitte wähle einen Avatar aus der Liste.';
    const cleanName = name.trim().replace(/\s+/g, ' ');
    updateDoc(doc(db, 'users', id), { name: cleanName, avatar }).catch((err) => reportError('Profil speichern', err));
    return '';
  }

  // Starts the live list after login, stops it after logout.
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

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Der UserService ist für die Benutzerdaten zuständig, jetzt aus
 * Firestore (Sammlung "users").
 * - usersState ist privat und beschreibbar. Nach aussen gibt es nur
 *   users, eine schreibgeschützte Version (asReadonly). Änderungen
 *   laufen immer über Methoden des Services (Kapselung).
 * - listen(): Nach dem Login öffnet onSnapshot() eine Live-Verbindung.
 *   Ändert jemand seinen Namen oder Avatar, sehen es alle sofort. Nach
 *   dem Logout wird die Verbindung geschlossen und die Liste geleert.
 * - effect(): reagiert automatisch, wenn sich der angemeldete Benutzer
 *   ändert (Login, Logout).
 * - currentUser / otherUsers: wie bisher, automatisch berechnet.
 * - displayUser(): Ersatz "Unbekannt", falls es den Absender einer
 *   Nachricht nicht mehr gibt. Die Nachricht bleibt so sichtbar.
 * - updateProfile(): ändert Name und Avatar (User Story 4). Name wird
 *   geprüft, nur Avatare aus der Liste sind erlaubt. Die Anzeige
 *   aktualisiert sich sofort, Firestore speichert im Hintergrund.
 *   Die Sicherheitsregeln erlauben nur das eigene Profil.
 */
