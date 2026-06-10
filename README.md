# SubDesk — 影片字幕校正工具 / Subtitle Review Tool

純前端開源靜態網頁。YouTube 字幕透過一個私有 API 取得；本機開發可用內附的 dev-server 自抓字幕，無需任何正式後端。

A front-end-only open-source static web app. YouTube subtitles are fetched through a private API. For local development, the included dev-server handles subtitle fetching — no external backend required.

---

## 本機開發 / Local Development

```bash
npm install
npm run dev     # 啟動本機伺服器（含字幕 API）http://localhost:3000
                # Starts local server with subtitle API at http://localhost:3000
```

無需設定 `config.js`。dev-server 會同時提供前端頁面與字幕 API，直接開 `http://localhost:3000` 即可。

No `config.js` needed. The dev-server serves both the frontend and subtitle API locally.

---

## 貢獻 / Contributing

歡迎針對前端 UI/UX 發 PR。

PRs for frontend UI/UX improvements are welcome.
