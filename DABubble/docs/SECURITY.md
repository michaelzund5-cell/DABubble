# Security

Status: Firebase Authentication and Firestore with own security rules (`firestore.rules`).
Principle: the user can change everything in the browser. Checks in the browser are for comfort, the rules on the server decide.

## My reasoning

**How an attacker thinks.** Someone who wants to attack a web app clicks everything, looks at every input field and watches which data the app sends and receives. Every field, every button and every response of the app is a possible way in. He looks for places where he can inject his own code, see other people's data or do things he is not allowed to do.

**My goal: as little room as possible.** I assume that someone will try. That is why the app should only allow exactly what a normal user needs, and nothing more. The tighter the limits, the fewer options an attacker has.

**Every input is suspicious.** Everything a user types can be manipulated on purpose: a name, a message, a description. That is why text is never treated as code, it is always shown as plain text. So nobody can smuggle something into another person's browser through a message.

**Never glue input into code (injection).** A well-known trick is to type special characters into the login field that change a database query and, for example, "comment out" the password check (SQL injection). This only works if an app builds the input directly into a query. My rule: user input is never combined with code or queries, it always stays pure content. Required fields do not protect against this, they can be bypassed.

**The browser belongs to the user, not to me.** Everything running in the browser can be seen and changed by the user. A check only in the input field is comfort, not protection. Important rules therefore exist several times: in the field, in the app logic and on the server (Firestore rules). Only the server is really safe.

**Limits for everything.** Without a limit, someone can send huge texts and slow down the app or the database. That is why every input has a maximum length.

**Reveal nothing.** Error messages should help the user but tell an attacker nothing. The login always shows the same message, whether the email or the password is wrong. Otherwise one could test which email addresses have an account.

**Only see what is yours.** Everyone only sees their own channels and direct messages, also in the search. You can only edit what you wrote yourself. This is not only hidden in the interface, it is also checked in the logic.

**Store and share as little data as possible.** Passwords are never stored in the browser. Fonts come from our own server instead of Google, so no visitor data goes to third parties.

**No secrets in the code.** Everything on GitHub can be read by anyone. Passwords, keys or credentials never go into the code.

**Security never stops.** Third-party packages can have weaknesses too. That is why I check them regularly, and new code follows the same rules.

## Implemented in the code

| Topic | Implementation |
|---|---|
| XSS (foreign code in messages) | All texts go through Angular `{{ }}`, Angular escapes them automatically. No `innerHTML`, no `bypassSecurityTrust`, no `eval`. |
| Injection (SQL/NoSQL) | No database query is built from text. Firebase Auth checks passwords on the server, Firestore receives values through ready-made functions. |
| Links | `mailto:` through `[href]`, Angular checks the URL. No links with `target="_blank"`. |
| Account detection at login | Same error message for a wrong email and a wrong password. |
| Passwords | Go directly to Firebase, the app stores them nowhere. At least 8 characters, one letter, one number. After many failed attempts Firebase blocks briefly. |
| Login session | Firebase Authentication. Firebase manages the session itself, the app stores no own login data in the browser. |
| Input lengths | Name 60, channel name 40, description 500, message 4000 characters. In the field (`maxlength`) and again in the service (`shared/utils/limits.ts`). |
| Rights | Only the sender edits their message, only members change a channel, only the own profile can be changed. Checked in the services and on the server in `firestore.rules`. |
| Firestore rules | Everything is forbidden unless explicitly allowed. Reading only for members or chat participants. The server checks sender and time of a message, faking is not possible. Lengths as above. Avatar only from the list. Removing others from a channel is not possible, only yourself. Deleting messages and channels is blocked. |
| Search | Only finds channels you are a member of and only your own direct messages. Foreign data never reaches the browser. |
| Data location | Firestore in Zurich (`europe-west6`), the data stays in Switzerland. |
| Guest accounts | Deleted automatically after 30 days (no old accounts, no mass abuse). |
| Privacy | Fonts local (@fontsource), no requests to Google servers. |
| Secrets | No keys or passwords in the code, `.env` is in `.gitignore`. |
| Dependencies | `npm audit`: 0 vulnerabilities (as of 19.10.2026). An outdated sub-dependency of Firebase (`@grpc/grpc-js`) is set to a safe version with `overrides` in `package.json`. |

## Known limits and open points

- **App Check:** Protects the Firebase API against calls that do not come from the app. Not set up yet.
- **Reactions:** The rules allow every reader to change the reaction list (otherwise nobody could react). They do not check whether someone only changes their own reaction. A stricter check would need a Cloud Function.
- **Email addresses:** Logged-in users see the email of others (Figma shows it in the profile).
- **Online status:** Set at login and logout. Whoever simply closes the browser stays "online". Exact status would need the Realtime Database (presence).
- **Content Security Policy:** Would be set as a header on the server (only allows own scripts and Firebase).
- **Sign up:** The message "E-Mail wird bereits verwendet" reveals that an account exists. Firebase reports this at sign up as well. Kept on purpose, otherwise the user does not know why it fails.

## Rules for new code

- Never `innerHTML` with user text, never `bypassSecurityTrust...`
- Every check (rights, lengths) in the service and in `firestore.rules`, not only in the template
- New collection or new field: write the rule first, then the code
- Never commit keys, passwords or tokens
- Run `npm audit` before every push
