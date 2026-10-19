import { inject, Injectable, signal } from '@angular/core';
import { deleteUser } from 'firebase/auth';
import { arrayRemove, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { AVATARS } from '../../shared/models/avatars';
import { auth, db } from '../firebase/firebase';
import { reportError } from '../firebase/report-error';
import { PUBLIC_CHANNEL_ID } from './profile-setup';
import { RegisterResult, SessionService } from './session.service';

// Name for the avatar page, name and email to refill the form after "back". Never the password.
export interface RegistrationDraft {
  name: string;
  email: string;
}

// Registration in two steps: 1. account (register page), 2. avatar (avatar page).
@Injectable({ providedIn: 'root' })
export class RegistrationService {
  private readonly session = inject(SessionService);
  private readonly draftState = signal<RegistrationDraft | null>(null);
  readonly draft = this.draftState.asReadonly();

  // Step 1: creates the Firebase account. The password is passed on and never stored.
  async createAccount(name: string, email: string, password: string): Promise<RegisterResult> {
    const result = await this.session.register(name, email, password);
    if (result === 'ok') this.draftState.set({ name, email: email.trim() });
    return result;
  }

  // Step 2: saves the avatar, then logs out (Figma: back to the login page after the toast).
  async complete(avatar: string): Promise<boolean> {
    const uid = this.session.currentUserId();
    if (!uid || !AVATARS.includes(avatar)) return false;
    try {
      await updateDoc(doc(db, 'users', uid), { avatar });
      this.draftState.set(null);
      await this.session.logout();
      return true;
    } catch (error) {
      reportError('Avatar speichern', error);
      return false;
    }
  }

  // Back arrow on the avatar page: deletes the half-created account, so the email can be used again.
  async cancel(): Promise<void> {
    const user = auth.currentUser;
    if (!user) return;
    try {
      await updateDoc(doc(db, 'channels', PUBLIC_CHANNEL_ID), { memberIds: arrayRemove(user.uid) });
      await deleteDoc(doc(db, 'users', user.uid));
      await deleteUser(user);
    } catch (error) {
      reportError('Registrierung abbrechen', error);
    }
  }
}

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Registrierung in zwei Schritten.
 * - createAccount() (Seite "Konto erstellen"): legt das Konto bei
 *   Firebase an. Das Passwort wird direkt weitergegeben und nirgends in
 *   der App gespeichert. Im Entwurf (draft) steht nur noch der Name für
 *   die Avatar-Seite und die E-Mail zum Wiederausfüllen.
 * - complete() (Seite "Wähle deinen Avatar"): speichert den Avatar im
 *   eigenen Profil und meldet ab. Danach geht es zum Login, wie in Figma.
 * - AVATARS.includes(): Nur Avatare aus der Liste sind erlaubt. Ein
 *   manipulierter Wert (z. B. ein fremder Bild-Link) wird abgelehnt. Die
 *   Firestore-Regeln prüfen das zusätzlich auf dem Server.
 * - cancel(): Zurück-Pfeil auf der Avatar-Seite. Das halb angelegte
 *   Konto wird gelöscht (Profil, Platz in "Allgemein", Konto), damit
 *   die E-Mail wieder frei ist.
 * - Schliesst jemand stattdessen einfach den Tab, existiert das Konto
 *   trotzdem, mit dem Standard-Avatar. Er kann ihn später im Profil
 *   ändern.
 */
