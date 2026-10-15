# Änderungen gegenüber dem ersten Entwurf

## Struktur

| Vorher | Jetzt |
|---|---|
| `kern/authentifizierung/` | `core/auth/` |
| `kern/daten/demo-daten.service.ts` | `core/data/` mit fünf Services + `demo-seed.ts` |
| `gemeinsam/modelle/` | `shared/models/` |
| `bereiche/einstieg/` | `features/auth/` |
| `bereiche/navigation/seitenleiste/` | `features/navigation/sidebar/` |
| `bereiche/kommunikation/` | `features/chat/` |
| `rahmen/hauptbereich/` | `layout/workspace/` |
| URLs `/anmelden`, `/arbeitsbereich` … | `/login`, `/register`, `/password-reset`, `/workspace` |

Klassen, Methoden, Variablen, CSS-Klassen und CSS-Variablen sind ebenfalls englisch.
Texte in der Oberfläche bleiben deutsch, jetzt mit echten Umlauten.

## Behobene Fehler

1. **Reaktionen:** Vorher wurde nur hochgezählt. Jetzt echtes Umschalten, gespeichert wird, wer reagiert hat (`userIds`). Eigene Reaktionen werden hervorgehoben.
2. **Zeit:** Vorher Text (`'08:42'`), jetzt Zeitstempel (`createdAt`). Anzeige über die `DatePipe`.
3. **Threads:** Antworten sind eigene Nachrichten mit `threadId` statt einer Liste in der Nachricht.
4. **Direktnachrichten:** Gemeinsame ID für beide Personen (`directChatId`), funktioniert mit mehreren Benutzern.
5. **Bearbeiten/Löschen:** Der Service prüft jetzt selbst, ob die Nachricht dem eingeloggten Benutzer gehört. Löschen entfernt auch die Thread-Antworten.
6. **Avatare im Channel-Kopf:** Kommen aus den echten Mitgliedern statt fest aus dem HTML.
7. **Tippfehler** `navigationGewaeht` behoben, jetzt `navigationSelected` mit `output()`.
8. **Einheitlich `inject()`** statt gemischt Konstruktor und `inject()`.
9. **Rückmeldungen ergänzt:** Fehlermeldung bei doppeltem Channel-Namen und bei fehlgeschlagener Registrierung.
10. **Session:** Speichert die Benutzer-ID statt `'ja'`, localStorage mit try/catch abgesichert.

## Bewusst noch offen

Platzhalter ohne Funktion: neue Nachricht, Mitglieder hinzufügen, Datei anhängen, Emoji-Auswahl, Erwähnungen.
Login und Registrierung sind weiterhin Demo, bis der Auth-Anbieter feststeht.
