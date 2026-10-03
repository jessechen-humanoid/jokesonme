## Why

每個月號的 rundown 都是在 Google Doc 從上個月複製再手改時間點，簡報也是照 rundown 一頁頁做。段落順序或時長一改，後面每一列的「預計時間點」都要重算。先做一個基本版：平台上有一份結構化的節目表，程式自動算時間點、一鍵複製成 rundown 表格；需要客製的部分（簡報文字、主持稿潤飾）交給 Jesse 自己貼給 Claude。Jesse 指示「一切從簡，先做基本版再繼續客製化，因為不可能完全自動」。

## What Changes

- 每場演出新增一份「節目表」：開始時間＋依序排列的段落；每段有名稱、類型、時長（分鐘）、內容、道具、音效、投影。
- 演出頁新增「節目表」入口，點進獨立的節目表頁（手機優先）：新增／編輯／刪除段落、上下移動順序、從上一場有節目表的演出整份複製。
- 「複製 Rundown」：產生欄位與現有 Docx 相同的表格（節目順序／時間／預計時間點／內容／道具／音效／投影），預計時間點由開始時間加各段時長累加；複製時同時放 HTML 表格與純文字，貼進 Google Doc 是表格。
- 「複製給 Claude」：把整份節目表（含算好的時間點）連同簡短指令打包成純文字，Jesse 自己貼到 Claude 做簡報文字或其他客製。平台不呼叫任何語言模型 API。

## Non-Goals

- 問卷題目產生（這版不做，之後再加）。
- 自動產出簡報檔或 Google Doc／Slides（不串 Google API；只做複製到剪貼簿）。
- 「上場者」結構化欄位、分隊、成員宣傳頁：先寫在內容欄。
- 與 rundown／簡報連結欄位（show_links）的自動同步。

## Capabilities

### New Capabilities

- `program-sheet`: 每場演出的節目表資料、編輯頁、從上一場複製、Rundown 表格與「複製給 Claude」文字產生

### Modified Capabilities

- `show-planning-page`: 演出頁新增「節目表」入口

## Impact

- 新 migration：platform/supabase/migrations/0011_program_sheet.sql（`program_items` 表、`shows.program_start_time` 欄位、audit trigger）
- 新程式：platform/lib/program.ts（讀寫與排序）、platform/lib/program-render.ts（時間點、Rundown 表格、Claude 文字，純函式）
- 新頁面：platform/app/(app)/shows/[id]/program/（page.tsx、actions.ts）
- 修改：platform/app/(app)/shows/[id]/page.tsx（入口）、platform/app/globals.css
- 測試：platform/lib/program-render.test.ts、platform/supabase/test/program_items.test.sql
