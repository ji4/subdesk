# SubDesk — Subtitle Refinement Tool

**[中文版說明 →](README.zh-TW.md)**

A front-end-only open-source static web app. YouTube subtitles are fetched through a private API. For local development, the included dev-server handles subtitle fetching — no external backend required.

---

## Local Development

```bash
npm install
npm run dev     # Starts local server with subtitle API at http://localhost:3000
```

No `config.js` needed. The dev-server serves both the frontend and subtitle API locally.

---

## Documentation

- [docs/comparison-matching.md](docs/comparison-matching.md) — Matching and two-way sync logic for the before/after comparison mode (number-first → full-text fallback, fragment replacement, deletion sync). [中文版](docs/comparison-matching.zh-TW.md)

---

## Contributing

PRs for frontend UI/UX improvements are welcome.
