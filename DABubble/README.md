# DABubble

Slack-Klon der Developer Akademie. Angular 22, Standalone Components, Signals.
Stand: Frontend komplett (Desktop und Handy bis 320 px), Daten sind noch Demo-Daten im Speicher.
Nächster Schritt: Firebase anbinden (siehe `docs/FIREBASE_PLAN.md`).

## Starten

Voraussetzung: Node.js 22.22.3 oder neuer (Angular 22 verlangt das).

```bash
npm install
npm start          # http://localhost:4200
npm run build      # fertige Dateien in dist/dabubble/browser
```

## Demo-Zugang

| Was | Wert |
|---|---|
| Login | `test@test.ch` / `123456` |
| Gäste-Login | Button "Gäste-Login", meldet als Frederik Beck an |
| Eigene Registrierung | funktioniert, solange der Tab offen ist (nur im Speicher) |

Nach einem Neuladen sind alle Änderungen (Nachrichten, Channels, Profil) weg. Das ändert sich mit Firebase.

## Seiten und Funktionen

| Bereich | Figma-Seiten |
|---|---|
| Start-Animation, Login, Registrierung, Avatar, Passwort zurücksetzen, Toasts | 1-9, 34-42 |
| Workspace: Header, Sidebar, Channel, Thread, Direktnachrichten, Neue Nachricht | 15-30, 44-58 |
| Profil, Channel-Details, Mitglieder, Channel erstellen, Reaktionen | 10-14, 43, 59-61 |
| Suche (Channels, Personen, Nachrichten; `@` und `#`) | 18, 46, 47 |
| Impressum, Datenschutz | 32, 33, 62, 63 |

## Ordnerstruktur

```
src/app/
  core/         Services ohne Oberfläche: auth (Login, Guards), data (Daten), layout (Bildschirmgrösse)
  features/     Seiten und Bereiche: auth, chat, channel, navigation, profile, legal
  layout/       Seitenrahmen des Workspace
  shared/       Wiederverwendbares: components, models, pipes, utils
public/img/     Bilder, Icons, Avatare, Emojis (aus Figma ausgeschnitten)
docs/           Architektur, Sicherheit, Firebase-Plan, Figma-Abweichungen, n8n-Plan
```

Jede Datei hat Kommentare auf Englisch und am Ende eine deutsche "ZUSAMMENFASSUNG".

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

## Dokumentation

- `docs/ARCHITECTURE.md`: Aufbau, Datenfluss, Regeln
- `docs/FIGMA_ABWEICHUNGEN.md`: Widersprüche in Figma und getroffene Annahmen
- `docs/FIREBASE_PLAN.md`: Reihenfolge für das Backend
- `docs/SECURITY.md`: was für die Sicherheit umgesetzt ist und was mit Firebase kommt
- `docs/N8N_PLAN.md`: Ideen für Automatisierungen
