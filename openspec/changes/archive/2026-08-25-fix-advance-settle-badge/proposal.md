## Why

2026-06-05 的「代墊還款獨立帳本」重構（`d92be8c`）刻意移除了結算時回寫交易「結清狀態」欄的邏輯，改用「代墊總額 − 代墊還款帳本」推導。財務分析頁（analytics）已改吃推導值，數字正確；但收支紀錄頁（index）的交易清單 badge 仍讀交易表第 7 欄的單筆布林旗標，而「新增代墊還款」流程從不更新該欄。結果是：還款已登錄、analytics 顯示已結清，index 清單裡對應的代墊交易卻永遠顯示「未結清」，兩頁互相矛盾，使用者無法信任清單上的結清標示。

## What Changes

- 收支紀錄頁的結清 badge 改為**從「代墊還款」帳本推導**：以成員為單位，將該成員的代墊交易按日期由舊到新排序，用還款總額依序沖銷，逐筆得出「已結清／部分結清／未結清」三種狀態。
- **BREAKING（UI 行為）**：移除 index 上手動點擊 badge 切換結清狀態的功能（含 optimistic UI 與失敗 rollback）。badge 改為純顯示，唯一真相來源是代墊還款帳本。
- 資料載入配合調整：推導需要該成員**跨演出**的全部代墊交易，收支紀錄頁載入時改為抓全量交易與代墊還款紀錄，再依當前演出過濾渲染。
- 純前端變更：GAS（`gas/Code.gs`）不動、Google Sheet schema 不動、無需重新部署 Apps Script。交易表第 7 欄與 `updateTransaction` 的 settled 路徑保留為殘留欄位，index 不再讀寫。

## Capabilities

### New Capabilities

（無）

### Modified Capabilities

- `transaction-management`：「Track settlement status」需求整個改寫——結清狀態從「使用者手動切換的單筆布林旗標」改為「由代墊還款帳本推導的唯讀三態顯示（已結清／部分結清／未結清）」，移除手動切換與 optimistic UI 的需求。

## Impact

- Affected specs: `transaction-management`（modified）
- Affected code:
  - Modified: `js/transaction.js`（載入邏輯、badge 渲染、移除 toggle 事件）、`css/style.css`（badge 三態樣式）
  - New: （無）
  - Removed: （無檔案刪除；僅刪除 `js/transaction.js` 內的 toggle 事件處理程式碼）
- 不受影響：`gas/Code.gs`、`js/analytics.js`、`js/api.js`（`getAdvanceReimbursements` 既有 API 直接沿用）
