# Datenbank-Plan

Aktuell läuft das Frontend mit Demo-Daten (`core/data/demo-seed.ts`). Der Anbieter wird im Team in Woche 1 entschieden.

## Kernobjekte (entsprechen den Modellen in `shared/models/`)

- User
- Channel (mit `memberIds`)
- Message
  - gehört zu einem Channel (`channelId`) oder einer Direktnachricht (`directChatId`)
  - Thread-Antworten sind eigene Messages mit `threadId`
  - Reaktionen speichern, wer reagiert hat (`userIds`)
- Zeitstempel als Zahl (`createdAt`), Formatierung erst in der Anzeige

## Reihenfolge der Anbindung

1. Anbieter festlegen
2. Datenmodell und Zugriffsregeln festlegen
3. Authentifizierung anbinden (SessionService ersetzen)
4. Benutzerprofile (UserService)
5. Channels und Mitglieder (ChannelService)
6. Nachrichten in Echtzeit (MessageService)
7. Direktnachrichten, Threads, Reaktionen, Suche
8. Zugriffsregeln testen, auch mit absichtlich falschen Zugriffen

## Zugriffsregeln (Mindestanforderung)

- Nachrichten lesen: nur Mitglieder des Channels bzw. die zwei Personen der Direktnachricht
- Nachricht bearbeiten / löschen: nur der Absender
- Channel-Mitglieder ändern: festlegen, wer das darf
