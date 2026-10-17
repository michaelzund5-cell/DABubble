# Sicherheit

Stand: Frontend mit Demo-Daten. Die echte Sicherheit kommt mit Firebase (Auth und Firestore-Regeln).
Grundsatz: Alles im Browser kann der Benutzer verändern. Prüfungen im Browser sind Komfort, die Regeln auf dem Server entscheiden.

## Meine Überlegungen dazu

**Wie ein Angreifer denkt.** Wer eine Web-App angreifen will, klickt alles an, schaut sich jedes Eingabefeld an und beobachtet, welche Daten die App sendet und empfängt. Jedes Feld, jeder Button und jede Antwort der App ist ein möglicher Einstieg. Er sucht nach Stellen, an denen er eigenen Code einschleusen, fremde Daten sehen oder Dinge tun kann, die er nicht darf.

**Mein Ziel: so wenig Spielraum wie möglich.** Ich gehe davon aus, dass jemand es versucht. Deshalb soll die App an jeder Stelle nur genau das erlauben, was ein normaler Benutzer braucht, und nicht mehr. Je enger die Grenzen, desto weniger Möglichkeiten hat ein Angreifer.

**Jede Eingabe ist verdächtig.** Alles, was ein Benutzer eintippt, kann absichtlich manipuliert sein: ein Name, eine Nachricht, eine Beschreibung. Darum wird Text nie als Code behandelt, sondern immer nur als Text angezeigt. So kann niemand über eine Nachricht etwas in den Browser eines anderen schmuggeln.

**Eingaben nie zu Code zusammenkleben (Injection).** Ein bekannter Trick ist, im Login-Feld Sonderzeichen einzugeben, die eine Datenbankabfrage verändern und zum Beispiel die Passwortprüfung "auskommentieren" (SQL-Injection). Das klappt nur, wenn eine App die Eingabe direkt in eine Abfrage einbaut. Darum gilt bei mir: Benutzereingaben werden nie mit Code oder Abfragen zusammengesetzt, sie bleiben immer reiner Inhalt. Pflichtfelder schützen davor nicht, sie lassen sich umgehen.

**Der Browser gehört dem Benutzer, nicht mir.** Alles, was im Browser läuft, kann der Benutzer sehen und verändern. Eine Prüfung nur im Eingabefeld ist deshalb Komfort, kein Schutz. Wichtige Regeln stehen darum mehrfach: im Feld, in der Logik der App und später auf dem Server. Nur der Server ist wirklich sicher.

**Grenzen für alles.** Ohne Grenze kann jemand riesige Texte schicken und die App oder die Datenbank lahmlegen. Darum hat jede Eingabe eine maximale Länge.

**Nichts verraten.** Fehlermeldungen sollen dem Benutzer helfen, aber einem Angreifer nichts verraten. Beim Login steht deshalb immer dieselbe Meldung, egal ob die E-Mail oder das Passwort falsch ist. Sonst könnte man testen, welche E-Mail-Adressen ein Konto haben.

**Nur sehen, was einem gehört.** Jeder sieht nur seine eigenen Channels und Direktnachrichten, auch in der Suche. Bearbeiten darf man nur, was man selbst geschrieben hat. Das wird nicht nur in der Oberfläche versteckt, sondern auch in der Logik geprüft.

**So wenig Daten wie möglich speichern und weitergeben.** Passwörter werden nie im Browser gespeichert. Schriften kommen vom eigenen Server statt von Google, damit keine Daten über Besucher an Dritte gehen.

**Keine Geheimnisse im Code.** Was auf GitHub liegt, kann jeder lesen. Darum kommen Passwörter, Schlüssel oder Zugangsdaten nie in den Code.

**Sicherheit hört nicht auf.** Auch fremde Pakete können Lücken haben. Darum prüfe ich sie regelmässig, und neuer Code folgt denselben Regeln.

## Umgesetzt im Code

| Thema | Umsetzung |
|---|---|
| XSS (fremder Code in Nachrichten) | Alle Texte laufen über Angular `{{ }}`, Angular maskiert sie automatisch. Kein `innerHTML`, kein `bypassSecurityTrust`, kein `eval`. |
| Injection (SQL/NoSQL) | Keine Datenbankabfrage wird aus Text zusammengebaut. Demo-Login vergleicht nur Texte, Firebase Auth prüft Passwörter auf dem Server, Firestore bekommt Werte über fertige Funktionen. |
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
