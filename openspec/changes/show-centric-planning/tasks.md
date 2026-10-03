## 1. 前置實測與資料層

- [ ] 1.1 實測群組 postback：在測試用 LINE 群組對傑瓜送一則帶 postback quick reply 的 reply（可用臨時腳本或暫時改 `lib/line/api.ts` 回覆內容），按下按鈕後從 Worker log 確認 webhook 收到 `postback` 事件、其 `source.type` 為 `group`、是否帶 `replyToken`，把結論寫進 design.md 的 Open Questions（對應設計「LINE 快速回覆按鈕與 postback 歸位」的前置實測）。驗收：design.md 記錄實測日期與結果，臨時改動已還原（`git diff` 乾淨）。
- [x] 1.2 「演出表加 kind 欄而不拆表」：新增 `platform/supabase/migrations/0009_show_kind.sql`，為 `shows` 加 `kind text not null default 'performance'` 與 check 約束，並以精確名稱把 7 筆財務分類設為 `ledger`（spec show-management「Show kind」）。驗收：對本機測試庫跑 `npm run db:migrate` 後 `select kind, count(*) from shows group by 1` 得 `ledger 7、performance 22`；`npm run test:db` 通過；`supabase/test/` 新增一段 SQL 斷言 UI 新增的列預設是 `performance`。
- [x] 1.3 「候選演出清單規則集中在一個純函式」：在 `platform/lib/shows.ts` 新增 `pickableShows(shows, today)` 回傳 `{ next, upcoming, more }`，`Show` 型別加 `kind`，實作 spec show-picker「Pickable show list」的排序與過濾（ledger 永不出現、archived 進 more）。驗收：新增 `platform/lib/shows.test.ts` 覆蓋 spec 的三種資料形狀（全部沒日期、混合含 archived、只有 ledger），`npm test` 通過。
- [x] 1.4 「財務面與企劃面的 listShows 分流」：`platform/lib/shows.ts` 新增 `listPerformances(actor)` 只回 `kind = 'performance'`，`listShows` 加註「財務用」保留全部（spec show-management「Show list shared across pages」、spec show-picker「Finance pages keep the full list」）。驗收：`grep -rn "listShows(" platform/app platform/components platform/lib/line` 只剩 finance 底下的呼叫；收支紀錄頁的專案選單仍列 29 筆（手動）。[after: 1.3]

## 2. 共用選演出控制項

- [x] 2.1 「共用 ShowPicker 元件取代所有企劃面的 select」：把現在財務頁用的 `platform/components/show-picker.tsx`（依 URL 切換專案的 29 筆下拉）改名為 `platform/components/finance-show-select.tsx` 並更新 `app/(app)/finance/transactions/page.tsx` 的 import；新寫 `platform/components/show-picker.tsx` 為受控的 chip 面板（下一場第一並標「下一場」、upcoming 最多 5 顆、「更多…」展開 more、可選「不掛演出」），資料來自 `pickableShows`（spec show-picker「Web show picker control」）。驗收：`npm run typecheck`、`npm run lint` 通過；收支紀錄頁切換專案行為不變（手動）；375px 下面板無橫向捲動（手動量 `scrollWidth`）。[after: 1.4]

## 3. 靈感

- [x] 3.1 「靈感卡一鍵歸到下一場」：`platform/components/idea-list.tsx` 的卡片移除 `<select>` 與封存鈕，改為「→ {下一場名稱}」按鈕（沒有下一場時隱藏）與「其他…」（開啟 ShowPicker 面板）；點卡片文字進入編輯面板，面板內提供封存；歸位後離開目前清單用既有的樂觀更新（spec idea-library「Assign idea to a show」）。驗收：手動在「還沒歸位」按「→ 10 月號」後卡片立即消失並出現在該場演出頁；在沒有未來演出的資料下按鈕不出現；`npm run lint` 通過。[after: 2.1]
- [x] 3.2 靈感分頁三個檢視：`platform/app/(app)/ideas/page.tsx` 的 chip 改為「還沒歸位 N／全部／已封存」，「全部」顯示每則的演出名稱，`#` 用法說明只出現在「還沒歸位」的空狀態（spec idea-library「Idea library page」）。驗收：三個檢視各自列出正確集合（手動對照資料庫），頁頭沒有用法副標；`npm run typecheck` 通過。[after: 3.1]

## 4. 待辦與演出頁

- [x] 4.1 「頁頭精簡規則」與「Todo page header without duplicate numbers」：`platform/app/(app)/todos/page.tsx` 移除三張統計卡，chip 保留數字，新增「下一場・還有 D 天／{名稱}・{M/D（週）}」一行連到 `/shows/{id}`（沒有下一場時顯示「還沒排下一場演出」連到 `/shows`）；`platform/app/globals.css` 讓 `.brand` 在標題卡內縮為 13px 次要標籤、頁名為 h1，全站套用（spec mobile-first-ui「Page header economy」）。驗收：待辦頁 DOM 中同一個數字只出現一次（手動）；各頁標題卡 `.brand` 計算字級 ≤ 13px（`getComputedStyle`）；375px 無橫向捲動。[after: 1.4]
- [x] 4.2 「Show group header links to the show page」：`platform/components/todo-board.tsx` 的群組標題在有演出時渲染為 `<Link href="/shows/{id}">`，「沒有掛演出」維持純文字。驗收：點「10 月號」群組標題開啟該場演出頁（手動）；`npm run lint` 通過。
- [x] 4.3 「Todo show field uses the shared picker」與「在演出頁建立的東西自動屬於該場」：`platform/components/todo-board.tsx` 表單的演出欄改用 ShowPicker；`platform/app/(app)/shows/[id]/page.tsx` 的 ＋ 以 `initialShowId` 開啟待辦與靈感的新增面板並預選該場，`todos/actions.ts` 與 `ideas/actions.ts` 不需改寫入邏輯（仍讀 `show_id`）。驗收：從演出頁新增的待辦與靈感 `show_id` 為該場（手動查詢）；從待辦頁新增時面板第一顆 chip 是下一場。[after: 2.1]
- [x] 4.4 「演出分頁改名演出並依日期分組」：`platform/components/bottom-nav.tsx` 標籤「企劃」改「演出」；`platform/app/(app)/shows/page.tsx` 改用 `listPerformances` 與 `pickableShows` 分成「接下來」與「已演出／其他」；演出頁返回連結文字同步改為「‹ 演出」（spec show-planning-page「Monthly planning page」）。驗收：以 spec 的範例資料手動確認分組順序；財務分類不在清單中；`npm run typecheck` 通過。[after: 1.4]
- [x] 4.5 「Archive a show」：`platform/components/show-editor.tsx` 的編輯面板加「已演出，歸檔」開關，`platform/app/(app)/shows/actions.ts` 的 `updateShow` 寫入 `status` 為 `archived` 或 `active`；歸檔後離開「接下來」與下一場捷徑，仍在「更多」與財務選單。驗收：歸檔 6 月號後，待辦頁「下一場」與 LINE 按鈕不再出現它、財務頁仍可選（手動）；`npm test` 中 `pickableShows` 對 archived 的案例通過。[after: 4.4]

## 5. LINE 快速回覆與 postback

- [x] 5.1 「Quick-reply show buttons on confirmations」：`platform/lib/line/api.ts` 新增 `replyMessage(replyToken, message)`，`replyText` 改為其薄包裝；新增 `platform/lib/line/quick-reply.ts` 的純函式 `showQuickReply(kind, id, picked)` 依 `pickableShows` 組出最多 3 顆演出按鈕＋「先放著」，label 去掉「看我笑話 」前綴並截 20 字，data 為 `v=1&t=<idea|todo>&id=<uuid>&show=<uuid|none>`；沒有 upcoming 時回 null（spec line-group-capture「Hash command idea capture」的回覆文字一併更新為「已存進靈感庫，要歸到哪一場？」）。驗收：新增 `platform/lib/line/quick-reply.test.ts` 覆蓋 spec 的按鈕組成表（none／1 場／4 場）與 label 截斷；`npm test` 通過。[after: 1.3]
- [x] 5.2 webhook 送出按鈕：`platform/lib/line/webhook.ts` 的 `WebhookStore` 介面讓 `createIdea`／`createTodo` 回傳新列的 id，並新增 `pickable()` 取得候選演出；`todo`、`idea`、`todo-from-quote`、`idea-from-quote` 四個分支的確認回覆改為帶 quick reply 的訊息（`Reply` 型別改為接受訊息物件）；`platform/lib/line/store.ts` 對應實作（用 `listPerformances` 同一條規則）。驗收：`platform/lib/line/webhook.test.ts` 新增案例斷言四個分支的回覆帶正確按鈕、沒有 upcoming 時為純文字；`npm test` 通過。[after: 5.1]
- [ ] 5.3 「Postback assigns the idea or todo to a show」：`platform/lib/line/webhook.ts` 新增 `postback` 事件分支（只收已登記群組）：解析並驗證 `data`（版本不是 1 或格式不符 → log 後忽略、不回覆），`show=none` 只回覆不寫入，否則呼叫 store 的 `assignIdeaToShow`／`assignTodoToShow`（目標不存在回「這則已經不在了」），有 replyToken 才回覆「已歸到「{演出名}」」；postback 不寫 `line_messages`。驗收：`webhook.test.ts` 覆蓋成功歸位、先放著、目標已刪、壞資料四種情況；`npm test` 通過；正式群組實測一次 `#測試` → 按鈕 → 網頁該靈感出現在對應演出頁。[after: 5.2]

## 6. 收尾

- [ ] 6.1 部署與資料修正：`npm run db:migrate`（正式庫 0009）、`npm run cf:build && npm run cf:deploy`；Jesse 在演出分頁把 10～12 月號改為類型「月號」並填日期、補專場日期、歸檔已演出場次；確認月號的模板待辦自動產生（既有 `ensureTemplateTodos`）。驗收：正式庫 `select kind, count(*) from shows group by 1` 為 `ledger 7、performance 22`；10 月號的 `todos` 出現 23 筆 `source = 'template'`；待辦頁頭顯示正確的「下一場」。[after: 4.5] [after: 5.3] [after: 3.2]
