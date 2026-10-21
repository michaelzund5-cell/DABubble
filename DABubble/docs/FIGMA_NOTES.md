# Figma: contradictions and assumptions

Everything was measured against the Figma pages (pixel comparison). Where Figma contradicts itself or shows nothing, this file explains the decision.

## Contradictions in Figma, taken over 1:1

| Place | Figma | Implemented |
|---|---|---|
| Reset password (5, 6) | Cards shifted 45 and 43 px from the center | taken over |
| New password (6) | Title 48 px, fields 58 px, button not bold | taken over |
| Imprint/privacy (32, 33) | Logo at 50/25, wider logo than elsewhere | taken over |
| Thread header (15) | 104 px high, chat header 96 px | taken over |
| Input with open thread (15) | 34 px margin instead of 44 px | taken over |
| Direct message header (21-26) | 110 px high, channel header 96 px | taken over |
| New message (20) | Input 70 px from the edge instead of 44 px | taken over |
| Profile mobile (43) | Email black, blue on desktop | taken over |

## Contradictions in Figma, deliberately NOT taken over

| Place | Figma | Implemented, reason |
|---|---|---|
| Direct messages (21-26) | Chat card 1480 px wide instead of 1494 px | same width as channel, otherwise the layout jumps |
| Direct messages (22-26) | Placeholder always "Nachricht an Sofia Müller" | name of the opened person (copy mistake in Figma) |
| Own message (26) | "Frederick Beck (Du)" | "Frederik Beck (Du)" (typo in Figma) |
| Thread info (17) | "Letzte Antwort 14:56", reply in the thread 15:06 | 14:56, the time comes from the data |
| Header search (18) | Field at x 404 instead of 406 | 406 like page 17 |
| Channel details mobile (60) | Second pencil at x 357 instead of 364, "Beschreibung" 2 px lower | same spacing in both blocks (DoD: equal spacing) |
| Search mobile (47) | Shows channel "Allgemein" the user is not a member of | only own channels (privacy) |

## Assumptions (Figma does not show it)

- Error color `#ED1E79` and error texts below the fields
- Hover, focus and disabled states (disabled grey `#686868` from pages 5/6)
- Toast position and duration
- Flow of the start animation (Figma only shows the start image), runs once per tab, not with "reduced motion"
- Emoji picker, hover bar on messages, menu "Nachricht bearbeiten"
- @/# list on desktop like on mobile (page 52)
- Profile menu: top right on desktop, bottom sheet with icons on mobile
- Edit profile (name and avatar), desktop windows for members and "Leute hinzufügen"
- "Channel erstellen" on desktop as a card in the style of page 11, step 2 "Leute hinzufügen"
- Search results on desktop (channels, people, messages)
- Reactions: 20 visible on desktop, 7 on mobile and in the thread, then "x weitere"
- Tablet (1000-1499 px): the thread lies over the chat
- Below 400 px: smaller headings on the login pages so nothing overlaps
- Empty channel created by someone else: "Name hat diesen Channel am Datum erstellt."
- Public channel "Allgemein": every new user joins it, so nobody starts alone
- Notice at the bottom when a channel change could not be saved
