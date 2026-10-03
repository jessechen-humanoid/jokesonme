## Context

- 正式庫（2026-10-03 唯讀查詢）：`shows` 29 筆（6 special、23 other、0 monthly、0 筆有 `performance_date`）；`todos` 1 筆、`ideas` 1 則、`transactions` 186 筆全部掛在 `shows.id` 上。29 筆之中 7 筆是收支分類（看我笑話會員、會員與其他收支、共同基金支出、看我笑話頻道、商演／業配合作、小卡盲包 ×2），其餘 22 筆是演出或活動。
- 程式現況：`lib/shows.ts` 的 `listShows` 把整張表交給所有頁面；`components/idea-list.tsx` 每張卡一個 `<select>`；`components/todo-board.tsx` 的表單一個 `<select>`；`app/(app)/shows/page.tsx` 用「沒有日期或日期在今天之後」當「接下來」，所以 29 筆全在接下來；`lib/templates.ts` 的 `ensureTemplateTodos` 只對 `monthly` 且有日期的場次產生待辦，因此從未觸發。LINE 端 `lib/line/webhook.ts` 只處理 `message` 事件，`lib/line/api.ts` 的 `replyText` 只送純文字。
- 拍板（Jesse 2026-10-03，review 頁 `~/Documents/claude-html/2026-10/jokesonme-ia-review-2026-10-03.html`，不在 repo）：分家用「種類」欄；靈感一鍵歸位；首頁維持待辦、「企劃」改名「演出」；LINE 用快速回覆按鈕。
- 使用者：8 位成員（手機、LIFF 進入）、Jesse（電腦）、財務夥伴（只看財務）。
- 限制：不用語言模型、不發推播（只用 reply）、Supabase 免費版、Cloudflare Worker。
- 暫存中的 change `team-calendar-and-simple-commands` 會改群組指令文法（`/靈感`）；本 change 不碰指令解析，只在「靈感或待辦建立完成」之後掛按鈕。

## Goals / Non-Goals

**Goals:**

- 企劃面（演出、待辦、靈感）所有「選演出」的地方只出現演出，而且候選清單短：下一場第一，其餘按日期。
- 靈感從 LINE 進來後，一下就能歸到演出（LINE 內按鈕或網頁一鍵），收件匣（還沒歸位）會變短。
- 看一場演出時看得到它的待辦與靈感；在外面也看得到全部待辦，而且兩邊能互相點過去。
- 頁頭不再重複同一組數字，品牌字不佔第一屏。
- 月號補上日期後，既有模板待辦邏輯自然生效，不另寫。

**Non-Goals:**

- 不改財務頁的專案選單與任何收支、代墊、結算邏輯；財務頁繼續列全部 29 筆。
- 不改群組指令文法（`/`、`#`、回覆＋符號、tag 傑瓜）；文法收斂留給暫存中的 team-calendar change。
- 不做「演出」首頁 hub（Jesse 選方案 B，首頁維持待辦）。
- 不做 LINE 文字前綴歸位（`#10月 內容`），拍板選 A。
- 不補歷史演出的日期；歸檔由 Jesse 在編輯演出資訊裡自己標。
- 不拆表：`shows` 仍是一張表，財務的 `show_id` 外鍵不動。

## Decisions

### 演出表加 kind 欄而不拆表

`shows` 加 `kind text not null default 'performance' check (kind in ('performance','ledger'))`。migration 以名稱精確比對把 7 筆收支分類設成 `ledger`，其餘保持 `performance`。替代方案：拆成 `projects`（財務）與 `shows`（演出）兩張表——186 筆收支的外鍵要搬、對帳腳本要改、收益只是語意乾淨，否決。另一替代：不加欄位只靠日期過濾（Jesse 的方案 B）——規則隱性、未填日期的專場會消失，Jesse 選 A。

### 候選演出清單規則集中在一個純函式

新增 `lib/shows.ts` 的 `pickableShows(shows, today)`：輸入全部 shows 與台北今天，輸出 `{ next, upcoming, more }`。規則：只取 `kind = 'performance'` 且 `status = 'active'`；`upcoming` = 有日期且日期 ≥ 今天，依日期升冪；`next` = `upcoming[0]`；`more` = 其餘（沒有日期的、已演出的、`status = 'archived'` 的），依日期降冪、沒日期的排後。網頁的 ShowPicker 與 LINE 的快速回覆按鈕都呼叫這個函式，避免兩邊規則漂移。單元測試用三種資料形狀驗：全部沒日期、混合、全部已演出。

### 共用 ShowPicker 元件取代所有企劃面的 select

`components/show-picker.tsx` 改成「chip 列＋更多」的面板：第一顆是下一場（標「下一場」），接著 `upcoming` 其餘（最多 5 顆），最後一顆「更多…」展開 `more` 的清單（可捲動）；另有「不掛演出」選項。它是受控元件，輸出 `showId | null`，同時用在：靈感卡「其他…」面板、待辦表單的演出欄、未來任何需要選演出的表單。財務頁現在用的 `ShowPicker`（29 筆下拉，依 URL 切換專案）改名為 `components/finance-show-select.tsx`，行為不變。替代方案：在 `<select>` 裡只過濾選項——仍是下拉、在手機上要捲、無法突出下一場，否決。

### 靈感卡一鍵歸到下一場

靈感卡只保留：內容、作者、時間、`→ {下一場名稱}` 按鈕、「其他…」按鈕；點卡片內容進入編輯面板，面板內才有封存。沒有下一場（沒有任何未來演出）時，`→` 按鈕不出現，只剩「其他…」。歸位之後，在「還沒歸位」清單裡的卡片以樂觀更新離開列表。靈感分頁的 chip 改為「還沒歸位 N／全部／已封存」，取代「靈感庫／已封存」。

### 在演出頁建立的東西自動屬於該場

演出頁的 ＋（待辦與靈感）把 `show_id` 預填為該場，表單裡的 ShowPicker 預選該場但仍可改。全部待辦頁的群組標題（例如「10 月號」）成為連結到 `/shows/{id}`；「沒有掛演出」群組不連結。待辦分頁頁頭：移除三張統計卡，數字留在 chip（「我的 N／全部 N／未認領 N」），新增一行「下一場・還有 D 天／{名稱}・{M/D（週）}」連到演出頁；沒有下一場時這行顯示「還沒排下一場演出」並連到演出分頁。

### 演出分頁改名演出並依日期分組

底部導覽的 `/shows` 標籤由「企劃」改為「演出」（分頁順序維持 待辦｜靈感｜演出｜財務）。演出清單用 `pickableShows` 的分組：「接下來」= `upcoming`，「已演出／其他」= `more`；只列 `performance`。「編輯演出資訊」面板新增「已演出，歸檔」開關（寫 `status = 'archived'` 或 `'active'`）。新增演出表單的「類型」預設維持現狀，不增加 kind 欄位給使用者選：使用者建立的一律是演出；財務分類只能由 migration 或資料庫維護產生。

### 頁頭精簡規則

所有企劃面與財務面的標題卡：品牌字「看我笑話」縮為小字（13px、半透明），頁名為 `h1`。說明用法的副標（例如「群組裡打「#內容」就會存到這裡」）從頁頭移除，改放在空狀態文字裡。這條寫進 `mobile-first-ui` spec 讓之後的頁面照辦。

### LINE 快速回覆按鈕與 postback 歸位

`#` 與 `/` 的確認回覆改成帶 quick reply 的訊息：按鈕由 `pickableShows` 的 `next` 與 `upcoming` 取前 3 顆（label 用演出名稱去掉「看我笑話」前綴並截到 20 字），加第 4 顆「先放著」；沒有任何未來演出時不帶按鈕。按鈕是 postback action，`data` 為 `v=1&t=idea|todo&id=<uuid>&show=<uuid|none>`（≤ 300 字元）。webhook 新增 `postback` 事件分支：驗 `data` 格式，依 `t` 更新 `ideas.show_id` 或 `todos.show_id`，用 replyToken 回「已歸到「{演出名}」」或「好，先放在靈感庫」；`show=none` 只回覆不寫入；找不到 id（已刪除）回「這則已經不在了」。postback 事件也寫 `line_messages`？不寫：postback 沒有 message id，不進訊息表，但寫 audit（透過一般 db actor `line-bot`）。替代方案：文字前綴（方案 B）——要記格式，Jesse 選 A；兩者都做（方案 C）——未選。**前置實測**：官方文件已確認 quick reply 可用於群組且 LINE 不在同一則訊息之後保留按鈕；postback 事件在群組是否帶 `replyToken` 未從文件確認，第一個任務先用測試群組實測，若不帶 replyToken 則改為不回覆確認、只寫入。

### 財務面與企劃面的 listShows 分流

`listShows(actor)` 維持回傳全部（財務用）；新增 `listPerformances(actor)` 只回 `kind = 'performance'`，企劃面三個頁面與 LINE store 一律改用後者。這樣財務頁一行都不用改。

## Implementation Contract

**行為（上線後可觀察）：**

- 靈感分頁、待辦表單、演出頁、LINE 按鈕裡出現的演出，絕不包含「看我笑話會員」「共同基金支出」等 7 筆財務分類；財務頁的專案選單仍包含它們。
- 候選清單第一顆永遠是日期最近的未來演出；沒有未來演出時沒有「→ 下一場」按鈕，LINE 回覆也不帶按鈕。
- 群組打 `#讓觀眾投票` → 傑瓜回「已存進靈感庫，要歸到哪一場？」並帶最多 4 顆按鈕；按「10 月號」→ 該則靈感的 `show_id` 變成 10 月號，傑瓜回「已歸到「看我笑話 10 月號」」；按「先放著」→ 不寫入，回「好，先放在靈感庫」。`/買膠帶` 同樣流程，寫到 `todos.show_id`。
- 待辦分頁頁頭沒有統計卡；chip 帶數字；有一行「下一場」可點進演出頁；群組標題可點進演出頁。
- 演出分頁標籤顯示「演出」；清單分「接下來」與「已演出／其他」；編輯面板可歸檔。
- 月號建立或改成 `monthly` 並填日期後，模板待辦自動產生（既有行為，透過資料修正而生效）。

**資料形狀：**

- `shows.kind`：`'performance' | 'ledger'`，not null，預設 `performance`。
- `pickableShows(shows: Show[], today: string): { next: Show | null; upcoming: Show[]; more: Show[] }`，純函式、無 IO。
- postback `data`：`v=1&t=idea&id=<uuid>&show=<uuid>`；`show=none` 代表先放著。
- LINE 回覆訊息：`{ type: "text", text, quickReply: { items: [{ type: "action", action: { type: "postback", label, data, displayText } }] } }`；`replyMessage(replyToken, message)` 取代只送文字的 `replyText`，後者保留為薄包裝。

**失敗模式：**

- postback `data` 格式不符或版本不是 `v=1`：記 log、不寫入、不回覆（避免對舊按鈕亂回）。
- 目標靈感或待辦已刪除：回「這則已經不在了」。
- 快速回覆按鈕因群組有新訊息而消失：屬 LINE 行為，不處理；網頁「還沒歸位」接手。
- 若實測發現群組 postback 不帶 replyToken：寫入照做、略過回覆，並在 design 的 Open Questions 記下結論。

**驗收：**

- `npm test`（`node --test`）新增：`lib/shows.test.ts`（pickableShows 三種形狀）、`lib/line/webhook.test.ts` 新增 postback 分支與 quick reply 內容的案例、`lib/line/quick-reply.test.ts`（按鈕組成、無未來演出時不帶按鈕、label 截斷）。
- `npm run typecheck`、`npm run lint` 通過。
- 手動：在正式群組打 `#測試靈感` 看到按鈕並按下後，網頁該靈感出現在對應演出頁；375px 寬度各頁無橫向捲動。
- 資料：migration 後 `select kind, count(*) from shows group by 1` 得 `ledger 7、performance 22`；財務頁的專案選單仍 29 筆。

**範圍：** 範圍內：`platform/lib/shows.ts`、`platform/lib/line/*`、`platform/components/{show-picker,idea-list,todo-board,bottom-nav,show-editor}.tsx`、`platform/app/(app)/{todos,ideas,shows}/**`、`platform/app/globals.css`、新 migration、相關測試。範圍外：`platform/app/(app)/finance/**`、`platform/lib/finance/**`、指令解析 `lib/line/commands.ts`、模板邏輯 `lib/templates.ts`。

## Risks / Trade-offs

- [postback 在群組可能不帶 replyToken] → 第一個任務實測；不帶就只寫入不回覆，按鈕 `displayText` 仍會在群組顯示使用者按了什麼。
- [按鈕在群組下一則訊息後消失，忙碌時幾乎按不到] → 網頁「還沒歸位」清單一鍵歸位是主要路徑，LINE 按鈕是加速器；接受。
- [名稱比對設 `ledger` 若名稱日後改了] → migration 只跑一次且列出精確名稱，之後由資料庫維護；新增演出一律 `performance`。
- [`listShows` 與 `listPerformances` 兩個入口，之後有人用錯] → 企劃面只 import `listPerformances`，`listShows` 加註「財務用」；review 時 grep。
- [Jesse 沒補日期前，「接下來」是空的，首頁「下一場」顯示還沒排] → 上線當天 Jesse 先補 10～12 月號與專場日期（資料任務）。
- [靈感卡去掉封存按鈕，封存多一步] → 封存頻率低，換取卡片乾淨；可從編輯面板封存。

## Migration Plan

1. 合併程式但 `kind` 欄位先以 migration 上線：`npm run db:migrate`（0009），確認 `ledger 7、performance 22`。
2. 部署 Worker（`npm run cf:build && npm run cf:deploy`）。
3. Jesse 在演出分頁：把 10、11、12 月號改成類型「月號」並填日期（模板待辦隨之產生）、補專場日期、把已演出的場次歸檔。
4. 群組實測 `#` 與 `/` 的按鈕。
5. 回滾：Worker 回前一版即可；`kind` 欄位留著無害（舊程式不讀它）。

## Open Questions

- ~~群組 postback 事件是否帶 `replyToken`~~ → **已實測（2026-10-03，正式群組）**：Jesse 打 `#測試按鈕`、按「10 月號」，靈感由 `line-bot` 寫入 `show_id`，傑瓜回覆「已歸到「看我笑話 10 月號」」——群組 postback **有**帶 replyToken；LINE quota consumption 仍為 0。未做任何臨時程式改動（直接以正式功能實測）。
- 「年度大會｜看我畫大餅」算演出還是活動：預設 `performance`，Jesse 若要排除就歸檔。
