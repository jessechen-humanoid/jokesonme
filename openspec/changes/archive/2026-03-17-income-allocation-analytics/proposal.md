## Why

目前收入和支出共用「墊款人」欄位，但收入的語意完全不同——收入需要的是「分配給哪些成員」，而非誰代墊。此外，財務分析頁在沒有資料時顯示空白狀態，無法讓團隊一眼看到完整報表結構。團隊也需要知道「每個人今年預計能賺多少」來做個人財務規劃。同時，由於涉及財務隱私，所有頁面需要密碼保護，防止未授權瀏覽。

## What Changes

1. **收入分配機制**：收入時，墊款人欄位替換為 8 人 checkbox（預設全勾），取消勾選的人不參與該筆收入分配。Google Sheet 新增「排除成員」欄位存逗號分隔名字。
2. **收支明細合併欄**：表格中墊款人與收入分配合併為同一欄——收入顯示「全員」或「N/8 人」（hover 顯示名單），支出顯示墊款人。
3. **財務分析永遠顯示報表**：移除空白狀態，所有報表框架在無資料時以 0 值呈現。
4. **成員年度預估淨收入**：新報表區塊，計算每人的預估淨收入（分配到的收入總和 - 總支出÷8）。
5. **密碼門**：所有頁面載入時檢查 sessionStorage，未驗證則顯示密碼輸入 overlay，輸入正確密碼後存入 sessionStorage，關閉瀏覽器後自動失效。

## Capabilities

### New Capabilities

- `income-allocation`: 收入交易支援多成員分配 checkbox，預設全員，可排除特定成員
- `per-member-projected-earnings`: 財務分析頁顯示每位成員的年度預估淨收入
- `password-gate`: 前端密碼門，使用 sessionStorage 做 session-level 驗證

### Modified Capabilities

- `transaction-management`: 收入表單改為 checkbox 選擇分配對象，明細表合併顯示分配/墊款資訊
- `financial-analytics`: 移除空白狀態，無資料時顯示 0 值報表
- `google-sheets-api`: 收支紀錄表新增「排除成員」欄位（第 9 欄）

## Impact

- Affected specs: `transaction-management`, `financial-analytics`, `google-sheets-api`
- Affected code: `gas/Code.gs`, `js/transaction.js`, `js/analytics.js`, `js/shared.js`, `index.html`, `checklist.html`, `analytics.html`, `css/style.css`
