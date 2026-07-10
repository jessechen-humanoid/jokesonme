## Summary

把「代墊還款」從結算金額裡徹底拆出來，獨立成一本帳本；廢掉會算錯的自動偵測修正；重設計成員年度報表，讓「代墊已結清 + 代墊未結清 = 代墊總額」恆等式成立。

## Motivation

上一個 change `append-only-advance-settlement-fix` 用「掃描所有已結清代墊、從最大筆結算扣除」的自動偵測來修歷史資料。實際在 production 跑過後發現它**系統性地算錯**：

- 柏文：應扣 7,665（夾在結算裡的代墊還款），實際扣了 15,745（全部已結清代墊），已收款淨利顯示 21,920 而非 30,000
- 又又：應扣 8,380，實際扣了 14,380，已收款淨利顯示 24,000 而非 30,000

根因：代墊交易的「已結清」狀態無法反推「這筆代墊是否夾在某筆結算金額裡還的」。柏文墊了 15,745，但只有 7,665 是夾在 6 月結算裡還的，另外 8,080 根本還沒還給他——自動偵測把「還沒還的代墊」也當成「已從結算扣除」去扣，於是利潤被吃掉、欠款被藏起來。

芭樂、兔子剛好「代墊全額都夾在結算裡還清」所以歪打正著對了；柏文、又又只還了部分代墊就爆掉。這證明自動偵測這條路本質不可靠，必須換架構。

## Proposed Solution

採「雙帳本」架構（討論中的 Option B）：

1. **新增 `代墊還款` 工作表**：append-only 帳本，記錄「某成員某次被還了多少代墊」。欄位：成員 / 金額 / 日期 / 備註。
2. **`成員結算` 回歸純利潤**：結算金額只記利潤分配，不再夾帶代墊還款。移除「一起結清代墊」的 modal 流程與金額拆分邏輯。
3. **廢掉自動偵測修正**：移除 `fixAdvanceSettlements()` / `previewAdvanceFix()` 與「修正代墊帳」按鈕。這套機制是本次災難的源頭。
4. **報表改用帳本推導**：
   - `代墊總額` = 收支紀錄中該成員所有「墊款人」交易金額加總（不分狀態）
   - `代墊已結清` = `代墊還款` 帳本中該成員的還款加總
   - `代墊未結清` = 代墊總額 − 代墊已結清
   - 恆等式：代墊已結清 + 代墊未結清 = 代墊總額
5. **成員年度報表欄位改版**：把「需匯款金額」欄改成「代墊已結清」，與既有的「代墊未結清」並列。
6. **一次性歷史資料遷移**：把 production 被自動偵測改錯的資料導回正確狀態（詳見 design.md 的遷移計畫）。

## Non-Goals

- 不支援「部分代墊結清」對應到單筆代墊交易（代墊還款記總額，不綁定特定交易列）
- 不改 `收支紀錄` schema，也不再依賴代墊交易的「結清狀態」欄位來計算報表（該欄位保留但報表不再讀它算代墊未結清）
- 不改 `年度分配淨利`（per-member-projected-earnings）的計算邏輯本身，只動報表呈現欄位
- 不處理「代墊已結清 > 代墊總額」（超還）的自動修正，只在報表顯示警示
- 不重新設計結算的多期分期邏輯

## Alternatives Considered

- **Option A：逐筆翻代墊交易狀態**：把「還沒還」的代墊交易狀態改回未結清，報表用狀態算。否決——部分還款無法乾淨對應到單筆交易（柏文 7,665 對應哪幾筆毫無意義），且沿用會出錯的狀態機制。
- **沿用並修補自動偵測**：在 `fixAdvanceSettlements` 加更多啟發式判斷。否決——「已結清」狀態根本不帶「是否夾在結算裡」的資訊，再多啟發式都是猜。

## Impact

- Affected specs:
  - New: `advance-reimbursement-ledger`
  - Modified: `member-settlement`（結算回歸純利潤、移除自動偵測修正）、`per-member-projected-earnings`（報表欄位改版）、`financial-analytics`（代墊總覽的已結清改用帳本）
- Affected code:
  - Modified: `gas/Code.gs` — 新增 `代墊還款` sheet 常數、`getAdvanceReimbursements()`、`addAdvanceReimbursement()`、一次性遷移函式 `migrateAdvanceLedger()`；移除 `fixAdvanceSettlements()` / `previewAdvanceFix()` 與其 action 路由；簡化 `addSettlement()` 回純利潤
  - Modified: `js/api.js` — 新增 `getAdvanceReimbursements()` / `addAdvanceReimbursement()` wrapper；移除 `fixAdvanceSettlements()` / `previewAdvanceFix()` wrapper
  - Modified: `js/analytics.js` — 成員年度報表欄位與公式改版；移除「修正代墊帳」按鈕與 `showFixAdvanceModal()`；新增「新增代墊還款」入口；簡化結算 modal
  - Modified: `openspec/specs/member-settlement/spec.md`、`openspec/specs/per-member-projected-earnings/spec.md`、`openspec/specs/financial-analytics/spec.md`（透過 delta）
- Superseded change: `append-only-advance-settlement-fix`（applied 但未 archive）——本 change 取代其方向，需在實作中將其 drop 或標記為 superseded
- Production data：需執行一次性遷移，把柏文 / 又又 / 芭樂 / 兔子的資料導回正確狀態
