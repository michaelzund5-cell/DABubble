# Architecture

## Principle

Components display, services hold data and logic. Components never access data or Firebase directly.
When switching from demo data to Firebase, only the services in `core/` were replaced, the components stayed almost the same.

```
Component  ->  Service (core/data, core/auth)  ->  Firebase (Authentication + Firestore)
```

## Folders

| Folder | Content |
|---|---|
| `core/auth/` | `session.service` (who is logged in), `registration.service`, `password-reset.service`, guards |
| `core/data/` | `user`, `channel`, `message` (write), `message-store` (load live), `search`, `workspace-state` (what is open) |
| `core/firebase/` | Connection (`firebase.ts`), document to model (`mappers.ts`), listener management, error reporting |
| `core/layout/` | `viewport.service`: mobile view yes/no (below 1000 px) |
| `features/auth/` | Start animation, login, sign up, avatar, reset password |
| `features/chat/` | Chat view, message, input, @/# list, thread, new message, empty chat |
| `features/channel/` | Channel details, members, add people, create channel |
| `features/navigation/` | Header, search, sidebar |
| `features/profile/` | View and edit profile |
| `features/legal/` | Imprint, privacy policy |
| `layout/workspace/` | Frame after login: header, sidebar, chat, thread, dialogs |
| `shared/` | Avatar, dialog frame, emoji picker, toast, models, pipes, validators |

## Data model in Firestore

```
users/{uid}                              name, email, avatar, status, lastActive
channels/{channelId}                     name, description, memberIds[], createdBy, createdAt, isPublic (only "allgemein")
channels/{channelId}/messages/{id}       senderId, text, createdAt, reactions[], threadId?, edited?
channelNames/{name in lower case}        channelId   (one entry per name, keeps channel names unique)
directChats/dm_{uidA}_{uidB}             participants[]   (IDs sorted, so both find the same chat)
directChats/dm_{uidA}_{uidB}/messages/{id}   same as in channels
```

- Thread replies are normal messages with `threadId` (ID of the original message) in the same channel or chat.
- Only what belongs to the user is loaded: own channels (`memberIds` contains the own ID) and own direct messages.
- Live with `onSnapshot`: changes appear for everyone at once, without reloading.
- Timestamps are set by the server (`serverTimestamp`).
- A brand-new channel may not be on the server yet when its messages are first requested. The message listener then retries after 1 second (up to 5 times).
- Channel names are unique on the server: creating or renaming a channel reserves the name in `channelNames` in the same transaction (`core/data/channel-names.ts`).
- Online status: an open, visible tab sends a heartbeat (`lastActive`) every minute (`core/data/presence.service.ts`). Without a heartbeat for 2.5 minutes a user counts as offline.
- The security rules are in `firestore.rules`.

## State

- Signals everywhere (`signal`, `computed`). No RxJS in our own code.
- `WorkspaceStateService`: open chat, open thread, open dialog, mobile navigation.
- Data services only expose read-only signals (`asReadonly()`), changes only through methods.

## Routing

- Hash URLs (`/#/login`, `/#/workspace`) with `withHashLocation()`. The server always loads `index.html`, so reloading a page never returns a 404.

## Emojis: how and why

**How:** All 20 emojis are in `src/app/shared/models/emojis.ts`. Each one has three values:

```ts
{ id: 'rocket', char: '🚀', src: 'img/emojis/rocket.svg' }
```

- `id`: short name. A reaction only stores this, together with the people who reacted (`userIds`).
- `char`: real character. Goes into the text when an emoji is picked in the input.
- `src`: image in `public/img/emojis/`. Shown for reactions.

Flow:
- `emoji-picker` (`shared/components/emoji-picker`) shows all images as buttons and reports the choice with `output()`.
- The pipe `emojiSrc` turns the `id` into the image in the template: `<img [src]="reaction.emoji | emojiSrc">`.
- A second click on your own reaction removes it again.
- The quick bar on hover shows the two most recently used emojis (`quickEmojis` in the MessageService), at the start ✅ and 👍.

**Why:**
- **Images instead of system emojis:** Windows, Mac, Android and iPhone draw emojis differently. With own images it looks the same everywhere, like in Figma.
- **Origin:** The 4 emojis from Figma (✅ 👍 🚀 🤓) are cut out of the Figma file as SVG, the other 16 are PNGs from Google's "Noto Color Emoji" (free license).
- **Store only the `id`:** Small in the database, and an image can be replaced later without changing old messages.
- **`userIds` instead of a counter:** You can see who reacted and remove your own reaction. A plain counter could not do that.

## Code rules (DoD)

- Functions at most 14 lines, files at most 400 lines, camelCase, strict mode
- `button { cursor: pointer; border: 0 }` globally
- Mobile breakpoint: 999 px (same in SCSS and `viewport.service`)
- Comments in English, functions and classes documented with TSDoc (`/** ... */`, `@param`, `@returns`)

Security has its own document: `docs/SECURITY.md`.
