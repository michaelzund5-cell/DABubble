import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface PrivacySection {
  title: string;
  text: string;
}

const CONTACT_EMAIL = 'michi.zuend99@hotmail.com';

/**
 * Privacy policy of the learning project, in German like the rest of the app.
 * Facts match the code: Firebase Auth, Firestore in Zurich, local fonts.
 */
const SECTIONS: readonly PrivacySection[] = [
  {
    title: '1. Verantwortlich',
    text: `Michael Zünd, Alvirstrasse 11a, 9463 Oberriet, Schweiz. E-Mail: ${CONTACT_EMAIL}.`,
  },
  {
    title: '2. Zweck',
    text: 'DABubble ist ein Lernprojekt der Weiterbildung bei der Developer Akademie. Daten werden nur ' +
      'verarbeitet, damit der Chat funktioniert. Es gibt keine Werbung, kein Tracking und keinen Verkauf von Daten.',
  },
  {
    title: '3. Welche Daten wir verarbeiten',
    text: 'Konto: Name, E-Mail-Adresse, gewählter Avatar und Passwort (das Passwort verwaltet nur Firebase, ' +
      'die App speichert es nie). Nutzung: Nachrichten, Reaktionen, deine Channels und dein Online-Status. ' +
      'Gäste-Login: ein anonymes Konto ohne E-Mail-Adresse.',
  },
  {
    title: '4. Firebase (Google)',
    text: 'Anmeldung und Speicherung laufen über Firebase, einen Dienst von Google. Nachrichten, Channels und ' +
      'Profile liegen in Firestore in Zürich, Schweiz (Region europe-west6). Die Anmeldedaten verwaltet ' +
      'Firebase Authentication. Sie können von Google auch ausserhalb der Schweiz verarbeitet werden, auch in den USA.',
  },
  {
    title: '5. Hosting',
    text: 'Die App liegt auf einem Webserver der Developer Akademie (developerakademie.net). Beim Aufruf der ' +
      'Seite kann der Server technische Daten wie IP-Adresse, Browser und Uhrzeit des Zugriffs speichern.',
  },
  {
    title: '6. Speicher im Browser',
    text: 'Firebase speichert deine Anmeldung im Speicher deines Browsers, damit du angemeldet bleibst. ' +
      'Die App setzt keine Tracking- oder Werbe-Cookies.',
  },
  {
    title: '7. Schriften',
    text: 'Alle Schriften werden vom eigenen Server geladen. Es gibt keine Verbindung zu Google Fonts.',
  },
  {
    title: '8. Speicherdauer',
    text: 'Kontodaten und Nachrichten bleiben gespeichert, bis das Konto gelöscht wird. Gastkonten werden ' +
      'nach 30 Tagen automatisch gelöscht. Die Löschung deines Kontos kannst du jederzeit per E-Mail verlangen.',
  },
  {
    title: '9. Deine Rechte',
    text: 'Nach dem Schweizer Datenschutzgesetz (DSG) kannst du Auskunft über deine Daten, ihre Berichtigung ' +
      `oder Löschung verlangen. Schreib an ${CONTACT_EMAIL}. Ausserdem kannst du dich beim Eidgenössischen ` +
      'Datenschutz- und Öffentlichkeitsbeauftragten (EDÖB) beschweren.',
  },
  {
    title: '10. Stand',
    text: 'Oktober 2026',
  },
];

/** Privacy policy page (Figma page 33). */
@Component({
  selector: 'app-privacy-page',
  imports: [RouterLink],
  templateUrl: './privacy.html',
  styleUrl: './privacy.scss',
})
export class PrivacyPage {
  readonly sections = SECTIONS;
}
