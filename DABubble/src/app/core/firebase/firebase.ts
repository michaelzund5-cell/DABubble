import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { environment } from '../../../environments/environment';

// One Firebase connection for the whole app. Services import auth and db from here.
export const firebaseApp = initializeApp(environment.firebase);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);

auth.languageCode = 'de'; // emails from Firebase (password reset) in German

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Verbindung zu Firebase, einmal für die ganze App.
 * - initializeApp(): verbindet die App mit dem Projekt "dabubble-4cf82"
 *   (Werte aus src/environments/environment.ts).
 * - auth: Anmeldung (E-Mail/Passwort, Google, Gast).
 * - db: die Firestore-Datenbank.
 * - languageCode 'de': E-Mails von Firebase (z. B. Passwort zurücksetzen)
 *   kommen auf Deutsch.
 * Die Services importieren auth und db von hier. Components greifen nie
 * direkt auf Firebase zu.
 */
