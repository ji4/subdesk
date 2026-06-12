# 校正前後對比：配對與同步邏輯 / Comparison Matching & Sync Logic

中文在前，[English version below](#comparison-matching--sync-logic-english).

## 中文

本文件說明「顯示校正前後對比」模式下，輸出區（textarea）與字幕列表之間的雙向同步機制，以及對比行如何配對到字幕。對應程式碼：`app.js` 的 `parseComparisonLine`、`findComparisonTarget`、`syncComparisonToList`。

## 對比行格式

```
#編號 時間 | 原文 | 修正後
```

範例：

```
#12 00:03:45 | 我們來看這個涵數 | 我們來看這個函數
```

解析規則（`parseComparisonLine`）：

- 以**第一個** ` | ` 與**最後一個** ` | ` 切成三段：表頭、原文、修正後。
- 表頭中以 `#?(\d+)` 抓取編號；`#` 可省略，整個編號與時間都**允許缺漏或錯誤**。
- 切不出三段的行視為無法解析，列入「無法對應」。

## 配對優先序（`findComparisonTarget`）

每一行依下列順序找出對應的字幕：

1. **編號優先**：以 `編號 - 1` 取字幕，且該句字幕的原文需「完全相同」或「包含」對比行的原文，才算命中。編號存在但原文對不上時，**不會**盲目相信編號，會進入退回流程。
2. **全文精確搜尋**：在全部字幕中找原文完全相同的句子。
3. **全文子字串搜尋**：在全部字幕中找包含該原文片段的句子，取第一個命中。

補充規則：

- 退回搜尋會**跳過本輪已配對過的字幕**，避免兩行命中同一句。
- 原文為空字串的行直接視為無法對應（防止 `includes('')` 永遠為真）。
- 因為配對以行為單位、不依賴行的先後，**對比行不需要照編號順序排列**。

> 此設計源自舊版 `auto_correct_subtitle.sh` 的「字幕編號優先、找不到退回全文搜索」策略，並補強了「驗證編號命中時原文是否吻合」與「跳過已配對句」兩點。

## 套用方式

- 原文與整句字幕**完全相同** → 整句替換為「修正後」。
- 原文只是句子的**片段** → 在整句中做片段替換（`text.split(original).join(corrected)`），可一次替換句中多處相同片段。
- 套用結果與字幕原文相同（等於沒改）→ 該句還原為未修改。

## 雙向同步

| 操作 | 結果 |
|---|---|
| textarea 貼上／新增一行 | 配對成功即標記該句為已修改 |
| textarea 編輯某行的修正後文字 | 即時更新該句（debounce 400ms） |
| textarea 刪除某行 | 該句字幕還原為未修改 |
| 字幕列表編輯某句 | textarea 重新產生對比清單 |
| 字幕列表點 ↺ 還原按鈕 | 該句還原，並從 textarea 清單消失 |

刪除同步的實作：每輪同步記錄本輪配對到的字幕 index 集合，凡 `modified === true` 卻不在集合內的句子一律還原。

## 無法對應的行

解析失敗或三層配對皆未命中的行，會收集起來顯示在輸出區上方的警告面板（非一閃即逝的 toast），逐行列出原始內容供使用者檢查；當這些行被修正或刪除後，面板自動消失。

## 已知限制

- 「原文」欄位本身含有 ` | ` 時，會以最後一個 ` | ` 作為修正後的分隔，可能切錯段。
- 子字串搜尋取「第一個」命中，若同一片段出現在多句字幕中，可能對到較前面的句子。

---

# Comparison Matching & Sync Logic (English)

This document describes the two-way sync between the output textarea and the subtitle list in "before/after comparison" mode, and how comparison lines are matched to subtitles. Code: `parseComparisonLine`, `findComparisonTarget`, and `syncComparisonToList` in `app.js`.

## Comparison Line Format

```
#number time | original | corrected
```

Example:

```
#12 00:03:45 | 我們來看這個涵數 | 我們來看這個函數
```

Parsing rules (`parseComparisonLine`):

- The line is split into three parts by the **first** and the **last** ` | `: header, original, corrected.
- The number is extracted from the header via `#?(\d+)`; the `#` is optional, and both the number and the timestamp **may be missing or wrong**.
- Lines that cannot be split into three parts are treated as unmatched.

## Matching Priority (`findComparisonTarget`)

Each line is matched to a subtitle in the following order:

1. **Number first**: take the subtitle at `number - 1`, but only if its text **equals** or **contains** the line's original text. A number whose text does not match is **not** trusted blindly — the fallback kicks in.
2. **Full-text exact search**: find a subtitle whose text equals the original.
3. **Full-text substring search**: find the first subtitle whose text contains the original fragment.

Additional rules:

- Fallback search **skips subtitles already matched** in this pass, so two lines never hit the same subtitle.
- Lines with an empty original are treated as unmatched (guards against `includes('')` always being true).
- Matching is per-line and order-independent, so **comparison lines do not need to be sorted by number**.

> This design follows the "subtitle-number first, fall back to full-text search" strategy of the legacy `auto_correct_subtitle.sh`, hardened with original-text verification on number hits and skipping of already-matched subtitles.

## How Corrections Are Applied

- Original **equals** the full subtitle text → replace the whole line with the corrected text.
- Original is only a **fragment** → fragment replacement within the line (`text.split(original).join(corrected)`), replacing every occurrence.
- If the result equals the subtitle's original text (no actual change) → the subtitle reverts to unmodified.

## Two-Way Sync

| Action | Result |
|---|---|
| Paste / add a line in the textarea | The matched subtitle is marked as modified |
| Edit a line's corrected text in the textarea | The subtitle updates live (400 ms debounce) |
| Delete a line from the textarea | The subtitle reverts to unmodified |
| Edit a subtitle in the list | The textarea regenerates the comparison list |
| Click the ↺ revert button in the list | The subtitle reverts and its line disappears from the textarea |

Deletion sync: each pass records the set of matched subtitle indices; any subtitle with `modified === true` that is not in the set gets reverted.

## Unmatched Lines

Lines that fail to parse or pass all three matching tiers are collected and shown in a persistent warning panel above the output area (not a transient toast), listed verbatim for inspection. The panel disappears automatically once those lines are fixed or removed.

## Known Limitations

- If the original field itself contains ` | `, the last ` | ` is used as the corrected-text separator, which may split incorrectly.
- Substring search takes the **first** hit; if the same fragment appears in multiple subtitles, an earlier one may be matched.
