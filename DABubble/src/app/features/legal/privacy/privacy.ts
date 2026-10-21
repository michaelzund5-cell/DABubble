import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface PrivacySection {
  title: string;
  text: string;
}

const CONTACT_EMAIL = 'michi.zuend99@hotmail.com';

// Privacy policy of the learning project. Facts match the code: Firebase Auth, Firestore in Zurich, local fonts.
const SECTIONS: readonly PrivacySection[] = [
  {
    title: '1. Controller',
    text: `Michael Zünd, Alvirstrasse 11a, 9463 Oberriet, Switzerland. Email: ${CONTACT_EMAIL}.`,
  },
  {
    title: '2. Purpose',
    text: 'DABubble is a learning project created as part of the training program at Developer Akademie. ' +
      'Data is only processed so that the chat app works. There is no advertising, no tracking and no sale of data.',
  },
  {
    title: '3. Data we process',
    text: 'Account: name, email address, chosen avatar and password (the password is handled by Firebase only, ' +
      'the app never stores it). Usage: messages, reactions, channels you belong to and your online status. ' +
      'Guest login: an anonymous account without email address.',
  },
  {
    title: '4. Firebase (Google)',
    text: 'Login and data storage use Firebase, a service of Google. Messages, channels and profiles are stored ' +
      'in Firestore in Zurich, Switzerland (region europe-west6). Login data is handled by Firebase Authentication ' +
      'and may also be processed by Google outside Switzerland, including in the USA.',
  },
  {
    title: '5. Hosting',
    text: 'The app is hosted on a web server of Developer Akademie (developerakademie.net). When you open the page, ' +
      'the server may record technical data such as IP address, browser type and time of access.',
  },
  {
    title: '6. Browser storage',
    text: 'Firebase keeps your login session in the storage of your browser, so you stay logged in. ' +
      'The app sets no tracking or advertising cookies.',
  },
  {
    title: '7. Fonts',
    text: 'All fonts are loaded from our own server. No connection to Google Fonts is made.',
  },
  {
    title: '8. Storage period',
    text: 'Account data and messages are kept until the account is deleted. Guest accounts are deleted ' +
      'automatically after 30 days. You can ask for the deletion of your account at any time by email.',
  },
  {
    title: '9. Your rights',
    text: `Under the Swiss Federal Act on Data Protection (FADP) you can ask for access to your data, ` +
      `its correction or its deletion. Write to ${CONTACT_EMAIL}. You can also file a complaint with the ` +
      'Federal Data Protection and Information Commissioner (FDPIC).',
  },
  {
    title: '10. Last updated',
    text: 'October 2026',
  },
];

@Component({
  selector: 'app-privacy-page',
  imports: [RouterLink],
  templateUrl: './privacy.html',
  styleUrl: './privacy.scss',
})
export class PrivacyPage {
  readonly sections = SECTIONS;
}

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Logik der Datenschutz-Seite (Text auf Englisch).
 * - Die Abschnitte stehen als Liste im Code (SECTIONS), nicht zehnmal
 *   kopiert im HTML. Das HTML zeigt sie mit @for an.
 * - interface PrivacySection: legt fest, dass jeder Abschnitt einen
 *   Titel und einen Text hat. TypeScript prüft das beim Bauen.
 * - CONTACT_EMAIL: steht nur einmal im Code und wird in Abschnitt 1 und 9
 *   eingesetzt. Ändert sich die Adresse, nur hier anpassen.
 * - Inhalt passt zum Projekt: Firebase-Login, Firestore in Zürich,
 *   Gäste nach 30 Tagen gelöscht, Schriften lokal, kein Tracking.
 * - Abschnitt 9: Rechte nach dem Schweizer Datenschutzgesetz (DSG),
 *   Beschwerde beim EDÖB (englisch FDPIC).
 */
