# Figma: Widersprüche und Annahmen

Alles wurde gegen die Figma-Seiten gemessen (Pixelvergleich). Wo Figma sich selbst widerspricht oder nichts zeigt, steht hier, wie entschieden wurde.

## Widersprüche in Figma, 1:1 übernommen

| Stelle | Figma | Umgesetzt |
|---|---|---|
| Passwort zurücksetzen (5, 6) | Karten 45 bzw. 43 px aus der Mitte verschoben | übernommen |
| Neues Passwort (6) | Titel 48 px, Felder 58 px, Button nicht fett | übernommen |
| Impressum/Datenschutz (32, 33) | Logo bei 50/25, breiteres Logo als sonst | übernommen |
| Thread-Kopf (15) | 104 px hoch, Chat-Kopf 96 px | übernommen |
| Eingabefeld bei offenem Thread (15) | 34 px Rand statt 44 px | übernommen |
| Direktnachricht-Kopf (21-26) | 110 px hoch, Channel-Kopf 96 px | übernommen |
| Neue Nachricht (20) | Eingabefeld 70 px vom Rand statt 44 px | übernommen |
| Profil Handy (43) | E-Mail schwarz, auf dem Desktop blau | übernommen |

## Widersprüche in Figma, bewusst NICHT übernommen

| Stelle | Figma | Umgesetzt, Grund |
|---|---|---|
| Direktnachrichten (21-26) | Chat-Karte 1480 px breit statt 1494 px | gleiche Breite wie Channel, sonst springt das Layout |
| Direktnachrichten (22-26) | Platzhalter immer "Nachricht an Sofia Müller" | Name der geöffneten Person (Kopierfehler in Figma) |
| Eigene Nachricht (26) | "Frederick Beck (Du)" | "Frederik Beck (Du)" (Tippfehler in Figma) |
| Thread-Info (17) | "Letzte Antwort 14:56", Antwort im Thread 15:06 | 14:56, Zeit kommt aus den Daten |
| Header-Suche (18) | Feld bei x 404 statt 406 | 406 wie Seite 17 |
| Channel-Details Handy (60) | zweiter Stift bei x 357 statt 364, "Beschreibung" 2 px tiefer | gleiche Abstände in beiden Blöcken (DoD: gleiche Abstände) |
| Suche Handy (47) | zeigt Channel "Allgemein", in dem man nicht Mitglied ist | nur eigene Channels (Datenschutz) |

## Annahmen (Figma zeigt es nicht)

- Fehlerfarbe `#ED1E79` und Fehlertexte unter den Feldern
- Hover-, Fokus- und Disabled-Zustände (Disabled-Grau `#686868` aus Seiten 5/6)
- Toast-Position und Dauer
- Ablauf der Start-Animation (Figma zeigt nur das Startbild), läuft einmal pro Tab, nicht bei "weniger Bewegung"
- Emoji-Auswahl, Hover-Leiste an Nachrichten, Menü "Nachricht bearbeiten"
- @/#-Liste auf dem Desktop wie auf dem Handy (Seite 52)
- Menü oben rechts ("Profil", "Log out")
- Profil bearbeiten (Name und Avatar), Desktop-Fenster für Mitglieder und "Leute hinzufügen"
- "Channel erstellen" auf dem Desktop als Karte im Stil von Seite 11, Schritt 2 "Leute hinzufügen"
- Suchergebnisse auf dem Desktop (Channels, Personen, Nachrichten)
- Reaktionen: 20 sichtbar auf dem Desktop, 7 auf dem Handy und im Thread, dann "x weitere"
- Tablet (1000-1499 px): Thread liegt über dem Chat
- Unter 400 px: kleinere Überschriften auf den Login-Seiten, damit nichts überlappt
- Leerer Channel, den jemand anderes erstellt hat: "Name hat diesen Channel am Datum erstellt."
