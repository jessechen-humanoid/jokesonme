## Problem

「成員年度報表」中，部分成員（已確認 又又 / 兔子，可能還有其他人）的「已收款淨利」顯示偏高、「未收款淨利」與「需匯款金額」偏低。

具體症狀：歷史 `成員結算` 紀錄中，某些匯款的金額把「代墊還款」部分一併寫入結算金額（例：實際匯出 20,000 = 15,000 利潤 + 5,000 代墊還款，但整筆 20,000 都被當作利潤結算寫入）。這違反「代墊還款不屬於利潤分配」的會計語意，導致前端公式 `已收款淨利 = sum(成員結算)` 被高估。

## Root Cause

歷史成因：早期的 `addSettlement()` 沒有區分「總匯款」與「利潤結算」，所有金額一律全數寫入 `成員結算`。後來的 `fix-settlement-advance-accounting` change 雖然修正了**新發 settlement** 的行為（已正確扣除代墊），但歷史資料的修正函式 `fixAdvanceSettlements()` 採用 **in-place mutation** ——直接把舊那筆 20,000 改成 15,000——並且該函式從未實際在 Google Sheet 上被執行過。

兩個本次要解決的問題：

1. **歷史修正函式設計違反「append-only」原則**：直接修改既有結算紀錄金額，無審計痕跡，無法回滾。
2. **歷史錯誤資料尚未被修正**：又又 / 兔子（以及可能所有人）的舊資料仍處於錯誤狀態。

## Proposed Solution

採 **append-only 修正策略** 替換現行 in-place 修正：

1. **重寫 `fixAdvanceSettlements()` 為 append-only**：不再修改 `成員結算` 任何既有列；改為對每位有「已結清代墊」但其結算紀錄未扣除代墊的成員，新增一筆負數修正紀錄到 `成員結算`。修正紀錄的 `備註` 欄位固定為「代墊還款修正」字串，作為 idempotency marker。
2. **新增 `previewAdvanceFix()` dry-run 函式**：掃描全成員，回傳每位成員「歷史結算總額 / 已結清代墊總額 / 將新增修正金額 / 跳過原因（若有）」的預覽資料，**不寫入 sheet**。
3. **前端先預覽後寫入流程**：`showFixAdvanceModal()` 點下後先呼叫 `previewAdvanceFix()`，以表格呈現全 8 位成員的修正預覽；使用者按「確認執行」才呼叫 `fixAdvanceSettlements()` 實際寫入。
4. **掃描範圍涵蓋全 8 位成員**：函式內部本來就是 group by `advancedBy` 欄位掃全表，本次只需確保預覽 UI 顯示全成員（即使某成員無需修正也列出，標示「無需修正」）。

修正紀錄細節：

- **日期**：取該成員「金額最大的既有 settlement」的日期（沿用原本 `fixAdvanceSettlements` 找最大筆 settlement 來扣減的對應邏輯，只是寫入方式從 in-place 改成 append）
- **金額**：取「已結清代墊總額」的負數（例：兔子代墊 5,000 已結清 → 新增一筆 -5,000）
- **備註**：固定「代墊還款修正」
- **冪等性**：執行前掃描既有 `成員結算` 紀錄中備註為「代墊還款修正」的成員，這些成員跳過（已修正過）
- **異常情境**：若某成員「已結清代墊」總額 > 其所有結算紀錄總額（含正負）→ 預覽顯示 warning、跳過該成員、不寫入修正紀錄

## Non-Goals

- 不修改 `addSettlement()` 行為（新發 settlement 的「總匯款 − 代墊 = 利潤結算」邏輯已正確）
- 不修改 `收支紀錄` 表 schema 或 `狀態` 欄位的 in-place 更新行為（狀態 flag 從「未結清」改「已結清」屬狀態更新，不算歷史資料變更）
- 不支援「部分代墊結清」（沿用既有「一律全清」設計）
- 不 archive 既有的 `fix-settlement-advance-accounting` change（保留作為歷史紀錄；本 change 是其後續修正）
- 不處理任何「已修正過但修正錯誤」的回滾情境（idempotency marker 確保不會重複修正即可）

## Success Criteria

驗收條件（部署 + 執行修正後，在 analytics 頁面觀察）：

1. **公式驗證**：對任何一位成員 M，下列恆等式成立：
   `M.已收款淨利 = sum(成員結算 表中 member = M 的所有金額紀錄，含正數與負數修正)`
2. **修正後資料正確**：又又 / 兔子（及任何其他被影響的成員）的「已收款淨利」反映「實際分配的利潤」而非「總匯款金額」
3. **既有資料保留**：執行修正後，`成員結算` 表中**沒有任何既有列的金額被修改**；所有修正都以新增列形式存在，備註為「代墊還款修正」
4. **冪等性**：重複點「修正代墊帳」按鈕，第二次預覽顯示所有成員「無需修正」，不會重複寫入負數紀錄
5. **Dry-run 預覽**：點按鈕後跳出預覽彈窗，列出全 8 位成員的修正明細（即使無需修正也列出），按「確認執行」才寫入
6. **異常處理**：若任何成員「已結清代墊」> 結算總額，預覽該行顯示 warning 並標示「跳過，原因：代墊金額超過結算總額」

## Impact

- Affected specs: `member-settlement`（MODIFIED Requirement: Historical advance settlement correction）
- Affected code:
  - Modified: `gas/Code.gs` — 重寫 `fixAdvanceSettlements(payload)`；新增 `previewAdvanceFix(payload)`；在 HTTP POST action router 新增 `previewAdvanceFix` 入口
  - Modified: `js/analytics.js` — `showFixAdvanceModal()` 改為先呼叫 dry-run preview 再渲染確認彈窗；`runFixAdvance()`（或同等函式）改為在使用者確認後才呼叫 `fixAdvanceSettlements`
  - Modified: `openspec/specs/member-settlement/spec.md`（透過 delta 套用）
- Deployment：
  - GAS 改完需在 Apps Script editor 操作「管理部署作業 → 建立新版本 → 部署」
  - 前端改完需 git commit + push to `main`，由 GitHub Pages auto-deploy
