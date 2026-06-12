# SubDesk — Subtitle Refinement Tool

**[中文版說明 →](README.zh-TW.md)**

> The Smoothest Way to Refine Subtitles
> **Live: https://ji4.github.io/subdesk/**

SubDesk puts **AI-assisted typo hunting** and **human verification** on a single screen, so you stop bouncing between your AI chat window, your video editor, and a separate player while fixing subtitles.

## The Problem

Video editors can auto-transcribe subtitles with AI now — but the output still contains typos, so you verify by hand. You may then paste the subtitles into another AI (ChatGPT, Claude, …) to flag likely typos. The painful part is what comes next: for every flagged line you have to find its timestamp, switch to a player, seek to that moment, listen, then switch back to fix the text. One window per step, dozens of switches per video.

## How SubDesk Solves It

```
 ┌───────────────────────┐  ┌────────────────────────────┐
 │                       │  │ Subtitle List   [All][Mod] │
 │   Video player        │  │ 00:01:12  .............    │
 │   (YouTube / local)   │  │ 00:03:45  ..typo.. ⚠️  ◄───┼─ click = jump & play
 │                       │  │ 00:08:12  ..typo.. ⚠️      │
 └───────────────────────┘  └────────────────────────────┘
 ┌──────────────────────────────────────────────────────┐
 │ Corrected output   ☑ modified only  ☑ comparison     │
 │ #12 00:03:45 | original | corrected   ◄─ paste the   │
 │ #27 00:08:12 | original | corrected      AI's reply  │
 └──────────────────────────────────────────────────────┘
```

1. Load a video and its `.srt` / `.vtt` subtitles.
2. Copy the subtitles to any AI with the built-in prompt template; it replies with a `#number time | original | corrected` list.
3. Paste the reply back — SubDesk matches every line to a subtitle (number first, full-text fallback, [details](docs/comparison-matching.md)) and marks the modified ones.
4. Click a timestamp to jump and play that exact moment. Keep the good fixes, revert the bad ones, then download.

Flag → jump → verify → fix. One screen, zero window switching.

## Features

- 🎬 **YouTube & local video** — load either, with `.srt` / `.vtt` upload (drag & drop supported)
- 🤖 **AI comparison mode** — paste an AI's before/after list; fuzzy matching survives wrong line numbers and out-of-order replies
- ⚠️ **Unmatched-line panel** — lines that match no subtitle are listed persistently, not silently dropped
- ⏱ **Click-to-seek** — click any subtitle's timestamp to jump the video there
- ↺ **Per-line revert** — kick any single change out of the modified list
- ⌨️ **Keyboard-first** — prev/next line, speed, seek; all keys rebindable
- 📝 **Export** — download or copy the corrected subtitles as `.srt` / `.vtt` / `.txt`
- 💾 **Auto-persist** — progress is saved in the browser; close and resume anytime
- 🌐 **Bilingual UI** — Traditional Chinese / English
- 🆓 **Free, no sign-up** — front-end only; local files never leave the browser (fetching YouTube subtitles is blocked by browser CORS and must run server-side, so it goes through a small private API)

## Local Development

```bash
npm install
npm run dev     # Starts local server with subtitle API at http://localhost:3000
```

No `config.js` needed. The dev-server serves both the frontend and subtitle API locally.

## Documentation

- [docs/comparison-matching.md](docs/comparison-matching.md) — Matching and two-way sync logic for the before/after comparison mode. [中文版](docs/comparison-matching.zh-TW.md)
- [docs/design-system.md](docs/design-system.md) — Design tokens and UI conventions.

## Contributing

PRs for frontend UI/UX improvements are welcome.
