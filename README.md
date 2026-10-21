# DABubble

A Slack-like team chat with channels, direct messages, threads and reactions in real time.
Solo project built during the training program at [Developer Akademie](https://developerakademie.com).

**Live demo:** [michael-zuend.developerakademie.net](https://michael-zuend.developerakademie.net)
Use "Gäste-Login" (guest login) to try it without an account.

## Features

- **Accounts:** sign up with email and password, choose an avatar, Google login, guest login, reset password
- **Profile:** change name and avatar, online status
- **Channels:** create, add members, rename, edit description, leave, duplicate name check
- **Messages:** direct messages, threads, edit own messages, emojis in text
- **Reactions:** emoji reactions with counter, see who reacted, last two emojis as quick picks
- **Mentions:** `@` for people and `#` for channels while typing
- **Search:** channels, people and messages, only in chats you belong to
- **Real time:** new messages, reactions and changes appear for everyone without reloading
- **Responsive:** desktop down to 320 px, separate menu and chat views on mobile
- **Design:** implemented 1:1 from the Figma file

## Tech stack

| Area | Technology |
|---|---|
| Frontend | Angular 22 (standalone components, signals, new control flow), TypeScript strict mode, SCSS |
| Backend | Firebase Authentication and Cloud Firestore (real-time listeners) |
| Database location | Zurich, Switzerland (`europe-west6`) |
| Security | Firestore security rules: deny by default, members only, server-side checks for sender, time and lengths |
| Hosting | Apache web server with SPA rewrite (`.htaccess`) |

## Run locally

Requires Node.js 22.22.3 or newer.

```bash
cd DABubble
npm install
npm start        # http://localhost:4200
npm run build    # output in dist/dabubble/browser
```

## Project structure

```
DABubble/
  src/app/core/       services: auth, data, firebase, layout
  src/app/features/   pages: auth, chat, channel, navigation, profile, legal
  src/app/shared/     reusable components, models, pipes, utils
  public/img/         images, icons, avatars, emojis
  docs/               architecture, security, Firebase setup (German)
  firestore.rules     security rules
```

Code rules: functions up to 14 lines, files up to 400 lines, camelCase.
Comments in the code are in English, every file ends with a summary in German.

## Documentation (German)

- [Architecture](DABubble/docs/ARCHITECTURE.md): folders, data flow, data model, emojis
- [Security](DABubble/docs/SECURITY.md): reasoning, implementation, known limits
- [Firebase](DABubble/docs/FIREBASE_PLAN.md): console setup and rules
- [Figma notes](DABubble/docs/FIGMA_ABWEICHUNGEN.md): contradictions in the design and assumptions

## Author

Michael Zünd, [GitHub](https://github.com/michaelzund5-cell)
