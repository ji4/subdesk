# SubDesk — 影片字幕校正工具

**[English version →](README.md)**

> The Smoothest Way to Refine Subtitles
> **線上使用：https://ji4.github.io/subdesk/**

SubDesk 把「**AI 挑錯字**」和「**人工核對**」放進同一個畫面，校字幕時不用再於 AI 對話視窗、剪輯軟體、播放器之間切來切去。

## Demo

<video src="https://github.com/ji4/subdesk/releases/download/demo-videos/threads-video-9x16.mp4" width="360" controls></video>

## 要解決的問題

影片剪輯軟體已經能用 AI 自動辨識字幕——但辨識結果還是會有錯字，得人工核對。這時你可能會把字幕再丟給另一個 AI（ChatGPT、Claude…）幫忙挑出可能的錯字。麻煩的是接下來：每一個被挑出的錯字，都要查時間戳、切到播放器、拉到那個時間點、聽完、再切回去改字。一個步驟一個視窗，一支影片切換幾十次。

## SubDesk 怎麼解決

```
 ┌───────────────────────┐  ┌────────────────────────────┐
 │                       │  │ 字幕列表      [全部][已修改] │
 │   影片播放器           │  │ 00:01:12  ……………………        │
 │   (YouTube / 本機)     │  │ 00:03:45  …錯字… ⚠️  ◄─────┼─ 點擊＝跳轉播放
 │                       │  │ 00:08:12  …錯字… ⚠️        │
 └───────────────────────┘  └────────────────────────────┘
 ┌──────────────────────────────────────────────────────┐
 │ 校正後輸出   ☑ 僅顯示已修改  ☑ 顯示前後對比             │
 │ #12 00:03:45 | 原文 | 修正後    ◄─ 把 AI 的回覆        │
 │ #27 00:08:12 | 原文 | 修正後       貼到這裡            │
 └──────────────────────────────────────────────────────┘
```

1. 載入影片與 `.srt` / `.vtt` 字幕。
2. 用內建的提示詞範本把字幕複製給任何 AI，它會以 `#編號 時間 | 原文 | 修正後` 格式回覆。
3. 把回覆貼回來——SubDesk 會逐行配對到字幕（編號優先、全文搜尋退回，[細節](docs/comparison-matching.zh-TW.md)）並標記修改處。
4. 點時間戳直接跳到那個時間點播放核對。改得對就留著、改錯就還原，最後下載。

挑錯 → 跳轉 → 核對 → 修改，一個畫面完成，不用切視窗。

## 功能特色

- 🎬 **YouTube＋本機影片**——兩種都能載入，支援 `.srt` / `.vtt` 上傳與拖曳。
- 🤖 **AI 對比模式**——貼上 AI 的前後對比清單；模糊配對不怕編號錯誤或順序亂掉
- ⚠️ **無法對應面板**——對不上字幕的行會常駐列出，不會被默默吞掉。
- ⏱ **點擊跳轉**——點任一句字幕的時間戳，影片直接跳到該處。
- ↺ **單句還原**——任何一句修改都能單獨踢出已修改清單
- ⌨️ **鍵盤優先**——上下句、調速、跳秒，按鍵全部可自訂。
- 📝 **匯出**——校正後字幕一鍵下載或複製為 `.srt` / `.vtt` / `.txt`
- 💾 **自動儲存**——進度存在瀏覽器，關掉再開繼續做。
- 🌐 **雙語介面**——繁體中文／英文
- 🆓 **免費免註冊**——純前端；本機檔案不會離開瀏覽器（YouTube 字幕受瀏覽器 CORS 限制、必須在伺服器端抓取，因此經由一個小型私有 API 取得）。

## YouTube 自動字幕的限制

在 [ji4.github.io/subdesk](https://ji4.github.io/subdesk/) 上使用時，YouTube 影片的自動字幕可能無法正常抓取。這是因為瀏覽器 CORS 限制，字幕必須經由伺服器端取得；而 YouTube 會封鎖來自雲端主機（如 Vercel）的大量字幕請求。

**建議**：如果你需要可靠的 YouTube 字幕自動抓取，請把專案 clone 到本機執行：

```bash
git clone https://github.com/ji4/subdesk.git
cd subdesk
npm install
npm run dev
```

在本機執行時，字幕請求來自你自己的 IP，不受上述限制。

手動上傳 `.srt` / `.vtt` 字幕檔不受此限制影響，在線上版本完全正常。

## 本機開發

```bash
npm install
npm run dev     # 啟動本機伺服器（含字幕 API）http://localhost:3000
```

無需設定 `config.js`。dev-server 會同時提供前端頁面與字幕 API，直接開 `http://localhost:3000` 即可。

## 文件

- [docs/comparison-matching.zh-TW.md](docs/comparison-matching.zh-TW.md) — 「校正前後對比」模式的配對與雙向同步邏輯。[English](docs/comparison-matching.md)
- [docs/design-system.md](docs/design-system.md) — 設計 tokens 與 UI 慣例。

## 貢獻

歡迎針對前端 UI/UX 發 PR。

## 支持

如果 SubDesk 幫助了你的工作流程，歡迎支持這個專案。

[![支持這個專案](https://img.shields.io/badge/%E6%94%AF%E6%8C%81%E9%80%99%E5%80%8B%E5%B0%88%E6%A1%88-%E8%B4%8A%E5%8A%A9%E6%94%AF%E6%8C%81-ff6b35?style=for-the-badge&logo=buymeacoffee&logoColor=white)](https://p.ecpay.com.tw/4931F0A)
