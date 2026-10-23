import { doc, DocumentData, DocumentReference, runTransaction, serverTimestamp, Transaction } from 'firebase/firestore';
import { db } from '../firebase/firebase';

/** Thrown inside a transaction when another channel already uses the name. */
export class NameTakenError extends Error {}

/**
 * Every channel name is reserved in `channelNames/{name in lower case}` with the field `channelId`.
 * Firestore creates a document only once, so two channels can never get the same name,
 * not even when the creator has left the old channel and no longer sees it.
 *
 * @param name - Channel name, any case
 * @returns Reference to `channelNames/{name in lower case}`
 */
function nameRef(name: string): DocumentReference {
  return doc(db, 'channelNames', name.toLowerCase());
}

/**
 * Creates the channel and reserves its name in one step: either both are saved or nothing.
 *
 * @param channelRef - Reference of the new channel
 * @param data - Channel fields without createdAt
 */
export async function createWithName(channelRef: DocumentReference, data: DocumentData): Promise<void> {
  await runTransaction(db, async (transaction) => {
    if ((await transaction.get(nameRef(data['name']))).exists()) throw new NameTakenError();
    transaction.set(channelRef, { ...data, createdAt: serverTimestamp() });
    transaction.set(nameRef(data['name']), { channelId: channelRef.id });
  });
}

/**
 * Renames the channel: reserves the new name and releases the old one in the same step.
 *
 * @param channelId - ID of the renamed channel
 * @param oldName - Current name
 * @param newName - Cleaned new name
 */
export async function renameWithName(channelId: string, oldName: string, newName: string): Promise<void> {
  await runTransaction(db, async (transaction) => {
    const newEntry = await readEntry(transaction, newName);
    if (newEntry && newEntry['channelId'] !== channelId) throw new NameTakenError();
    const oldEntry = oldName.toLowerCase() === newName.toLowerCase() ? null : await readEntry(transaction, oldName);
    transaction.update(doc(db, 'channels', channelId), { name: newName });
    if (!newEntry) transaction.set(nameRef(newName), { channelId });
    if (oldEntry?.['channelId'] === channelId) transaction.delete(nameRef(oldName));
  });
}

/**
 * Channels created before this list existed get their entry afterwards (when a member opens the app).
 *
 * @param channelId - ID of the existing channel
 * @param name - Its current name
 */
export async function reserveExistingName(channelId: string, name: string): Promise<void> {
  await runTransaction(db, async (transaction) => {
    if (!(await readEntry(transaction, name))) transaction.set(nameRef(name), { channelId });
  });
}

/**
 * Reads a name entry inside a transaction.
 *
 * @param transaction - The running transaction
 * @param name - Channel name
 * @returns The entry, or null when the name is free
 */
async function readEntry(transaction: Transaction, name: string): Promise<DocumentData | null> {
  const snapshot = await transaction.get(nameRef(name));
  return snapshot.exists() ? snapshot.data() : null;
}
