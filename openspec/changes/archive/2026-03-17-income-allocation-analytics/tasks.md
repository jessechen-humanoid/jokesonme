## 0. 密碼門 (D6: 密碼門機制, Password gate for all pages)

- [x] 0.1 更新 `js/shared.js`：新增 `checkAuth()` 函式，檢查 `sessionStorage.getItem('authenticated')`，未驗證時建立全螢幕 overlay（密碼輸入框 + 送出按鈕），正確密碼 `joke0321` 驗證後存入 sessionStorage 並移除 overlay，錯誤密碼顯示提示
- [x] 0.2 更新 `index.html`、`checklist.html`、`analytics.html`：在各頁面 script 初始化最前面呼叫 `checkAuth()`
- [x] 0.3 更新 `css/style.css`：密碼門 overlay 樣式（全螢幕 fixed、z-index 最高、配合 Liquid Glass 風格）

## 1. Google Sheets 資料結構更新 (D1: 排除成員儲存格式, Google Sheets transaction structure)

- [x] 1.1 更新 `gas/Code.gs`：「收支紀錄」表新增第 9 欄「排除成員」，更新 `setupSheets` headers 為 9 欄，更新 `addTransaction` 接收並寫入 excludedMembers 欄位
- [x] 1.2 更新 `gas/Code.gs`：`getTransactions` 讀取第 9 欄 excludedMembers 並回傳，`updateTransaction` 支援更新 excludedMembers 欄位
- [x] 1.3 更新 `js/api.js`：addTransaction 與 updateTransaction 傳送 excludedMembers 參數

## 2. 收入分配 UI (D2: UI 欄位隨收支類型切換, Income member allocation, Record transaction by show)

- [x] 2.1 更新 `js/shared.js`：新增 `createMemberCheckboxGrid(id, excludedMembers)` 函式，渲染 8 人 checkbox grid（預設全勾），回傳排除成員陣列
- [x] 2.2 更新 `index.html`：新增收入分配 checkbox 容器 `tx-allocation-container`，預設隱藏
- [x] 2.3 更新 `js/transaction.js`：收支 toggle 切換時，收入模式隱藏墊款人、顯示 checkbox grid；支出模式反之。submitTransaction 時組裝 excludedMembers
- [x] 2.4 更新 `js/transaction.js`：編輯收入交易時（startEdit），還原 checkbox grid 的勾選狀態
- [x] 2.5 更新 `css/style.css`：checkbox grid 樣式（2×4 或 4×2 排列，配合 Liquid Glass 風格）

## 3. 收支明細表合併欄 (D3: 明細表合併顯示, View transactions by show)

- [x] 3.1 更新 `js/transaction.js`：明細表欄位從「墊款人」改為「分配/墊款」，收入顯示「全員」或「N/8 人」（含 hover tooltip），支出顯示墊款人或「—」
- [x] 3.2 更新 `css/style.css`：hover tooltip 樣式

## 4. 財務分析永遠顯示報表 (D5: 財務分析無資料時行為, Analytics always render reports)

- [x] 4.1 更新 `js/analytics.js`：移除 `transactions.length === 0` 的 early return，所有 render 函式在空資料時以 0 值正常渲染

## 5. 成員年度預估淨收入報表 (D4: 成員年度預估淨收入公式, Per-member projected net earnings)

- [x] 5.1 更新 `js/analytics.js`：新增 `renderMemberEarnings(transactions, el)` 函式，計算每人預估淨收入（分配收入 - 總支出÷8），渲染為 8 人表格
- [x] 5.2 更新 `analytics.html`：新增 `member-earnings` 容器 div
- [x] 5.3 更新 `js/analytics.js`：在 `loadAnalytics` 中呼叫 `renderMemberEarnings`

## 6. 部署與驗證

- [x] 6.1 重新部署 Google Apps Script Web App（含排除成員欄位）並更新 Google Sheet headers
- [x] 6.2 推送前端至 GitHub Pages
- [x] 6.3 端對端驗證：新增收入（全員/部分分配）、編輯收入、明細顯示、財務分析報表、成員預估收入、密碼門
