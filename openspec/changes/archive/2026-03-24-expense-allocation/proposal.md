## Why

目前支出固定由 8 人平分，但實務上並非每筆支出都跟所有成員相關。收入已支援成員分配（checkbox 選擇參與人），支出也需要相同機制，讓使用者可以指定哪些人分擔該筆支出。

## What Changes

- 支出表單新增成員分擔 checkbox grid（與收入的分配 checkbox 共用元件），預設 8 人全選
- 支出交易的「排除成員」欄位開始寫入資料（原本僅收入使用）
- 財務分析中的支出分攤計算改為根據排除成員動態計算每人份額（取代固定除以 8）

## Capabilities

### New Capabilities

（無）

### Modified Capabilities

- `income-allocation`: 擴展為通用的成員分配機制，支出也使用相同的 checkbox grid 與排除成員欄位
- `transaction-management`: 支出表單新增成員分擔欄位，同時保留墊款人欄位
- `per-member-projected-earnings`: 支出分攤改為依排除成員動態計算，不再固定除以 8
- `financial-analytics`: 年度報表的每人支出分攤需反映成員分配

## Impact

- 受影響程式碼：`js/transaction.js`、`js/analytics.js`、`index.html`、`gas/Code.gs`
- 不需更動 Google Sheets 結構（排除成員欄位已存在）
- 向下相容：既有交易排除成員為空，等同全員分攤，行為不變
