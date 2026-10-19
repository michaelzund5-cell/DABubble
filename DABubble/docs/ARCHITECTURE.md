# Architektur

## Grundsatz

Components zeigen an, Services halten Daten und Logik. Components greifen nie direkt auf Daten oder Firebase zu.
Beim Wechsel von Demo-Daten auf Firebase wurden nur die Services in `core/` ersetzt, die Components blieben fast gleich.

```
Component  ->  Service (core/data, core/auth)  ->  Firebase (Authentication + Firestore)
```

## Ordner

| Ordner | Inhalt |
|---|---|
| `core/auth/` | `session.service` (wer ist angemeldet), `registration.service`, `password-reset.service`, Guards |
| `core/data/` | `user`, `channel`, `message` (schreiben), `message-store` (live laden), `search`, `workspace-state` (was gerade offen ist) |
| `core/firebase/` | Verbindung (`firebase.ts`), Umwandlung Dokument -> Modell (`mappers.ts`), Listener-Verwaltung, Fehlermeldungen |
| `core/layout/` | `viewport.service`: Handy-Ansicht ja/nein (unter 1000 px) |
| `features/auth/` | Start-Animation, Login, Registrierung, Avatar, Passwort zurücksetzen |
| `features/chat/` | Chat-Ansicht, Nachricht, Eingabe, @/#-Liste, Thread, Neue Nachricht, leerer Chat |
| `features/channel/` | Channel-Details, Mitglieder, Leute hinzufügen, Channel erstellen |
| `features/navigation/` | Header, Suche, Sidebar |
| `features/profile/` | Profil ansehen und bearbeiten |
| `features/legal/` | Impressum, Datenschutz |
| `layout/workspace/` | Rahmen nach dem Login: Header, Sidebar, Chat, Thread, Dialoge |
| `shared/` | Avatar, Dialog-Rahmen, Emoji-Auswahl, Toast, Modelle, Pipes, Validatoren |

## Datenmodell in Firestore

```
users/{uid}                              name, email, avatar, status
channels/{channelId}                     name, description, memberIds[], createdBy, createdAt, isPublic (nur "allgemein")
channels/{channelId}/messages/{id}       senderId, text, createdAt, reactions[], threadId?, edited?
directChats/dm_{uidA}_{uidB}             participants[]   (IDs sortiert, damit beide denselben Chat finden)
directChats/dm_{uidA}_{uidB}/messages/{id}   wie bei Channels
```

- Thread-Antworten sind normale Nachrichten mit `threadId` (ID der Ursprungsnachricht) im selben Channel oder Chat.
- Geladen wird nur, was zum Benutzer gehört: eigene Channels (`memberIds` enthält die eigene ID) und eigene Direktnachrichten.
- Live über `onSnapshot`: Änderungen erscheinen bei allen sofort, ohne Neuladen.
- Zeitstempel setzt der Server (`serverTimestamp`).
- Die Sicherheitsregeln stehen in `firestore.rules`.

## Zustand

- Signals überall (`signal`, `computed`). Kein RxJS im eigenen Code.
- `WorkspaceStateService`: offener Chat, offener Thread, offener Dialog, Handy-Navigation.
- Daten-Services geben nur lesbare Signals nach aussen (`asReadonly()`), Änderungen nur über Methoden.

## Emojis: wie und warum

**Wie:** Alle 20 Emojis stehen in `src/app/shared/models/emojis.ts`. Jedes hat drei Werte:

```ts
{ id: 'rocket', char: '🚀', src: 'img/emojis/rocket.svg' }
```

- `id`: kurzer Name. Bei einer Reaktion wird nur dieser gespeichert, zusammen mit den Personen, die reagiert haben (`userIds`).
- `char`: echtes Zeichen. Kommt in den Text, wenn man im Eingabefeld ein Emoji wählt.
- `src`: Bild in `public/img/emojis/`. Wird bei Reaktionen angezeigt.

Ablauf:
- `emoji-picker` (`shared/components/emoji-picker`) zeigt alle Bilder als Buttons und meldet die Wahl per `output()`.
- Die Pipe `emojiSrc` macht im Template aus der `id` das Bild: `<img [src]="reaction.emoji | emojiSrc">`.
- Ein zweiter Klick auf die eigene Reaktion entfernt sie wieder.
- Die Schnellleiste beim Hover zeigt die zwei zuletzt benutzten Emojis (`quickEmojis` im MessageService), am Anfang ✅ und 👍.

**Warum so:**
- **Bilder statt System-Emojis:** Windows, Mac, Android und iPhone zeichnen Emojis verschieden. Mit eigenen Bildern sieht es überall gleich aus wie in Figma.
- **Herkunft:** Die 4 Emojis aus Figma (✅ 👍 🚀 🤓) sind als SVG aus der Figma-Datei ausgeschnitten, die anderen 16 sind PNGs aus "Noto Color Emoji" von Google (freie Lizenz).
- **Nur die `id` speichern:** Klein in der Datenbank, und ein Bild lässt sich später austauschen, ohne alte Nachrichten zu ändern.
- **`userIds` statt Zähler:** Man sieht, wer reagiert hat, und kann die eigene Reaktion wieder entfernen. Ein reiner Zähler könnte das nicht.

## Code-Regeln (DoD)

- Funktionen höchstens 14 Zeilen, Dateien höchstens 400 Zeilen, camelCase, strict mode
- `button { cursor: pointer; border: 0 }` global
- Breakpoint Handy: 999 px (SCSS und `viewport.service` gleich)

Sicherheit steht in einem eigenen Dokument: `docs/SECURITY.md`.
