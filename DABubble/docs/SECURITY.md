# Sicherheit

Stand: Frontend mit Demo-Daten. Die echte Sicherheit kommt mit Firebase (Auth und Firestore-Regeln).
Grundsatz: Alles im Browser kann der Benutzer verändern. Prüfungen im Browser sind Komfort, die Regeln auf dem Server entscheiden.

## Umgesetzt im Code

| Thema | Umsetzung |
|---|---|
| XSS (fremder Code in Nachrichten) | Alle Texte laufen über Angular `{{ }}`, Angular maskiert sie automatisch. Kein `innerHTML`, kein `bypassSecurityTrust`, kein `eval`. |
| Links | `mailto:` über `[href]`, Angular prüft die URL. Keine Links mit `target="_blank"`. |
| Konto-Erkennung beim Login | Gleiche Fehlermeldung bei falscher E-Mail und falschem Passwort. |
| Passwörter | Nur im Arbeitsspeicher, nie in localStorage. Mindestens 8 Zeichen, ein Buchstabe, eine Zahl. |
| localStorage | Nur die Benutzer-ID der Demo, jeder Zugriff in `try/catch` (privater Modus). |
| Eingabelängen | Name 60, Channel-Name 40, Beschreibung 500, Nachricht 4000 Zeichen. Im Feld (`maxlength`) und nochmals im Service (`shared/utils/limits.ts`). |
| Rechte | Nur der Absender bearbeitet seine Nachricht, nur Mitglieder ändern einen Channel, nur das eigene Profil ist änderbar. Die Services prüfen das selbst, nicht nur die Oberfläche. |
| Suche | Findet nur Channels, in denen man Mitglied ist, und nur eigene Direktnachrichten. |
| Datenschutz | Schriften lokal (@fontsource), keine Anfragen an Google-Server. |
| Geheimnisse | Keine Schlüssel oder Passwörter im Code, `.env` steht in `.gitignore`. |
| Abhängigkeiten | `npm audit`: 0 Schwachstellen (Stand 17.10.2026). |

## Offen, kommt mit Firebase

- **Login:** Der Demo-Login schützt nichts. Firebase Auth ersetzt ihn.
- **Firestore-Regeln:** Lesen nur für Mitglieder, Ändern nur für Besitzer, Längen wie oben. Das ist der eigentliche Schutz.
- **App Check:** Schützt die Firebase-API vor fremden Aufrufen.
- **Content-Security-Policy:** Als Header beim Hosting setzen (erlaubt nur eigene Skripte und Firebase).
- **Registrierung:** Die Meldung "E-Mail wird bereits verwendet" verrät, dass ein Konto existiert. Firebase meldet das bei der Registrierung ebenfalls. Bewusst so gelassen, weil der Benutzer sonst nicht weiss, warum es nicht klappt.

## Regeln für neuen Code

- Nie `innerHTML` mit Benutzertext, nie `bypassSecurityTrust...`
- Jede Prüfung (Rechte, Längen) im Service und später in den Firestore-Regeln, nicht nur im Template
- Keine Schlüssel, Passwörter oder Tokens committen
- Vor jedem Push `npm audit` ausführen
