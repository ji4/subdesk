# GA 追蹤設定 — 首頁（landing.html）

## 基本資訊

- GA4 Measurement ID：`G-TJNXR7NCT4`（與工具頁共用同一個 Property）
- 初始化時帶入 `page_title: 'Landing Page'`，在 GA4 後台可透過「Page title」維度與工具頁區分。

## 頁面識別

在 GA4 後台可用以下維度區分兩頁：

| 維度 | 工具頁 | 首頁 |
|------|--------|------|
| Page path | `/subdesk/` 或 `/subdesk/index.html` | `/subdesk/landing.html` |
| Page title | `SubDesk` | `Landing Page` |

## 本機排除設定

`landing.html` 偵測到 `localhost`、`127.0.0.1`、或空字串 hostname，會自動停用 GA（不送任何資料）。

## 手動排除設定

網址加上 `?notrack` 會停用首頁 GA。此參數會在點擊 CTA 時自動帶入工具頁 URL，使工具頁 GA 也一併停用。

## UTM 參數規格（首頁 → 工具頁 CTA）

首頁上的三個「開啟 SubDesk」按鈕統一使用以下 UTM 結構：

| 參數 | 值 | 說明 |
|------|----|------|
| `utm_source` | `landing` | 來源為 SubDesk 首頁 |
| `utm_medium` | `cta` | 行銷媒介類型（call-to-action 按鈕） |
| `utm_campaign` | `lp_to_tool` | 追蹤首頁到工具頁的轉換流量 |
| `utm_content` | `nav` / `hero` / `footer` | 區分按鈕位置 |

完整連結範例：

```
https://ji4.github.io/subdesk/?utm_source=landing&utm_medium=cta&utm_campaign=lp_to_tool&utm_content=hero
```

在 GA4 後台「客戶開發 → 流量開發」中可用這些維度篩選，觀察從首頁帶入工具頁的轉換率與各按鈕效果。

## 語言偵測優先序

首頁在初始化時依以下順序決定顯示語言：

1. URL 參數 `?lang=en|zh-TW`（最高優先，會寫入 localStorage）。
2. localStorage `subdesk_lang_landing`。
3. `navigator.language`（非 `zh` 開頭視為英文）。
4. 預設 `zh-TW`。
