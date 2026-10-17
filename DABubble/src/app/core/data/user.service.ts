import { computed, inject, Injectable, signal } from '@angular/core';
import { User } from '../../shared/models/user.model';
import { validateName } from '../../shared/utils/validators';
import { SessionService } from '../auth/session.service';
import { DEMO_USERS } from './demo-seed';

// Responsible for user data only.
@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly session = inject(SessionService);

  // Private writable signal; components only get the read-only version below.
  private readonly usersState = signal<User[]>(DEMO_USERS);
  readonly users = this.usersState.asReadonly();

  // The logged-in user (undefined if nobody is logged in).
  readonly currentUser = computed(() => this.getById(this.session.currentUserId()));

  // All users except the logged-in one, e.g. for the direct message list.
  readonly otherUsers = computed(() => this.users().filter((user) => user.id !== this.session.currentUserId()));

  getById(id: string | null | undefined): User | undefined {
    if (!id) return undefined;
    return this.users().find((user) => user.id === id);
  }

  // Demo: adds a user locally. With Firebase the user document is stored in Firestore.
  addUser(name: string, email: string, avatar: string): string {
    const user: User = { id: crypto.randomUUID(), name, email, avatar, initials: toInitials(name), status: 'online' };
    this.usersState.update((users) => [...users, user]);
    return user.id;
  }

  emailExists(email: string): boolean {
    const clean = email.trim().toLowerCase();
    return this.users().some((user) => user.email.toLowerCase() === clean);
  }

  // User story 4: change own name and avatar. Returns an error text, or '' when saved.
  updateProfile(name: string, avatar: string): string {
    const error = validateName(name);
    const id = this.session.currentUserId();
    if (error || !id) return error || 'Bitte melde dich erneut an.';
    const cleanName = name.trim().replace(/\s+/g, ' ');
    this.usersState.update((users) => users.map((user) =>
      user.id === id ? { ...user, name: cleanName, avatar, initials: toInitials(cleanName) } : user));
    return '';
  }
}

// "Frederik Beck" -> "FB"
function toInitials(name: string): string {
  return name.trim().split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase();
}

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Der UserService ist nur für Benutzerdaten zuständig.
 *
 * - inject(SessionService): Holt den SessionService, um zu wissen, wer
 *   eingeloggt ist.
 * - usersState ist privat und beschreibbar. Nach außen gibt es nur
 *   users, eine schreibgeschützte Version (asReadonly). So kann keine
 *   Component die Liste aus Versehen direkt verändern. Änderungen
 *   laufen immer über Methoden des Services (Kapselung).
 * - currentUser: Der eingeloggte Benutzer, automatisch berechnet.
 * - otherUsers: Alle außer mir selbst, für die Liste der
 *   Direktnachrichten.
 * - getById(): Sucht einen Benutzer anhand der ID. find() gibt das
 *   erste passende Element zurück oder undefined.
 * - addUser(): legt einen Benutzer an (Demo) und gibt die neue ID zurück.
 * - emailExists(): Prüft, ob die E-Mail schon vergeben ist
 *   (Registrierung, Gross-/Kleinschreibung egal).
 * - updateProfile(): ändert Name und Avatar des eingeloggten Benutzers
 *   (User Story 4). Der Name wird wie bei der Registrierung geprüft.
 *   Nur der eigene Eintrag kann geändert werden.
 *
 * Später lädt dieser Service die Benutzer aus der Datenbank. Die
 * Components merken davon nichts, weil sie nur den Service benutzen.
 */
