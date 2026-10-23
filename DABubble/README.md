# DABubble

Slack clone from the Developer Akademie. Angular 22, standalone components, signals.
Status: frontend complete (desktop and mobile down to 320 px), backend with Firebase (Authentication and Firestore, real time).
Firebase project: `dabubble-4cf82`, database in Zurich (`europe-west6`).

## Start

Requires Node.js 22.22.3 or newer (Angular 22 needs it).

```bash
npm install
npm start          # http://localhost:4200
npm run build      # finished files in dist/dabubble/browser
```

## Log in

| Way | What happens |
|---|---|
| Create account | Email and password with Firebase, then choose an avatar |
| Login | Email and password |
| Google | Google sign-in window |
| Guest login | Anonymous account "Gast", deleted automatically after 30 days |

Every user joins the channel "Allgemein" automatically. Everything is stored in Firestore and appears for everyone at once.

## Pages and features

| Area | Figma pages |
|---|---|
| Start animation, login, sign up, avatar, reset password, toasts | 1-9, 34-42 |
| Workspace: header, sidebar, channel, thread, direct messages, new message | 15-30, 44-58 |
| Profile, channel details, members, create channel, reactions | 10-14, 43, 59-61 |
| Search (channels, people, messages; `@` and `#`) | 18, 46, 47 |
| Imprint, privacy policy | 32, 33, 62, 63 |

## Folder structure

```
src/app/
  core/         services without UI: auth (login, guards), data, firebase, layout (screen size)
  features/     pages and areas: auth, chat, channel, navigation, profile, legal
  layout/       frame of the workspace
  shared/       reusable: components, models, pipes, utils
public/img/     images, icons, avatars, emojis (cut out of Figma)
docs/           architecture, security, Firebase, Figma notes
```

Code comments are in English and follow the TSDoc standard (https://tsdoc.org/).

## Documentation

- `docs/ARCHITECTURE.md`: project structure: folders, data flow, data model, emojis, code rules
- `docs/FIGMA_NOTES.md`: contradictions in Figma and assumptions made
- `docs/FIREBASE_PLAN.md`: Firebase setup, console, changing the rules, hosting
- `docs/SECURITY.md`: security: reasoning, implementation, known limits
