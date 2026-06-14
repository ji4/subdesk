# GA 追蹤設定

## 基本資訊

- GA4 Measurement ID：`G-TJNXR7NCT4`
- 追蹤碼放在 `index.html` 的 `<head>` 中，頁面載入時會送出預設 page view。

## 目前實際追蹤的內容

**只有 GA4 預設自動事件**，無任何自訂事件：

| 事件 | 說明 |
|------|------|
| `page_view` | 進入頁面 |
| `session_start` | 新 session 開始 |
| `first_visit` | 第一次造訪 |
| `user_engagement` | 使用者在頁面上有互動 |

若 GA4 資料串流開啟「增強型評估」，還會自動收集：捲動深度、外部連結點擊、檔案下載等。這些由 GA4 後台控制，非程式碼。

**不追蹤**：按鈕點擊、字幕上傳、下載、複製等使用行為。

## 本機排除設定

`index.html` 已加入 `ga-disable` 保護：偵測到 `localhost`、`127.0.0.1`、`::1`，或 `10.x`、`192.168.x`、`172.16–31.x` 內網 IP，會自動停用 GA（不送任何資料）。

## 手動排除設定

網址加上 `?notrack` 會停用 GA，且不載入 `gtag.js`。
