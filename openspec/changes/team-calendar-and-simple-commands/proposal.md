## Why

團隊需要一個看得到「哪天演出、哪天開會、哪天有什麼要交」的地方。演出記在給觀眾訂閱的 Google 公開日曆，會議這類內部日期不能放上去，目前沒有地方記。同時，群組指令已經有 `/`、`#`、回覆＋符號、tag 傑瓜四種，再加行程會更難記，Jesse 決定收斂成「只記一個 `/`」。

## What Changes

- 新增「行事曆」頁：月檢視＋當日清單，三層資料用不同樣式：演出（唯讀同步 Google 公開日曆「看我笑話演出行事曆」）、內部行程（只存在平台）、待辦（依截止日）。
- 內部行程可在網頁新增／編輯／刪除，也可以在群組用 `/行程 10/12 19:00 標題` 建立。
- 群組指令收斂成一個 `/`：第一個詞決定類型——`靈感`、`行程`、`說明`，其餘都是待辦。`#` 與「回覆＋只打符號」照樣支援但不再宣傳。
- tag 傑瓜的回覆先列「接下來 14 天的重要日子」（演出＋內部行程），再列每個人的待辦。
- 仍不使用任何語言模型 API、不發任何推播；建待辦／存靈感／加行程／查現況維持為獨立函式，預留之後接自然語言的入口。

## Capabilities

### New Capabilities

- `team-calendar`: 行事曆頁、三層資料合併、公開日曆同步與快取、內部行程管理

### Modified Capabilities

- `line-group-capture`: 指令文法改為 `/` 加類型詞（靈感／行程／說明），新增 `/行程`、`/說明`，用法提示改寫
- `bot-mention-summary`: 回覆加上接下來 14 天的重要日子

## Impact

- 新增：platform/lib/calendar/（iCal 解析、資料合併）、platform/app/(app)/calendar/、platform/supabase/migrations/0010_internal_events.sql
- 修改：platform/lib/line/commands.ts、platform/lib/line/webhook.ts、platform/lib/line/store.ts、platform/lib/line/summary.ts、platform/components/bottom-nav.tsx
- 外部：讀取 Google 公開日曆 iCal（唯讀，不寫回）
