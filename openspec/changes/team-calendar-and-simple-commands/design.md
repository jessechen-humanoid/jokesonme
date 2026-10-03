## Context

平台（platform/，Next.js on Cloudflare Workers ＋ Supabase）已有待辦、靈感、企劃、財務，LINE Bot 支援 `/` 待辦、`#` 靈感、回覆＋符號、tag 傑瓜回覆待辦一覽（只用免費 reply）。演出記在 Google 公開日曆「看我笑話演出行事曆」（觀眾訂閱用），2026-10-03 實測 iCal 可讀：38 筆、時間為 UTC、含 1 筆重複規則、有整天與有時間的活動。不使用任何語言模型 API；平台不發推播。

## Goals / Non-Goals

**Goals:**

- 行事曆頁：演出、內部行程、待辦三層。
- 內部行程：網頁與 `/行程` 建立。
- 群組指令收斂成一個 `/`，tag 傑瓜加上重要日子。

**Non-Goals:**

- 寫回 Google 日曆、從平台建立演出。
- 語言模型（自然語言對話）；只預留入口。
- 推播提醒。
- 行程的負責人／出席名單、週檢視、拖拉排程。

## Decisions

### 自己寫最小的 iCal 解析

只需要 VEVENT 的 UID、DTSTART／DTEND（UTC `Z`、`TZID=Asia/Taipei`、`VALUE=DATE` 三種）、SUMMARY、LOCATION、RRULE（DAILY／WEEKLY／MONTHLY，含 INTERVAL、COUNT、UNTIL、BYDAY 的週幾）與 EXDATE。自己寫成純函式（platform/lib/calendar/ics.ts）好測、沒有 Workers 相容性風險。替代方案：npm 的 iCal 套件——多半依賴 Node 檔案 API 或體積大，否決。遇到不支援的 RRULE 寫法時只顯示第一次並記 log。

### 公開日曆快取與「最後一次成功」副本

伺服器讀 iCal 時用 Cloudflare fetch 快取 600 秒；每次成功解析後把原始 iCal 文字與時間存進 `app_settings`（key `show_calendar_ics`、`show_calendar_fetched_at`）。讀取失敗時改用這份副本並顯示抓取時間；完全沒有副本時顯示「演出資料讀不到」。iCal 網址放在 `wrangler.toml` 的 `SHOW_CALENDAR_ICS_URL`（公開網址，不是機密）。

### 三層資料在伺服器合併成「每日清單」

純函式 `buildDays(range, shows, events, todos)` 回傳每天的三層項目（已轉台北時間、已排序），行事曆頁與 tag 傑瓜的「接下來 14 天」共用同一份結果，避免兩邊算法不同。

### 指令文法：`/` ＋ 類型詞

`parseCommand` 改成先看 `/` 後第一個詞：`靈感`、`行程`、`說明` 後面必須接空白或結尾才算類型詞（`/靈感會議要訂場地` 仍是待辦）。`/行程` 的日期 `M/D`、選填 `HH:MM`、其餘為標題；年份取「今天或之後最近的那一天」（台北日期）。`#`、回覆＋只打 `/` 或 `#` 繼續支援；回覆＋`/靈感`（無內容）也存被回覆的訊息為靈感。小抄只介紹 `/` 文法與 tag 傑瓜。

### 動作函式共用、預留自然語言入口

建待辦、存靈感、加行程、查現況都是 `WebhookStore`／伺服器端的獨立函式，網頁、指令共用。之後若付費接 Claude，新增一個「tag 傑瓜＋一般句子 → Claude tool use → 呼叫同一組函式」的分支即可，不改既有指令；不需要 Hermes。

## Implementation Contract

**行為：** 行事曆頁（手機底部分頁「行事曆」、電腦左側欄）顯示月格與當日清單；演出唯讀、內部行程可增改刪；`/行程 10/12 19:00 標題` 建立行程並回覆；`/說明` 回覆小抄；`/靈感 …` 存靈感；tag 傑瓜先列 14 天重要日子再列待辦。

**資料形狀：** 新表 `internal_events`（id、event_date date、event_time time null、title、notes、created_by、deleted_at、created_at，含 audit trigger、軟刪除）。`app_settings` 新增 `show_calendar_ics`、`show_calendar_fetched_at`。日曆項目型別 `{ kind: "show" | "event" | "todo", date, time?, title, id?, href? }`。

**錯誤處理：** iCal 讀不到 → 用最後副本＋提示；`/行程` 日期或標題無效 → 不建立、回小抄；行程寫入失敗 → 回覆「沒有存成功」。

**驗收：** 單元測試涵蓋 spec 的時間轉換、年份、文法範例表；行事曆頁 375px 無橫向捲動；正式環境 iCal 讀得到 38 筆左右的演出；Jesse 在群組實測 `/行程`、`/說明`、`/靈感`、tag 傑瓜各一次。

**範圍內：** platform/lib/calendar/、platform/app/(app)/calendar/、指令與傑瓜回覆、0010 migration、導覽。**範圍外：** 寫回 Google 日曆、語言模型、推播、週檢視。

## Risks / Trade-offs

- [Google 改 iCal 格式或關閉公開] → 最後副本＋提示；檢查失敗時頁面標示資料時間。
- [RRULE 寫法超出支援範圍] → 只顯示第一次並記 log；目前實測只有 1 筆重複活動。
- [`/行程` 日期寫法多樣（10月12日、下週三）] → 只認 `M/D`，其他回小抄；之後接語言模型時再放寬。
- [類型詞誤判，例如待辦本身以「行程」開頭] → 類型詞後必須是空白或結尾；`/行程` 還需合法日期，否則回小抄而不是建成待辦，避免默默建錯。

## Migration Plan

1. 套 0010 migration（新表，不動既有資料）。
2. 部署；行事曆頁與新指令同時上線，舊指令照常可用。
3. 回滾：撤回部署即可，`internal_events` 留著不影響其他功能。

## Open Questions

（無）
