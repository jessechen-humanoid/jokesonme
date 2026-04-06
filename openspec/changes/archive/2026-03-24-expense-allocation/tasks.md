## 1. UI：支出表單同時顯示墊款人與分擔成員

- [x] 1.1 修改 `toggleAllocationFields()`，支出模式下同時顯示墊款人下拉選單和 income member allocation checkbox grid
- [x] 1.2 修改 `index.html`，確保支出模式下 allocation container 有正確的 DOM 結構（record transaction by show）

## 2. 儲存：支出也寫入排除成員

- [x] 2.1 修改 `saveTransaction()` 中的 `excludedMembers` 取值邏輯，不分收支都呼叫 `getExcludedMembers()`（record transaction by show）
- [x] 2.2 修改編輯交易時也載入支出的排除成員到 checkbox grid

## 3. 交易列表：支出也顯示分擔資訊

- [x] 3.1 修改交易列表的「分擔/墊款」欄，支出也顯示分擔人數和墊款人（view transactions by show）

## 4. 分析：支出分攤改為動態計算

- [x] 4.1 修改 `analytics.js` 的支出分攤邏輯，改為逐筆讀取 `excludedMembers` 計算每人份額（per-member projected net earnings）
- [x] 4.2 驗證年度報表的每人支出分攤正確反映成員分配（per-show profit and loss）
