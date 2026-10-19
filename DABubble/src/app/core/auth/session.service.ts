import { computed, Injectable, signal } from '@angular/core';
import {
  createUserWithEmailAndPassword, GoogleAuthProvider, onAuthStateChanged, signInAnonymously, signInWithEmailAndPassword,
  signInWithPopup, signOut, updateProfile, User as AuthUser,
} from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { reportError } from '../firebase/report-error';
import { ensureUserProfile, joinPublicChannel, setOffline } from './profile-setup';

export type LoginResult = 'ok' | 'invalid' | 'blocked' | 'cancelled' | 'failed';
export type RegisterResult = 'ok' | 'email-in-use' | 'weak-password' | 'failed';

// Login state, backed by Firebase Authentication.
@Injectable({ providedIn: 'root' })
export class SessionService {
  // ID of the logged-in user, or null. Only set after the profile in Firestore exists.
  readonly currentUserId = signal<string | null>(null);
  readonly isLoggedIn = computed(() => this.currentUserId() !== null);

  // Resolves once Firebase has restored a session after reloading the page (used by the guard).
  readonly ready: Promise<void>;

  private pendingName = ''; // name from the register form, used when the profile is created
  private readonly applying = new Map<string, Promise<void>>();

  constructor() {
    this.ready = new Promise((resolve) => {
      onAuthStateChanged(auth, (user) => void this.applyUser(user).then(resolve));
    });
  }

  async login(email: string, password: string): Promise<LoginResult> {
    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      await this.applyUser(credential.user);
      return 'ok';
    } catch (error) {
      // Wrong email and wrong password give the same result: nobody can test which emails exist.
      return toLoginResult(errorCode(error));
    }
  }

  async loginAsGuest(): Promise<LoginResult> {
    return this.run(async () => (await signInAnonymously(auth)).user);
  }

  async loginWithGoogle(): Promise<LoginResult> {
    return this.run(async () => (await signInWithPopup(auth, new GoogleAuthProvider())).user);
  }

  // Creates the account. The user is logged in afterwards (needed for the avatar step).
  async register(name: string, email: string, password: string): Promise<RegisterResult> {
    try {
      this.pendingName = name;
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(credential.user, { displayName: name });
      await this.applyUser(credential.user);
      return 'ok';
    } catch (error) {
      return toRegisterResult(errorCode(error));
    }
  }

  async logout(): Promise<void> {
    const uid = this.currentUserId();
    if (uid) await setOffline(uid).catch((error) => reportError('Status offline', error));
    await signOut(auth);
  }

  // Shared part of guest and Google login. A closed Google popup is not an error.
  private async run(signIn: () => Promise<AuthUser>): Promise<LoginResult> {
    try {
      await this.applyUser(await signIn());
      return 'ok';
    } catch (error) {
      const code = errorCode(error);
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return 'cancelled';
      reportError('Login', error);
      return 'failed';
    }
  }

  // Runs once per user, even if Firebase and the login method call it at the same time.
  private applyUser(user: AuthUser | null): Promise<void> {
    if (!user) return Promise.resolve(this.clear());
    const running = this.applying.get(user.uid) ?? this.setUp(user);
    this.applying.set(user.uid, running);
    return running;
  }

  private async setUp(user: AuthUser): Promise<void> {
    try {
      await ensureUserProfile(user, this.pendingName);
      await joinPublicChannel(user.uid);
    } catch (error) {
      reportError('Profil einrichten', error);
    }
    this.currentUserId.set(user.uid);
  }

  private clear(): void {
    this.applying.clear();
    this.pendingName = '';
    this.currentUserId.set(null);
  }
}

function errorCode(error: unknown): string {
  return typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : '';
}

function toLoginResult(code: string): LoginResult {
  if (code === 'auth/too-many-requests') return 'blocked';
  if (code === 'auth/network-request-failed') return 'failed';
  return 'invalid';
}

function toRegisterResult(code: string): RegisterResult {
  if (code === 'auth/email-already-in-use') return 'email-in-use';
  if (code === 'auth/weak-password') return 'weak-password';
  return 'failed';
}

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Anmeldestatus der App, jetzt mit Firebase Authentication.
 * - currentUserId: ID des angemeldeten Benutzers oder null. Wird erst
 *   gesetzt, wenn sein Profil in der Datenbank existiert. So laden die
 *   anderen Services nie Daten für einen halb angelegten Benutzer.
 * - ready: Nach dem Neuladen stellt Firebase die Anmeldung kurz
 *   verzögert wieder her. Der Guard wartet darauf, sonst würde man kurz
 *   auf den Login geworfen.
 * - login(): E-Mail und Passwort. Falsche E-Mail und falsches Passwort
 *   ergeben dasselbe Ergebnis ('invalid'), damit niemand testen kann,
 *   welche E-Mails ein Konto haben. 'blocked': Firebase sperrt nach
 *   zu vielen Fehlversuchen kurz (Schutz gegen Passwort-Raten).
 *   'failed': keine Internetverbindung.
 * - loginAsGuest(): anonymes Konto (wird nach 30 Tagen gelöscht).
 * - loginWithGoogle(): Google-Fenster. Schliesst man es, ist das kein
 *   Fehler ('cancelled').
 * - register(): legt das Konto an. Das Passwort geht direkt an Firebase
 *   und wird in der App nirgends gespeichert.
 * - logout(): Status auf "offline", dann abmelden.
 * - applyUser(): wird von Firebase und von der Login-Methode fast
 *   gleichzeitig aufgerufen. Die Map "applying" sorgt dafür, dass das
 *   Profil nur einmal eingerichtet wird.
 * - errorCode(): liest den Fehlercode von Firebase sicher aus.
 */
