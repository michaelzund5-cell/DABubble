# Firebase

Projekt `dabubble-4cf82`, Spark-Tarif (kostenlos). Verbindungsdaten in `src/environments/environment.ts`.
Diese Werte sind nicht geheim: Jeder Browser bekommt sie. Geschützt wird durch Login und `firestore.rules`.

## Eingerichtet in der Firebase-Konsole

| Bereich | Einstellung |
|---|---|
| Authentication | E-Mail/Passwort, Google, Anonym (automatische Bereinigung nach 30 Tagen) |
| Firestore | Standort `europe-west6` (Zürich), Produktionsmodus |
| Regeln | Inhalt von `firestore.rules` unter Firestore > Regeln einfügen und veröffentlichen |
| Passwort-Mail | Authentication > Vorlagen > Passwort zurücksetzen > Aktions-URL: `http://localhost:4200/password-reset/new` (nach dem Hosting die echte Adresse) |
| Autorisierte Domains | `localhost` ist schon drin. Nach dem Hosting die eigene Domain ergänzen. |

## Was wohin gehört

| Service | Firebase |
|---|---|
| `session.service` | Login, Registrierung, Gast, Google, Logout |
| `profile-setup.ts` | Profil `users/{uid}` beim ersten Login, Beitritt zu "Allgemein" |
| `password-reset.service` | `sendPasswordResetEmail`, `confirmPasswordReset` |
| `user.service` | `users` live |
| `channel.service` | `channels` live (nur eigene) |
| `message-store` / `message.service` | Nachrichten live laden / schreiben |

## Regeln ändern

1. `firestore.rules` im Projekt anpassen (das ist die Vorlage im Repo).
2. In der Konsole unter Firestore > Regeln einfügen und "Veröffentlichen".
3. Mit dem "Regelsimulator" in der Konsole einen erlaubten und einen verbotenen Zugriff testen.

## Später

- Firebase Hosting und App Check
- Online-Status mit der Realtime Database (Presence)
