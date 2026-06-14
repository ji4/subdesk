# GA 追蹤設定

## 基本資訊

- GA4 Measurement ID：`G-TJNXR7NCT4`
- 追蹤碼放在 `index.html` 的 `<head>` 中，頁面載入時會送出預設 page view。

## GA4 預設自動事件

| 事件 | 說明 |
|------|------|
| `page_view` | 進入頁面 |
| `session_start` | 新 session 開始 |
| `first_visit` | 第一次造訪 |
| `user_engagement` | 使用者在頁面上有互動 |

若 GA4 資料串流開啟「增強型評估」，還會自動收集：捲動深度、外部連結點擊、檔案下載等。這些由 GA4 後台控制，非程式碼。

## 自訂事件（已實作於 `app.js`）

### 影片載入

| 事件名稱 | 參數 | 說明 |
|---------|------|------|
| `load_video` | `source`: `youtube` \| `local` | 使用者按下「載入影片」成功。 |

### 字幕相關

| 事件名稱 | 參數 | 說明 |
|---------|------|------|
| `fetch_subtitles_success` | `subtitle_count`: 數字 | API 成功取得 YouTube 字幕（附條數） |
| `fetch_subtitles_fail` | — | API 失敗或無字幕 |
| `upload_subtitle` | `format`: `srt` \| `vtt` | 使用者手動上傳字幕檔 |
| `revert_subtitle` | — | 使用者將某句字幕還原為原文 |

### 輸出動作

| 事件名稱 | 參數 | 說明 |
|---------|------|------|
| `download_output` | `format`: `srt` \| `vtt` \| `txt` | 下載整份字幕 |
| `copy_output` | — | 點「複製」按鈕 |
| `switch_output_format` | `format`: `srt` \| `vtt` \| `txt` | 切換輸出格式 |

### AI 使用教學

| 事件名稱 | 參數 | 說明 |
|---------|------|------|
| `open_ai_tutorial` | — | 點開「搭配 AI 使用教學」彈窗（工具內建說明） |
| `copy_ai_prompt` | — | 在教學彈窗中複製提示詞範本 |

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

> 注意：外部連結點擊可能已被 GA4 增強型評估自動收集（`click` 事件），視 GA4 設定而定。若有開啟，`sponsor_click`/`contact_click` 可能重複。

## 本機排除設定

`index.html` 已加入 `ga-disable` 保護：偵測到 `localhost`、`127.0.0.1`、`::1`，或 `10.x`、`192.168.x`、`172.16–31.x` 內網 IP，會自動停用 GA（不送任何資料）。

## 手動排除設定

網址加上 `?notrack` 會停用 GA，且不載入 `gtag.js`。
