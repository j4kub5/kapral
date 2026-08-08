# Kapral Papkłiz

A lightweight, client-side quiz app for practicing small batches of questions (e.g. 10 at a time). Runs entirely in the browser — no build step, no server required. Your answer history is stored in `localStorage`, so repeats are automatically skipped and your progress persists between sessions.

**[Play now →](https://j4kub5.github.io/kapral/)** — no installation, just open in your browser.

## Features

- **Pack-based quizzes** — select multiple question packs, pick a batch size (3, 5, 10, 20, 50 or ∞).
- **Skip answered questions** — an eye toggle lets you practice only new questions and avoid repeats.
- **Rank system** — your score maps to a "kłizowy" rank; clickable rank hierarchy on the dashboard.
- **Timer / challenge mode** — optional countdown per question with auto-advance.
- **i18n** — fully translated into Polish and English with a header toggle 🇵🇱/🇬🇧.
- **Persistent answer history** — stored in `localStorage`, exportable as a full JSON save (history + configuration + user packs) and restorable on any instance.
- **Import your own questions** — upload a `.md` file or paste Markdown directly; your packs survive a page refresh and can be downloaded back as `.md`.
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

## Changelog

### v0.2.99
- Multiplayer with a local Node.js + Socket.io server (`server/`): room codes, host uploads a `.md` pack, authoritative answer validation and scoring, live standings, results screen.
- QR code in the host's lobby — scanning it opens the app with the room code pre-filled (join screen).
- Room names — the host can name the room or get a random one (`Pokój-XXXX`); the room name and code stay visible on screen during the game.
- Multiplayer nickname is always set — falls back to a random `Gracz-XXXX` (remembered in `localStorage`), with a dice button to re-roll.
- Host-only mode — the host does not play by default (`hostPlays` toggle lets them join the game).
- Full JSON save (history + configuration + user packs) with a restore action; user packs are Markdown-only and downloadable as `.md`.
- GitHub icon next to the version number in the header.
- Removed the -1 pt timeout penalty.

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
