# Firebase-Plan

Das Frontend läuft mit Demo-Daten (`core/data/demo-seed.ts`). Für Firebase werden nur die Services ersetzt.

## Was wohin kommt

| Service | Firebase |
|---|---|
| `session.service` | Firebase Auth: E-Mail/Passwort, Google, anonymer Login (Gast) |
| `registration.service` | `createUserWithEmailAndPassword`, danach Profil in Firestore `users/{uid}` |
| `password-reset.service` | `sendPasswordResetEmail`, Seite "Neues Passwort" mit `confirmPasswordReset(oobCode)` |
| `user.service` | Firestore `users` (Name, E-Mail, Avatar, Status) |
| `channel.service` | Firestore `channels` (Name, Beschreibung, memberIds, createdBy, createdAt) |
| `message.service` | Firestore `messages` mit Echtzeit-Abfrage (`onSnapshot`) |
| `search.service` | bleibt im Browser über die geladenen Daten |

Die Modelle in `shared/models/` passen schon zu diesen Sammlungen.

## Reihenfolge

1. Firebase-Projekt anlegen, Web-App registrieren, `@angular/fire` installieren
2. Auth: Login, Registrierung, Gast, Google, Passwort zurücksetzen
3. `users` anlegen beim Registrieren, Online-Status
4. Channels und Mitglieder
5. Nachrichten in Echtzeit, Threads, Reaktionen, Direktnachrichten
6. Firestore-Regeln schreiben und mit falschen Zugriffen testen
7. `demo-seed.ts` löschen

## Firestore-Regeln (Minimum)

- Nur angemeldete Benutzer lesen und schreiben
- Nachrichten lesen: Mitglieder des Channels bzw. die zwei Personen der Direktnachricht
- Nachricht ändern oder löschen: nur der Absender
- Profil ändern: nur der eigene Eintrag
- API-Schlüssel der Web-App sind öffentlich, der Schutz kommt allein aus den Regeln
