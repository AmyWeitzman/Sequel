# Sequel 🔮

A configurable, themeable digital version of the board game **Sequence**. The 10×10 board /
4-free-corner / 48-items-appearing-twice *structure* of real Sequence is preserved, but item
placement is reshuffled every new game, and the theme is picked at game creation instead of
being a fixed 52-card deck. Real online multiplayer for 2-3 players — join by room code, no
installs, no accounts.

## The game

- Play a matching card from your hand onto the board to place your colored chip (red / blue /
  green). Form a line of 5 chips — row, column, or diagonal — to complete a sequence.
- **2 players:** 7-card hand, first to complete **2 sequences** wins.
- **3 players:** 6-card hand, first to complete **1 sequence** wins.
- The 4 board corners are free spaces, already "filled" for everyone.
- Two of your sequences may share at most 1 board cell.
- Every theme's 104-card deck has 8 wildcards: 4 place a chip on any open cell, 4 remove an
  opponent's chip (never your own, never one already part of a completed sequence).
- A card that can never be legally played again (dead card) can be discarded and redrawn on
  your turn without using up your turn.

Full rules are also in-app via the "How to Play" / "Rules" buttons.

### Themes

| Theme | How matching works |
|---|---|
| **Emoji Match** | Play the identical emoji shown on your card. |
| **Space** | 48 real planets, moons, stars, and sci-fi/space terms — matched identically (no invented names). |
| **Noun/Adjective** | 24 adjective cards, each printing its own 2 matching board nouns right on the card (e.g. "Fluffy — Cloud · Sheep"), giving 4 valid board cells per draw. |

## Tech stack

- Next.js (App Router) + TypeScript + Tailwind v4
- Firebase Admin SDK + Firestore for game state — **no client-side Firebase config**; all
  reads/writes go through Next.js API routes, and `firestore.rules` denies all direct client
  access.
- Client polls `GET /api/games/[gameId]` every 2 seconds — no websockets.
- Vitest for the core game engine (board generation, deck building, sequence detection, play
  validation, theme content).

## Project layout

```
app/                       Pages + API routes (App Router)
components/                UI components
lib/engine/                Pure, framework-agnostic game engine (+ unit tests)
lib/themes/                Theme plug-in architecture + the 3 themes' content
lib/firebaseAdmin.ts       Firebase Admin SDK setup (server-only)
types/game.ts              Shared game/Firestore document types
firestore.rules            Deny-all rules (Admin SDK bypasses these)
```

## Local development

```bash
npm install
npm run dev       # http://localhost:3000
npm test          # vitest run — engine + theme content tests
npm run lint
npm run build
```

The app will run and the engine tests will pass without any Firebase setup. **Creating,
joining, or playing a game requires Firestore credentials** (see the next section) —
until those are set, the API routes will fail at request time with a clear "Missing Firebase
admin credentials" error.

## Manual setup required (Amy — two steps, both need interactive/OAuth login)

These two steps can't be done headlessly and are left for you to complete:

### 1. Create the Firebase project (for local dev)

1. Go to the [Firebase console](https://console.firebase.google.com/) and click **Add
   project**. Name it something like `sequel-game` (this is a brand-new, separate project from
   any other game's Firebase project — keeps free-tier quota independent).
2. Once created, go to **Build → Firestore Database → Create database**. Choose **Production
   mode** (the app's `firestore.rules` already denies all direct client access; only the
   server-side Admin SDK can read/write) and pick any region.
3. Go to **Project settings (gear icon) → Service accounts → Generate new private key**. This
   downloads a JSON file — treat it like a password, never commit it.
4. From that JSON file, copy three values into a new `.env.local` file in the project root
   (this file is already gitignored):

   ```
   FIREBASE_PROJECT_ID=<the "project_id" field>
   FIREBASE_CLIENT_EMAIL=<the "client_email" field>
   FIREBASE_PRIVATE_KEY="<the "private_key" field, including the -----BEGIN/END----- lines>"
   ```

   Keep the private key wrapped in quotes and keep its `\n` sequences literal — the app
   converts them to real newlines at startup (see `lib/firebaseAdmin.ts`).
5. Restart `npm run dev`. You should now be able to create and play a game at
   `http://localhost:3000`.

### 2. Deploy to Vercel

1. Push this repo to GitHub (already done — see below) if you haven't.
2. Go to [vercel.com/new](https://vercel.com/new), sign in, and **Import** the `Sequel` GitHub
   repo.
3. Before the first deploy (or right after, then redeploy), open the new Vercel project's
   **Settings → Environment Variables** and add the same 3 variables from `.env.local`:
   `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` (paste the private key
   exactly as it is in `.env.local`, quotes and all).
4. Click **Deploy**. Once it's live, the Vercel URL is what you'll share with friends and what
   gets linked into `game-arcade`'s `src/data/games.ts` (a separate, later step).

Do not commit `.env.local` or the downloaded service-account JSON file anywhere.
