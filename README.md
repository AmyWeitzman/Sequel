# Sequel 🔗

A digital version of the board game **Sequence**. The classic 10×10 board layout is preserved,
but item placement is reshuffled every game and you pick from a few different themes at game
creation. Real-time online multiplayer for 2-3 players — join by room code.

## How to play

- Play a matching card from your hand onto the board to place your colored chip (red / blue /
  green — the Space theme displays these as red / yellow / light green for visibility against
  its dark background). Form a line of 5 chips — row, column, or diagonal — to complete a
  sequence.
- **2 players:** 7-card hand, first to complete **2 sequences** wins.
- **3 players:** 6-card hand, first to complete **1 sequence** wins.
- The 4 board corners are free spaces, already "filled" for everyone.
- Two of your sequences may share at most 1 board cell.
- Every deck has 8 wildcards: 4 place a chip on any open cell, 4 remove an opponent's chip
  (never your own, never one already part of a completed sequence).
- A card that can never be legally played again (a dead card) can be discarded and redrawn on
  your turn without using up your turn.

Full rules are also available in-app via the "How to Play" / "Rules" buttons.

### Themes

| Theme | How matching works |
|---|---|
| **Emoji** | Everyday emoji icons. Play the identical emoji shown on your card. |
| **Space** | Planets, moons, and other space imagery, matched the same way. |
| **Adjectives** | Nouns fill the board, adjectives fill your hand. Each adjective card lists its 2 matching nouns right on the card (e.g. "Fluffy — Cloud · Sheep"). |

## Tech stack

- Next.js (App Router) + TypeScript + Tailwind v4
- Firebase Admin SDK + Firestore for game state
- Vitest for the core game engine

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

Creating, joining, or playing a game requires Firestore credentials (see below) — the engine
tests run fine without them, but the API routes need a configured Firebase project.

## Setup

### 1. Firebase project

1. Go to the [Firebase console](https://console.firebase.google.com/) and click **Add
   project**.
2. Go to **Build → Firestore Database → Create database**. Choose **Production mode** and pick
   any region.
3. Go to **Project settings (gear icon) → Service accounts → Generate new private key**. This
   downloads a JSON file — treat it like a password, never commit it.
4. From that JSON file, create a `.env.local` file in the project root with:

   ```
   FIREBASE_PROJECT_ID=<the "project_id" field>
   FIREBASE_CLIENT_EMAIL=<the "client_email" field>
   FIREBASE_PRIVATE_KEY="<the "private_key" field, including the -----BEGIN/END----- lines>"
   ```

   Keep the private key wrapped in quotes and keep its `\n` sequences literal — the app
   converts them to real newlines at startup.
5. Restart `npm run dev`. You should now be able to create and play a game at
   `http://localhost:3000`.

### 2. Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and **Import** this repo.
2. In the new project's **Settings → Environment Variables**, add the same 3 variables from
   `.env.local`.
3. Click **Deploy**.

Never commit `.env.local` or the downloaded service-account JSON file.
