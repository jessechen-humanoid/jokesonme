## Why

平台的靈感、待辦、企劃三個分頁都要「選演出」，而每個選單都列 29 筆，是因為 `shows` 表把 22 場真正的演出和 7 筆財務分類（會員、頻道、周邊、共同基金）裝在一起，而且 29 筆沒有一筆有演出日期、沒有一筆是 `monthly`。結果是：企劃頁把 29 筆全算成「接下來」、月號模板待辦從未自動產生、靈感要歸到演出得在 29 筆裡捲。平台剛切換（正式庫 2026-10-03：待辦 1 筆、靈感 1 則、收支 186 筆全掛在 shows 上），現在調整結構對企劃資料零成本，但財務資料不能動。Jesse 在 2026-10-03 的資訊架構 review 拍板了四題（分家方案 A、靈感一鍵歸位、首頁維持待辦、LINE 快速回覆按鈕）。

## What Changes

- `shows` 加「種類」欄 `kind`：`performance`（演出）或 `ledger`（財務分類）。財務頁照舊看全部；演出、待辦、靈感只列 `performance`。既有 7 筆財務分類由 migration 標成 `ledger`，其餘預設 `performance`。
- 「選演出」統一成一個共用控制項：下一場固定第一，再列接下來有日期的演出，已演出或已歸檔的收進「更多」。靈感卡、待辦表單、演出頁都用它，不再出現 29 筆下拉。
- 靈感：卡片只留內容、作者、一顆「→ 下一場」和「其他…」；靈感分頁的 chip 改為「還沒歸位／全部／已封存」。歸位後卡片離開「還沒歸位」。
- 演出頁（原「企劃」分頁改名「演出」）：清單依演出日分「接下來」與「已演出」；演出可標記「已演出／歸檔」；在演出頁按 ＋ 新增的待辦或靈感自動掛該場。月號改回 `monthly` 類型並補演出日後，既有的模板待辦邏輯會開始生效（程式不改）。
- 待辦分頁：首頁維持待辦；頁頭移除三張統計卡（數字只留在 chip），改成一行「下一場」可點進演出頁；群組標題可點進該場演出頁。
- 全站頁頭：品牌字縮小、頁名成為標題；說明用法的副標只在空狀態出現。
- LINE：`#靈感` 與 `/待辦` 的確認回覆帶快速回覆按鈕（下一場、再下一場、其他有日期的演出、先放著，最多 4 顆）；按下後以 postback 事件把該則靈感或待辦掛到演出，並回覆確認。仍只用免費的 reply，不發推播，不用語言模型。
- 不動：財務頁的專案選單（財務本來就要看全部）、收支資料、代墊與結算邏輯。

## Capabilities

### New Capabilities

- `show-picker`: 共用的「選演出」控制項與候選清單規則（下一場第一、只列接下來的演出、已演出收「更多」），網頁與 LINE 快速回覆共用同一條規則

### Modified Capabilities

- `show-management`: 演出加 `kind`（演出／財務分類）；「共用一份清單」改為財務看全部、企劃面只看演出；演出可歸檔
- `idea-library`: 靈感分頁改為「還沒歸位／全部／已封存」，歸位改為一鍵到下一場或從候選清單挑；卡片控制項精簡
- `todo-board`: 頁頭去重（移除統計卡、加「下一場」一行）、群組標題連到演出頁、待辦表單的演出欄改用 show-picker
- `show-planning-page`: 分頁改名「演出」，清單分接下來／已演出，演出頁新增的待辦與靈感預設掛該場
- `line-group-capture`: `#`／`/` 的確認回覆帶快速回覆按鈕，新增 postback 事件處理把靈感或待辦掛到演出
- `mobile-first-ui`: 頁頭規範：品牌字縮小、頁名為標題、用法副標只在空狀態出現

## Impact

- 資料庫：platform/supabase/migrations/0009_show_kind.sql（`shows.kind` 欄、7 筆財務分類標為 `ledger`、`line_messages` 之外不動）；靈感與待辦表不改結構
- 程式：platform/lib/shows.ts（kind、候選清單規則）、platform/components/show-picker.tsx（改成共用控制項；財務頁的下拉另留）、platform/components/idea-list.tsx、platform/components/todo-board.tsx、platform/components/bottom-nav.tsx、platform/app/(app)/todos/page.tsx、platform/app/(app)/ideas/page.tsx、platform/app/(app)/shows/page.tsx、platform/app/(app)/shows/[id]/page.tsx、platform/app/(app)/shows/actions.ts、platform/lib/line/webhook.ts、platform/lib/line/store.ts、platform/lib/line/api.ts、platform/app/api/line/webhook/route.ts、platform/app/globals.css
- 外部：LINE Messaging API 的 quick reply 與 postback 事件（官方文件確認 quick reply 可用於群組；postback 在群組是否帶 replyToken 需在第一個任務實測）
- 相關的暫存 change：team-calendar-and-simple-commands（暫存中）會改群組指令文法；本 change 只在「建立靈感／待辦之後」掛按鈕，不改指令解析，兩者不衝突
- 資料工作（Jesse）：為接下來的月號與專場補演出日、把已演出的場次歸檔；分法以 review 頁的 22／7 為準
