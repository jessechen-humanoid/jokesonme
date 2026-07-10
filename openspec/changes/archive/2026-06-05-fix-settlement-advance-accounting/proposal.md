## Why

結算時，系統將整筆匯款金額全數記為「已收款淨利」，但實際上匯款中可能包含代墊還款部分。代墊還款不屬於利潤分配，不應計入 `已收款淨利`，導致 `未收款淨利` 被低估、各成員剩餘應收金額顯示相同（不符實際）。

## What Changes

- **結算 modal 新增代墊顯示**：選擇成員後，若該成員有未結清代墊，顯示代墊金額並提供「一起結清代墊」勾選項
- **匯款金額語意調整**：使用者輸入「總匯款金額」（含代墊還款），系統自動拆分為「利潤結算」與「代墊還款」兩部分，settlement 記錄僅儲存利潤結算金額
- **代墊自動結清**：勾選「一起結清代墊」後，submit 時一次清除該成員所有未結清代墊交易
- **歷史資料修正工具**：提供 GAS 函式 `fixAdvanceSettlements()`，掃描已結清但未從 settlement 金額中扣除代墊的歷史紀錄，並自動修正 settlement 金額

## Non-Goals

- 不支援只結清「部分代墊」，一律全清
- 不支援負數 settlement 紀錄
- 不修改代墊交易的儲存結構

## Capabilities

### New Capabilities

（無新 capability）

### Modified Capabilities

- `member-settlement`: 結算金額的語意從「總匯款」調整為「利潤結算部分」；新增代墊顯示與一起結清功能；新增歷史修正工具

## Impact

- Affected specs: `member-settlement`
- Affected code:
  - `js/analytics.js` — 結算 modal UI 與 `submitSettlement` 邏輯
  - `gas/Code.gs` — `addSettlement()` 拆分金額邏輯、新增 `fixAdvanceSettlements()` 函式
