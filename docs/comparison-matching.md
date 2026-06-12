# Comparison Matching & Sync Logic

**[中文版 →](comparison-matching.zh-TW.md)**

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

Lines that fail to parse or pass all three matching tiers are collected and shown in a persistent warning panel above the output area (not a transient toast), listed verbatim for inspection. The panel can be collapsed to its title only, and disappears automatically once those lines are fixed or removed.

## Known Limitations

- If the original field itself contains ` | `, the last ` | ` is used as the corrected-text separator, which may split incorrectly.
- Substring search takes the **first** hit; if the same fragment appears in multiple subtitles, an earlier one may be matched.
