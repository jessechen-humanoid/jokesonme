## 1. 右欄上傳區改造

- [x] 1.1 修改 `import.html` 右欄：實作「Upload cashflow and event files」規格變更 — label 改為「票券與周邊訂單」，hint 改為「從應援後台下載票券訂單及周邊訂單 CSV」，accept 屬性改為 `.csv`，input id 改為 `order-input`
- [x] 1.2 在 `js/import.js` 新增 `parseCsv(file)` 函式，使用 SheetJS 的 `XLSX.read` 解析 CSV（SheetJS 本身支援 CSV），回傳 rows 陣列
- [x] 1.3 將 `eventFiles` state 改為 `orderFiles`，結構改為 `[{ name, orderType: 'ticket'|'merchandise', rows }]`。根據檔名判斷類型：含「票券訂單」→ ticket，含「應援訂單」→ merchandise
- [x] 1.4 改寫 `handleEventFile` 為 `handleOrderFile(file)`：接受 `.csv`，呼叫 `parseCsv`，根據檔名判斷 orderType，push 到 `orderFiles`
- [x] 1.5 實作「Upload status visibility」規格變更 — 更新 `renderUploadStatus()`：order 檔案顯示 🎫（ticket）或 🛍️（merchandise）圖示、檔名、筆數、移除按鈕
- [x] 1.6 更新 `setupUploadZones()` 右欄的 drop handler：只接受 `.csv` 檔案（取代原本的 `.xlsx` 過濾）

## 2. 訂單編號精確配對邏輯

- [x] 2.1 實作「Order ID matching for purchases」— 新增 `buildOrderIndex(orderFiles)` 函式：將所有 orderFiles 的 rows 建立以 `訂單編號` 為 key 的 Map，value 包含 `{ orderType, itemName, sourceFile }`。票券訂單從 `票券名稱及數量` 提取票券名稱（去掉數量部分如 ` x 2`），周邊訂單從 `訂購商品名稱及數量` 提取商品名稱
- [x] 2.2 實作「Automatic cashflow classification」規格變更 — 改寫 `runMatching()`：保留 membership/refunds 分類邏輯不變。對 purchases 改用 `orderIndex.get(cfRow['訂單編號'])` 做精確配對，配對成功時記錄 matchedName（票券名稱或商品名稱）和 orderType
- [x] 2.3 將 matched 結果結構改為 `{ byName: { [name]: { orderType, rows[] } }, unmatched[] }`，取代原本以 eventName 為 key 的結構
- [x] 2.4 移除舊的「Three-tier matching for ticket purchases」邏輯及「Event name extraction from filename」邏輯：刪除 `eventRowsByName`/`eventRowsByEmail` 索引建立、Tier 1 時間窗口配對、Tier 2 email fallback 配對、`parseTime` 函式、`extractEventName` 函式

## 3. 票券／商品對應專案 UI

- [x] 3.1 實作「Ticket name to project batch mapping」— 改寫 `renderMappingSection()`：從 matchResults.byName 提取所有唯一 name，每個 name 顯示一列，含 orderType 圖示（🎫/🛍️）、名稱、該名稱下的配對筆數、下拉選單（showsList）。section title 改為「票券／商品對應專案」
- [x] 3.2 移除舊的「Event name to show mapping」邏輯 — 更新 `getEventShowMap()` 為 `getNameProjectMap()`：從 mapping UI 的 select 取得每個 name 對應的 project name

## 4. Dashboard 與匯入更新

- [x] 4.1 實作「Import dashboard」規格變更 — 改寫 `renderDashboard()`：用 `getNameProjectMap()` 將 matchResults.byName 按 project 分組，區分 ticket（演出票房）和 merchandise（周邊商品）兩種 category，分別計算 revenue/fees/net 並渲染 breakdown table
- [x] 4.2 改寫 `renderUnmatched()`：顯示未配對項目的付款人、時間、金額、品項數量，下拉選單提供 showsList 供手動指定
- [x] 4.3 實作「Batch import to Google Sheets」規格變更 — 改寫 `doImport()`：生成 transactions 時，ticket 類 category 為「演出票房」，merchandise 類 category 為「周邊商品」，notes 包含各自的票券/商品明細。手動指定的 unmatched 項目也依 orderType 區分 category

## 5. 清理與驗證

- [x] 5.1 移除所有不再使用的舊程式碼：`eventFiles` state、`handleEventFile`、`removeEventFile`、`extractEventName`、`parseTime`、`eventRowsByName`/`eventRowsByEmail` 相關邏輯
- [x] 5.2 使用 RAW DATA 中的實際檔案（`20260412_應援撥款明細_444筆.xlsx` + `20260412_應援票券訂單_515筆.csv` + `20260412_應援訂單_85筆.csv`）進行端對端測試，確認配對率、dashboard 數字正確、匯入功能正常
