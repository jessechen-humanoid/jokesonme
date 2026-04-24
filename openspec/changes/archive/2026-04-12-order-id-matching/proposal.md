## Why

目前應援匯入頁面使用「活動報名狀態 .xlsx」搭配三層模糊配對（姓名+時間、Email、手動指定）來對應撥款明細與活動。這導致大量未配對項目，因為付款人姓名可能不一致（英文名 vs 中文名）、5 分鐘時間窗口太嚴格、Email fallback 要求雙邊都有時間戳。

應援後台其實提供「票券訂單 CSV」和「周邊訂單 CSV」，這兩種檔案都有 `訂單編號` 欄位，與撥款明細的 `訂單編號` 完全相同，可以做精確配對，配對率趨近 100%。

## What Changes

- **右欄上傳區改為「票券與周邊訂單」**：從只接受活動報名狀態 .xlsx，改為接受票券訂單 CSV（`*票券訂單*.csv`）和周邊訂單 CSV（`*應援訂單*.csv`）
- **配對邏輯全面替換為訂單編號精確配對**：撥款明細的每筆 `訂單編號` 直接比對右欄 CSV 的 `訂單編號`，砍掉整套 name/time/email 三層模糊配對
- **活動對應 UI 改為「票券名稱 → 專案」批次對應**：配對完成後，提取所有不重複的票券名稱（來自票券訂單的 `票券名稱及數量`），讓使用者選一次對應到哪個專案，所有同票券名稱的訂單自動歸入
- **新增 CSV 解析能力**：右欄需支援 `.csv` 格式解析（除了既有的 `.xlsx`）
- **周邊商品分類**：配對到周邊訂單的撥款明細歸類為新的「周邊商品」類別（有別於「演出票房」）
- **移除舊的活動報名狀態相關邏輯**：`extractEventName`（從檔名提取活動名）、`eventRowsByName`/`eventRowsByEmail` 索引、三層配對演算法

## Non-Goals

- 不處理撥款明細的格式變更（左欄 .xlsx 解析邏輯不變）
- 不改動 Google Sheets API 或 GAS 端的 batch import 介面
- 不支援同時使用舊版活動報名狀態 .xlsx 和新版 CSV（完全取代）

## Capabilities

### New Capabilities

（無）

### Modified Capabilities

- `oen-cashflow-import`: 右欄檔案類型從活動報名狀態 .xlsx 改為票券/周邊訂單 CSV；配對邏輯從三層模糊配對改為訂單編號精確配對；活動對應 UI 從 event name mapping 改為票券名稱批次對應；新增周邊商品分類

## Impact

- 受影響的 spec：`oen-cashflow-import`（多個 requirement 需更新）
- 受影響的程式碼：
  - `import.html`：右欄上傳區 label、accept 屬性、section 結構
  - `js/import.js`：檔案解析、配對邏輯、mapping UI、dashboard 渲染、未配對項目處理
