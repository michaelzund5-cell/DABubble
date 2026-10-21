# Firebase

Project `dabubble-4cf82`, Spark plan (free). Connection data in `src/environments/environment.ts`.
These values are not secret: every browser receives them. Protection comes from the login and `firestore.rules`.

## Set up in the Firebase console

| Area | Setting |
|---|---|
| Authentication | Email/password, Google, anonymous (automatic cleanup after 30 days) |
| Firestore | Location `europe-west6` (Zurich), production mode |
| Rules | Paste the content of `firestore.rules` under Firestore > Rules and publish |
| Authorized domains | `localhost` and `michael-zuend.developerakademie.net` |
| Password email | Action URL stays on the default. The link opens the Firebase page, the new password is set there. |

## Which service talks to Firebase

| Service | Firebase |
|---|---|
| `session.service` | Login, sign up, guest, Google, logout |
| `profile-setup.ts` | Profile `users/{uid}` on the first login, joining "Allgemein" |
| `password-reset.service` | `sendPasswordResetEmail`, `confirmPasswordReset` |
| `user.service` | `users` live |
| `channel.service` | `channels` live (own channels only), shows a notice when saving fails |
| `message-store` / `message.service` | Load messages live / write them |

## Changing the rules

1. Edit `firestore.rules` in the project (this is the template in the repo).
2. Paste it in the console under Firestore > Rules and click "Publish".
3. Test one allowed and one forbidden access with the "Rules Playground" in the console.

## Hosting

- Build with `npm run build`, upload `dist/dabubble/browser` to the server.
- The app uses hash URLs (`/#/workspace`). The server always loads `index.html`, so reloading never gives a 404.

## Later

- App Check
- Online status with the Realtime Database (presence)
- Own action URL, so the email link opens the app page "Neues Passwort"
