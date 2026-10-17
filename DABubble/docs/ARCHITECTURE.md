# Architektur

## Grundsatz

Components zeigen an, Services halten Daten und Logik. Components greifen nie direkt auf Daten zu.
Wird Firebase angebunden, ändern sich nur die Services in `core/`, nicht die Components.

```
Component  ->  Service (core/data, core/auth)  ->  später Firebase (Auth + Firestore)
```

## Ordner

| Ordner | Inhalt |
|---|---|
| `core/auth/` | `session.service` (wer ist angemeldet), `registration.service`, `password-reset.service`, Guards |
| `core/data/` | `user`, `channel`, `message`, `search`, `workspace-state` (was gerade offen ist), `demo-seed` (Demo-Daten) |
| `core/layout/` | `viewport.service`: Handy-Ansicht ja/nein (unter 1000 px) |
| `features/auth/` | Start-Animation, Login, Registrierung, Avatar, Passwort zurücksetzen |
| `features/chat/` | Chat-Ansicht, Nachricht, Eingabe, @/#-Liste, Thread, Neue Nachricht, leerer Chat |
| `features/channel/` | Channel-Details, Mitglieder, Leute hinzufügen, Channel erstellen |
| `features/navigation/` | Header, Suche, Sidebar |
| `features/profile/` | Profil ansehen und bearbeiten |
| `features/legal/` | Impressum, Datenschutz |
| `layout/workspace/` | Rahmen nach dem Login: Header, Sidebar, Chat, Thread, Dialoge |
| `shared/` | Avatar, Dialog-Rahmen, Emoji-Auswahl, Toast, Modelle, Pipes, Validatoren |

## Zustand

- Signals überall (`signal`, `computed`). Kein RxJS im eigenen Code.
- `WorkspaceStateService`: offener Chat, offener Thread, offener Dialog, Handy-Navigation.
- Daten-Services geben nur lesbare Signals nach aussen (`asReadonly()`), Änderungen nur über Methoden.

## Sicherheit (gilt auch nach Firebase)

- Prüfungen im Browser sind nur Komfort. Echte Regeln gehören in die Firestore-Regeln.
- Login: gleiche Fehlermeldung bei falscher E-Mail und falschem Passwort (keine Konto-Prüfung von aussen).
- Passwörter werden nie in localStorage gespeichert.
- Nur der Absender darf eigene Nachrichten bearbeiten (Service prüft das zusätzlich).
- Suche zeigt nur Channels, in denen man Mitglied ist, und nur eigene Direktnachrichten.

## Code-Regeln (DoD)

- Funktionen höchstens 14 Zeilen, Dateien höchstens 400 Zeilen, camelCase, strict mode
- `button { cursor: pointer; border: 0 }` global
- Breakpoint Handy: 999 px (SCSS und `viewport.service` gleich)
