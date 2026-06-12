# SubDesk — 影片字幕校正工具

**[English version →](README.md)**

純前端開源靜態網頁。YouTube 字幕透過一個私有 API 取得；本機開發可用內附的 dev-server 自抓字幕，無需任何正式後端。

---

## 本機開發

```bash
npm install
npm run dev     # 啟動本機伺服器（含字幕 API）http://localhost:3000
```

無需設定 `config.js`。dev-server 會同時提供前端頁面與字幕 API，直接開 `http://localhost:3000` 即可。

---

## 文件

- [docs/comparison-matching.zh-TW.md](docs/comparison-matching.zh-TW.md) — 「校正前後對比」模式的配對與雙向同步邏輯（編號優先 → 全文搜尋退回、片段替換、刪除同步）。[English](docs/comparison-matching.md)

---

## 貢獻

歡迎針對前端 UI/UX 發 PR。
