<!--
Each task delivers an observable behavior + verification target. File paths are locator context.
-->

## 1. GAS：代墊還款帳本（Advance reimbursement ledger storage / Add / Get）

- [x] 1.1 落地「雙帳本架構：成員結算記利潤、代墊還款記還款」決策——在 `gas/Code.gs` 新增 sheet 常數 `SHEET_NAMES.ADVANCE_REPAYMENTS = '代墊還款'`，並實作 `getAdvanceReimbursements()`：讀 `代墊還款` sheet 回 `{success:true,data:[{member,amount,date,notes}]}`，sheet 不存在時自動建表（表頭 成員/金額/日期/備註）回空陣列（對應「Advance reimbursement ledger storage」「Get advance reimbursement records」）。驗收：對部署後 GAS 發 `action=getAdvanceReimbursements`，HTTP 200 回傳陣列；首次呼叫後 sheet 已建立。

- [x] 1.2 實作 `addAdvanceReimbursement(payload)`：append 一列 `[member, amount, date, notes]` 到 `代墊還款`；amount ≤ 0 或無 member 時回 `{success:false,error:'成員和金額為必填'}`（對應「Add advance reimbursement record」）。驗收：以 member=柏文/amount=7665 POST 後 sheet 多一列；以 amount=0 POST 回必填錯誤、無新列。

- [x] 1.3 在 `gas/Code.gs` HTTP router 新增 `getAdvanceReimbursements`（GET 分支）與 `addAdvanceReimbursement`（POST 分支）兩個 case。驗收：兩個 action 都能被 router 正確分派、回傳對應結構。

## 2. GAS：結算回歸純利潤、移除自動偵測（Add settlement record / Historical advance settlement correction REMOVED）

- [x] 2.1 落地「結算回歸純利潤，移除「一起結清代墊」流程」決策——簡化 `addSettlement(payload)` 為只 append 純利潤列：移除 `includeAdvances` 拆分、移除掃描與標記代墊已結清的邏輯，payload 只認 `{member,amount,date,notes}`（對應「Add settlement record」MODIFIED）。驗收：以 member=兔子/amount=10000 呼叫，`成員結算` 只多一列 10000、無任何代墊交易被改狀態。

- [x] 2.2 落地「廢掉自動偵測修正（fixAdvanceSettlements / previewAdvanceFix）」決策——從 `gas/Code.gs` 移除 `fixAdvanceSettlements()`、`previewAdvanceFix()`、輔助函式 `_analyzeAdvanceSettlements` / `_classifyMember` / `_formatSettlementDate`（若僅供其使用），以及 router 中的 `fixAdvanceSettlements` / `previewAdvanceFix` case（對應 REMOVED：「Historical advance settlement correction」「Append-only historical advance settlement correction」「Advance settlement correction preview」——這三個 spec requirement 描述的後端機制隨函式移除一併廢除）。驗收：對 GAS 發 `action=previewAdvanceFix` 回「未知的 action」。

## 3. GAS：一次性歷史遷移（One-time historical advance ledger migration）

- [x] 3.1 落地「一次性歷史資料遷移（migrateAdvanceLedger）」決策——實作 `migrateAdvanceLedger()`：依 design 遷移計畫——刪除柏文 -15,745 與又又 -14,380 兩筆錯誤修正列、append 柏文 -7,665 與又又 -8,380 正確利潤校正列、保留芭樂 -1,600 與兔子 -6,000、植入 `代墊還款` 初始 4 筆（柏文 7,665/又又 8,380/芭樂 1,600/兔子 6,000，備註「歷史代墊還款」）。冪等：偵測到「歷史代墊還款」標記列則回 `already-migrated` 不動作（對應「One-time historical advance ledger migration」）。驗收：對測試副本執行後，`成員結算` 加總 柏文/又又/芭樂/兔子=30,000、4 月與 6 月原始列未被刪改、`代墊還款` 有 4 筆初始列。

- [x] 3.2 在 router 新增 `migrateAdvanceLedger`（POST）case，回傳 `{success,data:{settlementsAdjusted,reimbursementsSeeded,status}}`。驗收：第一次呼叫回 status `migrated`、第二次回 `already-migrated` 且 sheet 無變化（冪等 scenario）。

## 4. 前端 API 封裝（js/api.js）

- [x] 4.1 在 `js/api.js` 新增 `getAdvanceReimbursements()`、`addAdvanceReimbursement(data)`、`migrateAdvanceLedger()` 三個 wrapper；移除 `fixAdvanceSettlements()` 與 `previewAdvanceFix()` wrapper。驗收：analytics 頁載入無 console error；呼叫 `API.getAdvanceReimbursements()` 回陣列。

## 5. 前端報表改版（Member report columns；Per-member projected net earnings MODIFIED）

- [x] 5.1 落地「成員年度報表欄位改版」與「代墊未結清改用「總額 − 帳本」推導，不再讀交易狀態」決策——改 `js/analytics.js` 成員年度報表：欄位改為 成員 / 已收款淨利 / 未收款淨利 / 代墊未結清 / 代墊已結清 / 年度分配淨利（移除「需匯款金額」欄）。公式：代墊已結清=sum(代墊還款 該成員)、代墊總額=sum(收支紀錄 墊款人=該成員 不分狀態)、代墊未結清=代墊總額−代墊已結清；已收款淨利=sum(成員結算)；未收款淨利=年度分配淨利−已收款淨利（對應「Per-member projected net earnings」MODIFIED）。驗收：遷移後柏文列 已收款 30,000 / 代墊已結清 7,665 / 代墊未結清 8,080；又又列 30,000 / 8,380 / 6,000。

- [x] 5.2 代墊未結清 < 0（超還）時該欄套用警示樣式、數值照實顯示不 clamp。驗收：建構超還測試資料（代墊還款 > 代墊總額），該列代墊未結清顯示負值且為警示色。

- [x] 5.3 改 `js/analytics.js` 代墊總覽區（Unsettled advance payments overview）：已結清金額改讀 `代墊還款` 帳本加總、未結清=總計−已結清、總計=墊款人交易加總（對應「Unsettled advance payments overview」MODIFIED）。驗收：柏文顯示 總計 15,745 / 已結清 7,665 / 未結清 8,080。

## 6. 前端結算與還款入口（Settlement modal has no advance section）

- [x] 6.1 簡化 `js/analytics.js` 結算 modal：移除代墊區塊、「一起結清代墊」checkbox 與金額拆分顯示，欄位只剩 成員/金額/日期/備註，submit 只送純利潤（對應「Add settlement record」MODIFIED 的 no-advance-section scenario）。驗收：開新增結算 modal 選任一成員，皆無代墊區塊與 checkbox。

- [x] 6.2 移除 `js/analytics.js` 的「修正代墊帳」按鈕與 `showFixAdvanceModal()`；新增「新增代墊還款」按鈕與 modal（欄位 成員/金額/日期/備註，submit 呼叫 `API.addAdvanceReimbursement` 後重整報表）。驗收：報表區無「修正代墊帳」按鈕、有「新增代墊還款」按鈕；新增一筆還款後該成員代墊已結清增加、代墊未結清減少。落地 REMOVED：「Advance fix preview must precede execution in UI」——前端預覽確認流程隨「修正代墊帳」按鈕與 `showFixAdvanceModal()` 移除一併廢除。

## 7. 清理被取代的 change

- [x] 7.1 落地「處理被取代的 change」決策——將 `append-only-advance-settlement-fix`（applied 未 archive）drop 或標記 superseded，避免其 spec deltas 日後誤套。驗收：`spectra list --json` 與 `spectra list --parked --json` 不再將其列為待 archive 的 active change，或其目錄已移除。

## 8. 部署與生產遷移

- [ ] 8.1 GAS 部署：Apps Script editor → 管理部署作業 → 建立新版本 → 部署，確保含新 reimbursement 函式、`migrateAdvanceLedger`、簡化後 `addSettlement`，且已移除舊自動偵測。驗收：對部署 URL 發 `action=getAdvanceReimbursements` 回 200、發 `action=previewAdvanceFix` 回「未知的 action」。

- [ ] 8.2 前端部署：git commit（`gas/Code.gs`、`js/api.js`、`js/analytics.js`）並 push 到 `main`，等 GitHub Pages 自動部署。驗收：硬重新整理 analytics 頁，成員年度報表已是新欄位（代墊已結清、無需匯款金額、無修正代墊帳按鈕）。

- [ ] 8.3 生產遷移：先請 Jesse 另存 sheet 快照備援，再於 analytics 頁觸發 `migrateAdvanceLedger`（一次性按鈕或手動呼叫），完成後核對 Google Sheet 與報表。驗收：柏文 已收款 30,000 / 代墊已結清 7,665 / 代墊未結清 8,080；又又 30,000 / 8,380 / 6,000；4 月與 6 月手動結算原始列未被刪改；再次觸發回 `already-migrated`。
