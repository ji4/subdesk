# YouTube Subtitle Editor — Design System

**Style:** Micro-interactions + Dark Mode (OLED)  
**Framework:** DaisyUI (CDN) + Custom CSS  
**Font:** Plus Jakarta Sans

---

## Color Tokens

> **背景色更新（2026-05）：** `--bg: #111214`（近黑）、`--surface: #1A1C1F`、`--surface-2: #252830`，
> 取代原本偏藍的 slate 系列色，使整體更接近 OLED 純黑風格。



| Token | Value | Usage |
|-------|-------|-------|
| `--bg` | `#0F172A` | 主背景（頁面、面板底色） |
| `--surface` | `#1E293B` | 卡片、header、控制列背景 |
| `--surface-2` | `#334155` | hover 狀態、badge、次要背景 |
| `--border` | `rgba(255,255,255,0.08)` | 所有分隔線、邊框 |
| `--primary` | `#14B8A6` | 主色（timestamp、active 狀態、focus ring） |
| `--primary-dk` | `#0D9488` | primary hover 狀態 |
| `--accent` | `#F97316` | 行動按鈕（載入影片、主要 CTA） |
| `--text` | `#F1F5F9` | 主要文字 |
| `--text-muted` | `#94A3B8` | 次要文字、時間戳記、placeholder |
| `--error` | `#EF4444` | 錯誤、STT 錯字、刪除 |
| `--success` | `#22C55E` | 儲存成功、新增字幕按鈕 |
| `--warning` | `#F59E0B` | 警告提示（備用） |

---

## Typography

**字型：** Plus Jakarta Sans  
**載入：** `https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap`

**基準：** `body { font-size: 16px }` — 所有 body text 最小 16px

| 元素 | 大小 | 字重 | 顏色 |
|------|------|------|------|
| Header 標題 | 1rem (16px) | 600 | `--text` |
| 區塊 h3 | 1rem (16px) | 600 | `--text` |
| 字幕文字（subtitle-wrong/correct） | 16px | 400 | `--text` / `--error` |
| YouTube 字幕列表項目 | 16px | 400 | `--text` |
| 按鈕標籤（CTA、載入影片） | 16px | 600 | varies |
| 快捷鍵提示文字 | 16px | 400 | `--text` |
| 輸出區塊 options/textarea | 16px / 15px | 400 | `--text-muted` / `--text` |
| 時間戳記 badge | 13px | 600 | `--primary` |
| 序號 badge（索引） | 12px | 600 | `--text-muted` |
| 次要說明（formats span） | 14px | 400 | `--text-muted` |
| 等寬（輸出/時間） | `Consolas, Monaco, monospace` | — | — |

---

## Micro-interaction Timing

| 互動類型 | 時間 | 說明 |
|---------|------|------|
| `--dur-fast` | `50ms` | 按鈕 active press、刪除動畫 |
| `--dur-normal` | `150ms` | hover、focus、border 顏色 |
| `--dur-slow` | `300ms` | 版面切換、toast 進出 |

**原則：**
- 所有 button 按下: `transform: scale(0.97)` at `50ms`
- 所有 hover: `background` 或 `color` 轉換 at `150ms`
- 不使用 `translateY` hover（避免跳動感）
- Focus: `border-color: var(--primary)` + 輕微 `background` tint

---

## 當前播放狀態

| 元素 | 樣式 |
|------|------|
| `.subtitle-item.current-playing` | `background: rgba(20,184,166,0.16)` + 左側 `3px solid --primary !important` |
| `.youtube-subtitle-item.current-playing` | 同上 |
| `.subtitle-item.finished` | `border-left: 2px solid transparent`（恢復原位） |

> **注意：** 暗底必須用 16%+ 透明度，否則 8% teal 幾乎不可見（與暗底對比度不足）。

---

## Layout 原則

- **Body:** 無 padding/margin，直接鋪滿視窗
- **Container:** 全高 flex column，無 border-radius
- **兩欄分隔:** `1px solid var(--border)`，無 box-shadow
- **區塊之間:** 僅用 `border-bottom: 1px solid var(--border)` 分隔，不用 margin/gap
- **字幕列:** 無 card 外觀，僅 `border-bottom`，背景透明，hover 時極淡白色 overlay

---

## 元件規格

### Buttons

| 類型 | Background | Color | Border |
|------|-----------|-------|--------|
| Primary CTA（載入影片） | `--accent` | `white` | none |
| Secondary（控制、切換） | `--surface-2` | `--text-muted` | `1px solid --border` |
| Active tab | `--primary` | `#0F172A` | none |
| Ghost（刪除、toggle） | `transparent` | `--text-muted` | `1px solid --border` |
| Upload subtitle（上傳字幕檔） | `rgba(20,184,166,0.14)` | `--primary` | `1px solid rgba(20,184,166,0.38)` |

> **上傳字幕按鈕** 使用 primary teal outline 樣式與其他 secondary 按鈕區分，突顯其主要行動性質。

### Input / Textarea

- Background: `--surface`
- Border: `1px solid --border`
- Focus border: `--primary`
- Placeholder: `--text-muted`

### Toast Notification

- Background: `--surface`，帶 `box-shadow: 0 8px 24px rgba(0,0,0,0.5)`
- 進場：`translateX(0)` from `translateX(120%)`，`300ms`
- Error: 左側 `3px solid --error`

---

## 禁止事項

- 不用 emoji 當 icon（現有 emoji 保留，新增元素改用 SVG）
- 不用 `box-shadow` 在 card/panel（扁平 seamless 設計）
- 不用 `transform: translateY` 在 hover（用顏色替代）
- 不用 `border-radius > 8px` 在非按鈕元素
- 淺色底上不放深色文字（反之亦然）
