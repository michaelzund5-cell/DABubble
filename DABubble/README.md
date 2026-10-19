# DABubble

Slack-Klon der Developer Akademie. Angular 22, Standalone Components, Signals.
Stand: Frontend komplett (Desktop und Handy bis 320 px), Backend mit Firebase (Authentication und Firestore, Echtzeit).
Firebase-Projekt: `dabubble-4cf82`, Datenbank in Zürich (`europe-west6`).

## Starten

Voraussetzung: Node.js 22.22.3 oder neuer (Angular 22 verlangt das).

```bash
npm install
npm start          # http://localhost:4200
npm run build      # fertige Dateien in dist/dabubble/browser
```

## Anmelden

| Weg | Was passiert |
|---|---|
| Konto erstellen | E-Mail und Passwort bei Firebase, danach Avatar wählen |
| Login | E-Mail und Passwort |
| Google | Google-Anmeldefenster |
| Gäste-Login | Anonymes Konto "Gast", wird nach 30 Tagen automatisch gelöscht |

Jeder Benutzer kommt automatisch in den Channel "Allgemein". Alles wird in Firestore gespeichert und erscheint bei allen sofort.

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
docs/           Architektur, Sicherheit, Firebase, Figma-Abweichungen, n8n-Plan
```

Jede Datei hat Kommentare auf Englisch und am Ende eine deutsche "ZUSAMMENFASSUNG".

## Dokumentation

- `docs/ARCHITECTURE.md`: Aufbau des Projekts: Ordner, Datenfluss, Emojis, Code-Regeln
- `docs/FIGMA_ABWEICHUNGEN.md`: Widersprüche in Figma und getroffene Annahmen
- `docs/FIREBASE_PLAN.md`: Firebase-Einrichtung, Konsole, Regeln ändern
- `docs/SECURITY.md`: Sicherheit: Überlegungen, Umsetzung, was mit Firebase kommt
- `docs/N8N_PLAN.md`: Ideen für Automatisierungen
