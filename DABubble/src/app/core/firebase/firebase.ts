import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { environment } from '../../../environments/environment';

/** One Firebase connection for the whole app. Services import auth and db from here. */
export const firebaseApp = initializeApp(environment.firebase);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);

auth.languageCode = 'de'; // emails from Firebase (password reset) in German
