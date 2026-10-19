import { User as AuthUser } from 'firebase/auth';
import { arrayUnion, doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { DEFAULT_AVATAR } from '../../shared/models/avatars';
import { db } from '../firebase/firebase';

// The public channel every user joins automatically, so new users are never alone.
export const PUBLIC_CHANNEL_ID = 'allgemein';

// Creates users/{uid} on the first login, otherwise only sets the status to "online".
export async function ensureUserProfile(user: AuthUser, pendingName: string): Promise<void> {
  const ref = doc(db, 'users', user.uid);
  const existing = await getDoc(ref);
  if (existing.exists()) {
    await updateDoc(ref, { status: 'online' });
    return;
  }
  const name = user.isAnonymous ? 'Gast' : (pendingName || user.displayName || 'Neuer Benutzer');
  await setDoc(ref, { name: name.slice(0, 60), email: user.email ?? '', avatar: DEFAULT_AVATAR, status: 'online' });
}

// Joins "Allgemein", or creates it if this is the very first user.
export async function joinPublicChannel(uid: string): Promise<void> {
  const ref = doc(db, 'channels', PUBLIC_CHANNEL_ID);
  const channel = await getDoc(ref);
  if (!channel.exists()) {
    await setDoc(ref, { name: 'Allgemein', description: 'Hier ist das ganze Team. Sag hallo!', isPublic: true,
      memberIds: [uid], createdBy: uid, createdAt: serverTimestamp() });
  } else if (!(channel.data()['memberIds'] as string[]).includes(uid)) {
    await updateDoc(ref, { memberIds: arrayUnion(uid) });
  }
}

export async function setOffline(uid: string): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { status: 'offline' });
}

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Was beim Anmelden in der Datenbank passiert.
 * - ensureUserProfile(): Beim ersten Login wird das Profil
 *   users/{uid} angelegt (Name, E-Mail, Standard-Avatar, online).
 *   Danach wird bei jedem Login nur der Status auf "online" gesetzt.
 *   Gäste heissen "Gast". Der Name wird auf 60 Zeichen gekürzt.
 * - joinPublicChannel(): Jeder Benutzer kommt automatisch in den Channel
 *   "Allgemein". Gibt es ihn noch nicht (allererster Benutzer), wird er
 *   angelegt. So sieht man sich gegenseitig und kann schreiben.
 * - setOffline(): beim Abmelden.
 * - Die Sicherheitsregeln (firestore.rules) erlauben jedem nur sein
 *   eigenes Profil und bei "Allgemein" nur, sich selbst hinzuzufügen.
 * Hinweis: Wird der Browser einfach geschlossen, bleibt der Status
 * "online". Ein genauer Online-Status bräuchte zusätzlich die Firebase
 * Realtime Database (Presence), das ist ein späterer Schritt.
 */
