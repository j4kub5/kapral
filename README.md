# Kapral Papkłiz

A lightweight, client-side quiz app for practicing small batches of questions (e.g. 10 at a time). Runs entirely in the browser — no build step, no server required. Your answer history is stored in `localStorage`, so repeats are automatically skipped and your progress persists between sessions.

**[Play now →](https://j4kub5.github.io/kapral/)** — no installation, just open in your browser.

## Features

- **Pack-based quizzes** — select multiple question packs, pick a batch size (3, 5, 10, 20, 50 or ∞).
- **Skip answered questions** — an eye toggle lets you practice only new questions and avoid repeats.
- **Rank system** — your score maps to a "kłizowy" rank; clickable rank hierarchy on the dashboard.
- **Timer / challenge mode** — optional 15-second countdown per question, penalty for timeout, auto-advance.
- **i18n** — fully translated into Polish and English with a header toggle 🇵🇱/🇬🇧.
- **Persistent answer history** — stored in `localStorage`, exportable as a JSON file.
- **Import your own questions** — upload a `.md` or `.json` file, or paste Markdown directly; your packs survive a page refresh.
- **Themes & palettes** — light/dark mode plus several color palettes.
- **Math formulas** — LaTeX rendering via `$...$` syntax (MathJax).
- **Personalization** — username greeting with your last rank, progress bars on pack cards, app version in the header.

## Planned Features

- **Online multiplayer** — room-based lobbies with join codes; the host uploads a `.md` file and the server runs an authoritative game (up to 200 players, real-time results on the host's screen). Server: Node.js + Socket.io.
- **Statistics dashboard** — hit-rate charts per category, answer streaks, time spent on quizzes, and comparison with previous sessions.

## Changelog

### v0.2.2 (2026-08-01)
- Timer controls visually grouped in the start panel with a subtle separator.
- Fixed excess margin below user pack upload/paste cards.
- Added bottom padding to the page body.

### v0.2.1 (2026-08-01)
- i18n — Polish and English versions with a language toggle (Podprojekt A).
- Timer / challenge mode — 15s countdown, timeout penalty, auto-next (Podprojekt E).
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
