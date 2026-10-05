## Why

Jesse 2026-10-05 回報：用 `/靈感` 存的靈感在平台上「文字全部連在一起」。查證：LINE 原始訊息有換行，但 `parseCommand` 在挖掉 @mention 時把所有空白（含換行）壓成一個空格；`#` 寫法不受影響。Jesse 也希望靈感支援 Markdown 語法。

## What Changes

- `/靈感` 存靈感時保留原訊息的換行（只整理每行內多餘的空白）；待辦與行程標題維持單行。
- 一次性修復：用 LINE 原始訊息重算已被壓掉換行的靈感（目前 1 則）。
- 靈感卡片以安全的 Markdown 子集顯示：`#`／`##`／`###` 標題、`**粗體**`、`*斜體*`、`` `程式碼` ``、`-`／`*`／`1.` 條列、`>` 引用、`---` 分隔線、`[文字](網址)` 與自動連結；其他文字照原樣、換行保留。不使用 HTML 注入。

## Non-Goals

- 待辦、行程、LINE 原始訊息不套 Markdown。
- 不支援表格、圖片、HTML。

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `line-group-capture`: `/靈感` 保留換行
- `idea-library`: 靈感內容以 Markdown 顯示

## Impact

- platform/lib/line/commands.ts（mention 移除時保留換行）
- 新增 platform/lib/markdown.ts（純函式解析）與 platform/components/rich-text.tsx（React 繪製）
- platform/components/idea-list.tsx（改用 RichText；卡片內容改為可點的 div）
- platform/app/globals.css（Markdown 元素樣式，沿用四級字級）
- 一次性腳本 platform/scripts/oneoff-idea-newlines-20261005.mts
