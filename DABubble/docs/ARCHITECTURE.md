# Architektur

## Ziel

Die Anwendung trennt Darstellung, Zustand und Datenanbindung klar voneinander.

## Ordner

- `core/auth/`: Session (Anmeldestatus) und Guard
- `core/data/`: Services pro Verantwortung
  - `user.service.ts`: Benutzer
  - `channel.service.ts`: Channels und Mitglieder
  - `message.service.ts`: Nachrichten, Threads, Reaktionen
  - `workspace-state.service.ts`: Was gerade angezeigt wird (UI-Zustand)
  - `search.service.ts`: Suche
  - `demo-seed.ts`: Demo-Daten, wird mit der echten Datenbank gelöscht
- `shared/models/`: Modelle (Datenformen) für alle
- `shared/utils/`: kleine Hilfsfunktionen
- `features/auth/`: Seiten Login, Registrierung, Passwort-Hilfe
- `features/navigation/`: Seitenleiste
- `features/chat/`: Chat-Ansicht, Eingabe, Thread-Panel
- `layout/`: Seitenrahmen (Arbeitsbereich)

## Datenfluss

Component -> Service -> später API/Backend -> Datenbank

Components greifen nie direkt auf Daten zu, sondern immer über Services.
Wird die Demo-Datenquelle durch die echte Datenbank ersetzt, ändern sich nur die Services.

## Regeln

- Code, Dateien und CSS-Klassen auf Englisch, kebab-case für Dateinamen
- Abhängigkeiten per `inject()`
- Daten nur über Methoden der Services ändern (Signals sind nach außen schreibgeschützt)
- Prüfungen im Browser sind Komfort, keine Sicherheit. Sicherheit kommt über Auth-Anbieter und Zugriffsregeln der Datenbank.
