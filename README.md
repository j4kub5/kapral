# Kapral Papkłiz

A lightweight, client-side quiz app for practicing small batches of questions (e.g. 10 at a time). Runs entirely in the browser — no build step, no server required. Your answer history is stored in `localStorage`, so repeats are automatically skipped and your progress persists between sessions.

**[Play now →](https://kapral-pk.onrender.com)** — no installation, just open in your browser. A static mirror (single-player only) is also hosted on GitHub Pages at `https://j4kub5.github.io/kapral/`.

## Features

- **Pack-based quizzes** — select multiple question packs, pick a batch size (3, 5, 10, 20, 50 or ∞).
- **Skip answered questions** — an eye toggle lets you practice only new questions and avoid repeats.
- **Rank system** — your score maps to a "kłizowy" rank; clickable rank hierarchy on the dashboard.
- **Timer / challenge mode** — optional countdown per question with auto-advance.
- **i18n** — fully translated into Polish and English with a header toggle 🇵🇱/🇬🇧.
- **Persistent answer history** — stored in `localStorage`, exportable as a full JSON save (history + configuration + user packs) and restorable on any instance.
- **Import your own questions** — upload a `.md` file or paste Markdown directly; your packs survive a page refresh and can be downloaded back as `.md`.
- **AI question generation** — generate quiz packs from a topic with the Gemini API (free key set in settings; results land as an `AI:` pack).
- **Infinite AI Quiz** — AI generates questions in the background while you play, with AI-suggested category steering.
- **Themes & palettes** — light/dark mode plus several color palettes.
- **Multiplayer** — play against friends on a local server (`server/`, Node.js + Socket.io). Room names, join codes, QR join, live standings.
- **Math formulas** — LaTeX rendering via `$...$` syntax (MathJax).
- **Personalization** — username greeting with your last rank, progress bars on pack cards, app version in the header.

## Planned Features

- **Statistics dashboard** — hit-rate charts per category, answer streaks, time spent on quizzes, and comparison with previous sessions.

## Local Server Setup (multiplayer)

**Prerequisites:** [Node.js](https://nodejs.org/) ≥ 18

**Arch Linux:**
```
sudo pacman -S nodejs npm
```

**Start:**
```
cd server
npm install
npm start
```

Server runs at `http://localhost:3000`. Open the app there, click **Multiplayer**, and host or join a room.

The host's lobby shows a **QR code** that players scan to jump straight into the room. The QR points to the server's LAN address (auto-detected), or to a custom address if the `PUBLIC_URL` environment variable is set, e.g.:

```
PUBLIC_URL=https://kapral.example.com npm start
```

## Deploy to Render (free tier)

The multiplayer server can be hosted publicly on [Render.com](https://render.com) for free. Deployment is driven by the blueprint in `server/render.yaml` — no manual server configuration needed.

1. **Prereqs:** a [Render](https://render.com) account and this repo pushed to GitHub.
2. In the Render dashboard: **New → Blueprint**.
3. **Connect your GitHub repo** containing this project. Render reads `server/render.yaml` and creates the `kapral-pk` web service automatically (build `npm install`, start `npm start`, free plan).
4. Render injects the `PORT` env var itself. The blueprint also sets `PUBLIC_URL=https://kapral-pk.onrender.com`, so QR codes and join URLs point at the public address.
5. Wait for the first deploy to finish, then open `https://kapral-pk.onrender.com` and click **Multiplayer** to host or join a room.

**Notes:**
- The free tier spins down after ~15 minutes of inactivity; the first request after a gap takes a few extra seconds (cold start).
- The static server only serves frontend files (`index.html`, `*.js`, `*.css`, `*.md`, `logo.png`, `packs/`) — the `server/` directory (including `node_modules/`) is **not** exposed publicly.
- Rooms time out after 30 minutes of inactivity, and if the host disconnects the game ends — same behavior as the local server.

## Changelog

### v0.4.2
- AI generation enforces exactly 4 options and required explanations; expert prompt (fact-checking, distractor quality).
- Infinite quiz: wider anti-repeat recall, auto-advance fix.
- Internal refactors: shared sanitizeQuestion/shuffleArray, rank/import hardening.

### v0.4.1
- Answer feedback sound (correct/wrong) in single-player.
- Compact mobile UI: 2-column pack grid, smaller header, inline search bar.
- "Skip answered" toggle defaults to ON and persists in localStorage.
- Duplicate quiz navigation (prev/next) above the question — scroll only for explanations.
- New question packs: Fizyka i chemia, Biologia.

### v0.4.0
- AI question generation with the Gemini API — generate quiz packs from a topic (free key set in settings, results land as an `AI:` pack).
- **Infinite AI Quiz** — AI generates questions in the background while you play; category steering with AI-suggested chips + custom input.
- Wikipedia integration refactored: full article extracts (`prop=extracts`) with a 3-step fallback (direct lookup → search → OpenSearch), context limit raised to 5000 chars, fetched per batch.
- Background-generation progress indicators: step text during AI generation, spinner in the question counter, early "generating" overlay.
- Action tiles (Upload, Paste, Generate AI, Infinite AI Quiz) moved to the top of the dashboard.
- Security hardening: DOMPurify sanitization for multiplayer-received questions and JSON-imported packs, plus server-side input size limits (nickname/room name/markdown/answer).

### v0.3.1
- Answer options are now shuffled when a quiz starts (single-player and multiplayer) to neutralize AI-generated "always-correct-first" bias.
- Header consolidated into a single settings button (`fa-sliders`) for theme, palette, and language.
- AI question prompt in Help now requires explanations to describe why each wrong option is wrong (and forbids ambiguous distractors).

### v0.3.0
- Multiplayer with a local Node.js + Socket.io server (`server/`): room codes, host uploads a `.md` pack, authoritative answer validation and scoring, live standings, results screen.
- QR code in the host's lobby — scanning it opens the app with the room code pre-filled (join screen).
- Room names — the host can name the room or get a random one (`Pokój-XXXX`); the room name and code stay visible on screen during the game.
- Multiplayer nickname is always set — falls back to a random `Gracz-XXXX` (remembered in `localStorage`), with a dice button to re-roll.
- Host-only mode — the host does not play by default (`hostPlays` toggle lets them join the game).
- Full JSON save (history + configuration + user packs) with a restore action; user packs are Markdown-only and downloadable as `.md`.
- GitHub icon next to the version number in the header.
- Removed the -1 pt timeout penalty.
- Public hosting on Render.com via blueprint `server/render.yaml` (service `kapral-pk`, free tier, `PUBLIC_URL` env).
- The multiplayer server now serves **only** frontend files (`server/`, including `node_modules/`, is not exposed publicly).
- Full browser E2E suite with headless Chromium (`cd server && npm run test:browser`).

### v0.2.2 (2026-08-01)
- Timer controls visually grouped in the start panel with a subtle separator.
- Fixed excess margin below user pack upload/paste cards.
- Added bottom padding to the page body.

### v0.2.1 (2026-08-01)
- i18n — Polish and English versions with a language toggle (Podprojekt A).
- Timer / challenge mode — 15s countdown, auto-next (Podprojekt E).
- Paste Markdown directly to create a pack; user packs are now persisted in `localStorage`.
- App version badge in the header.
- Help split into `help_pl.md` / `help_en.md`.

### v0.2.0 (2026-07-30)
- Inline username input (replaces the modal — keeps focus, Enter/Save/Escape/Cancel).
- Clickable rank hierarchy list with a chevron hint.
- Code cleanup refactor (ponytail).
- New question packs: emacs, PRL, birds, geography; removed obsolete `prad.md`; manifest reordered.
- 5 fixes before release: safe `JSON.parse`, `resetHistory` + `lastRank`, dialog `x-effect`, `rankName` guard, username validation.

### v0.1.0 — first release
- Pack-based quiz with multi-pack selection and batch-size presets (3/5/10/20/50/∞).
- Skip-answered toggle for repeat-free practice.
- Rank names based on score.
- Color palette switcher, dark/light theme.
- Help view with Markdown instructions and an AI prompt template.
- Personalized greeting with last quiz rank and progress on pack cards.
- MathJax rendering of `$...$` formulas.
