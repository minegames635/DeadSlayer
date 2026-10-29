# Firebase setup for Dead Slayer

The client is configured for project `deadslayer-72004`. Firebase Web API keys identify a project; they are not server credentials. Do not place service-account keys or Admin SDK credentials in the game.

## Enable the services

1. In Firebase Console, open **Authentication → Sign-in method** and enable **Email/Password** and **Google**.
2. In **Authentication → Settings → Authorized domains**, add the domain used by the deployed game. Google sign-in may not work when Electron loads the game from `file://`; test the packaged app and use a registered HTTPS domain or a carefully configured Electron auth flow if necessary.
3. Create the **Cloud Firestore** database.
4. Publish the rules in `firestore.rules` from **Firestore Database → Rules**.
5. Open `index.html` through the Electron game or a local HTTP server while online. The Firebase SDK is loaded from Google's CDN, so a first-time connection needs internet access.

## What is stored

Email/password and Google accounts are handled by Firebase Authentication. The player's nickname is stored in that account's display name/local save. Firestore stores one public leaderboard document per Firebase UID with nickname, best submitted wave, kills, play time, and update time.

## Cheat flag limitation

This build flags a run when the cheat panel is opened or cheat coins are changed. Closing the panel resets cheat multipliers and run buffs, as requested. Flagged runs are not submitted. The flag survives normal run snapshots and resume. However, this is a client-only Electron game: a determined player can alter local JavaScript or call Firestore directly, so this cannot be treated as anti-cheat protection. The included rules stop unauthenticated writes and writes to another user's UID, but do not prove a score is legitimate. For a competitive leaderboard, move score calculation/validation to a trusted server (for example, a callable Cloud Function) and tighten direct client writes.

## Web deploy (GitHub Pages)

1. Push the contents of this folder (without `*.bak-*` files) to a GitHub repository and enable Pages.
2. In Firebase Console, open Authentication, then Settings, then Authorized domains, and add `<user>.github.io`. Google sign-in fails with `auth/unauthorized-domain` without it.
3. In Authentication, then Settings, then Password policy, set a minimum length of 8 so the server enforces the same rule as the client.
4. Keep "Email enumeration protection" in mind: if it is on, the "email already registered" pre-check returns nothing and the error shows only after `createUser` fails. Both paths show the same message.
