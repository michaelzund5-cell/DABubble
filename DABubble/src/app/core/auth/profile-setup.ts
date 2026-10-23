import { User as AuthUser } from 'firebase/auth';
import { arrayUnion, doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { DEFAULT_AVATAR } from '../../shared/models/avatars';
import { db } from '../firebase/firebase';

/** The public channel every user joins automatically, so new users are never alone. */
export const PUBLIC_CHANNEL_ID = 'allgemein';

/**
 * Creates `users/{uid}` on the first login, otherwise only sets the status to "online".
 *
 * @param user - The signed-in Firebase user
 * @param pendingName - Name from the register form, empty for guest and Google
 */
export async function ensureUserProfile(user: AuthUser, pendingName: string): Promise<void> {
  const ref = doc(db, 'users', user.uid);
  const existing = await getDoc(ref);
  if (existing.exists()) {
    await updateDoc(ref, { status: 'online', lastActive: serverTimestamp() });
    return;
  }
  const name = user.isAnonymous ? guestName() : (pendingName || user.displayName || 'Neuer Benutzer');
  await setDoc(ref, { name: name.slice(0, 60), email: user.email ?? '', avatar: DEFAULT_AVATAR, status: 'online',
    lastActive: serverTimestamp() });
}

/**
 * Random number so guests can be told apart, e.g. "Gast 4821".
 *
 * @returns e.g. "Gast 4821"
 */
function guestName(): string {
  return `Gast ${1000 + Math.floor(Math.random() * 9000)}`;
}

/**
 * Joins "Allgemein", or creates it if this is the very first user.
 *
 * @param uid - ID of the user who joins
 */
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

/**
 * Sets the user offline.
 *
 * @param uid - ID of the user
 */
export async function setOffline(uid: string): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { status: 'offline' });
}
