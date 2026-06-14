# GA 自訂事件評估方案

---

## 目前狀況

只有 GA4 預設自動事件，**沒有任何自訂事件**。無法從 GA4 得知使用者實際使用了哪些功能。

---

## 建議可加的自訂事件

### 影片載入

| 事件名稱 | 參數 | 說明 |
|---------|------|------|
| `load_video` | `source`: `youtube` \| `local` | 使用者按下「載入影片」成功 |

### 字幕相關

| 事件名稱 | 參數 | 說明 |
|---------|------|------|
| `fetch_subtitles_success` | `subtitle_count`: 數字 | API 成功拿回字幕，附條數。 |
| `fetch_subtitles_fail` | — | API 失敗或無字幕 |
| `upload_subtitle` | `format`: `srt` \| `vtt` | 使用者手動上傳字幕檔 |

### 輸出動作

| 事件名稱 | 參數 | 說明 |
|---------|------|------|
| `download_output` | `format`: `srt` \| `vtt` \| `txt` | 下載整份字幕 |
| `copy_output` | — | 點「複製」按鈕 |
| `switch_output_format` | `format`: `srt` \| `vtt` \| `txt` | 切換輸出格式 |

### 頁面行為

| 事件名稱 | 參數 | 說明 |
|---------|------|------|
| `reset_page` | — | 點「清除資料」 |
| `change_language` | `lang`: `zh-TW` \| `en` | 切換語系 |
| `customize_keybinding` | `key`: 鍵名 | 自訂快捷鍵 |

### 頁尾互動

| 事件名稱 | 參數 | 說明 |
|---------|------|------|
| `sponsor_click` | — | 點「贊助支持」連結 |
| `contact_click` | — | 點「寄信給站主」 |

> 注意：外部連結點擊可能已被 GA4 增強型評估自動收集（`click` 事件），視 GA4 設定而定。若有開啟，`sponsor_click`/`contact_click` 可省略。

---

## 隱私原則

所有事件：
- ❌ 不傳送字幕文字內容
- ❌ 不傳送影片完整 URL（只傳 source 類型）
- ❌ 不傳送使用者輸入的任何文字
- ✅ 只傳行為類型與非識別性數值參數

---

## 確認後的實作方式

確認事件清單後，統一在 `app.js` 對應的函式裡加入：

```js
// 範例
gtag('event', 'load_video', { source: 'youtube' });
```

不需改 `index.html`，GA 追蹤碼已在 `<head>` 中。
