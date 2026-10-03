## 1. 資料與日曆核心

- [x] 1.1 新增 0010 migration 建立 `internal_events`（Internal events：日期、選填時間、標題、備註、建立者、軟刪除，掛 audit trigger、RLS 開、只給 service_role、無 DELETE／TRUNCATE）；驗證：`npm run test:db` 新增測試涵蓋無 actor 被拒、軟刪除留 audit、anon 讀不到，並 `npm run db:migrate` 套用正式庫後跑 `scripts/db-check.sql` 無缺漏
- [x] 1.2 依「自己寫最小的 iCal 解析」實作 `platform/lib/calendar/ics.ts`，滿足 Read-only public show calendar sync 的時間轉換與重複展開；驗證：單元測試涵蓋 spec 時間轉換範例表、TZID、整天、WEEKLY＋COUNT／UNTIL、EXDATE，並以 2026-10-03 抓下的公開 iCal 作 fixture 解析出 38 筆
- [x] 1.3 依「三層資料在伺服器合併成每日清單」實作 `buildDays`，合併演出、內部行程、待辦並轉台北時間排序；驗證：單元測試以固定資料驗每日項目與順序 [after: 1.2]
- [x] 1.4 依「公開日曆快取與最後一次成功副本」實作抓取（快取 600 秒、成功存副本、失敗用副本並回傳抓取時間）；驗證：單元測試以假 fetch 測成功、失敗有副本、失敗無副本三種結果 [after: 1.2, 1.1]

## 2. 行事曆頁

- [x] 2.1 實作 Calendar page with three layers（月格＋當日清單、三層樣式、導覽新增「行事曆」、finance_partner 不可進）；驗證：本機 375px 與 1280px 截圖檢查、`document.documentElement.scrollWidth` 等於視窗寬、finance_partner 開頁被導走 [after: 1.3, 1.4]
- [x] 2.2 行事曆頁的內部行程新增／編輯／刪除（Internal events 網頁操作，寫入以本人為 actor）；驗證：以測試帳號實際新增、編輯、刪除一筆，`audit_log` 有三筆紀錄，測完清除 [after: 2.1]

## 3. 群組指令與傑瓜

- [x] 3.1 依「指令文法：/ ＋ 類型詞」改寫 `parseCommand`，滿足 Slash command todo creation 與 Slash event creation 的範例表（年份規則、HH:MM、類型詞邊界）；驗證：單元測試逐列涵蓋兩張範例表，原有 `#` 與回覆測試維持通過
- [x] 3.2 webhook 接上 `/行程`（建立內部行程＋回覆實際日期）、`/靈感`、`/說明` 與新的 Command usage reply 小抄；store 新增建立行程函式（依「動作函式共用、預留自然語言入口」）；驗證：webhook 單元測試涵蓋三種指令與無效日期回小抄、grep 確認沒有 push API [after: 3.1, 1.1]
- [x] 3.3 Mention summary reply 加上「接下來 14 天」重要日子（共用 `buildDays`）；驗證：summary 單元測試涵蓋 spec 範例表三列 [after: 1.3, 1.4]

## 4. 上線

- [ ] 4.1 部署並在正式環境確認 iCal 讀得到演出、行事曆頁正常；Jesse 在群組實測 `/行程`、`/說明`、`/靈感`、tag 傑瓜各一次；驗證：Jesse 確認，`internal_events` 與 `ideas` 有對應列、LINE quota consumption 仍為 0 [after: 2.2, 3.2, 3.3]
