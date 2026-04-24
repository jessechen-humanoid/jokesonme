## 1. 活動報名狀態上傳區

- [x] 1.1 實作「Upload cashflow and event files」規格變更及「Activity registration upload for price and event reference」— 修改 `import.html`：在右欄下方新增第三上傳區「活動報名狀態（選填）」，accept `.xlsx`，upload-icon 📋，hint 顯示「上傳活動報名狀態 .xlsx 以自動對應活動與拆分合購金額」，input id 為 `activity-input`
- [x] 1.2 在 `js/import.js` 新增 `activityFiles` state（`[{ name, eventName, rows }]`），新增 `handleActivityFile(file)` 函式：解析 xlsx、用 extractEventName 邏輯提取活動名稱（匹配 `^\d+_(.+?)_活動報名狀態`）、push 到 activityFiles
- [x] 1.3 更新 `setupUploadZones()` 新增第三上傳區的 click/dragover/dragleave/drop/change 事件處理，drop 只接受 `.xlsx`
- [x] 1.4 更新 `renderUploadStatus()` 顯示 activityFiles：📋 圖示、活動名稱、筆數、移除按鈕
- [x] 1.5 新增 `buildPriceTable(activityFiles)` 函式：遍歷所有 activityFiles 的 rows，以 `${票券名稱} ${規格名稱}` 為 key、`票券金額` 為 value 建立 Map。同時建立 `eventMappingTable`：同一 key → `[{ eventName, saleDateRange }]`，saleDateRange 從該活動檔案所有 `報名日期` 的最小值和最大值推算

## 2. 多票合購拆分邏輯

- [x] 2.1 實作「Multi-ticket order splitting」— 新增 `splitMultiTicket(rawField)` 函式：偵測 `票券名稱及數量` 是否包含多個 ` x \d+` 模式。若是，用雙空格分隔並 parse 每段為 `{ ticketFullName, quantity }`。若否，回傳單一 entry
- [x] 2.2 修改 `buildOrderIndex()`：對票券訂單的每一 row，呼叫 `splitMultiTicket` 拆分。若拆分結果為多票，將同一訂單編號映射為多個 entries（`[{ orderType, itemName, groupName, ticketFullName }]`），而非單一 entry
- [x] 2.3 修改 `runMatching()`：當一個訂單編號對應到多個 entries 時，為每個 entry 建立獨立的配對記錄。金額拆分邏輯：從 priceTable 查出每張票的單價，按 `entry_price / sum(all_entry_prices)` 比例分攤撥款明細的收取金額和手續費。若 priceTable 不存在（未上傳活動報名狀態），多票訂單維持不拆分

## 3. 活動自動歸屬與 Mapping UI 更新

- [x] 3.1 實作「Automatic event attribution via activity registration」— 新增 `resolveEventAttribution(groupName, matchedRows, eventMappingTable)` 函式：對 groupName 下的所有票券全名在 eventMappingTable 查找。若全部只歸屬同一活動 → 回傳該活動名；若歸屬多個活動 → 用配對記錄的訂單時間對比各活動 saleDateRange 推斷；無法判斷 → 回傳 null
- [x] 3.2 實作「Ticket name to project batch mapping」規格變更 — 修改 `renderMappingSection()`：對每個 groupName 呼叫 `resolveEventAttribution`。有自動結果時，下拉選單預選對應專案並顯示「自動對應」badge；回傳 null 時顯示「需手動確認」警告標籤
- [x] 3.3 修改 `updateImportButton()`：「需手動確認」的項目未選擇時，也要算入未完成數量並 disable 匯入按鈕
- [x] 3.4 更新 `tryRunMatching()`：活動報名狀態上傳/移除時也要觸發重新配對（加入 activityFiles.length 的判斷）

## 4. 驗證

- [x] 4.1 使用 RAW DATA 中的實際檔案（撥款明細 444 筆 + 票券訂單 515 筆 + 周邊訂單 85 筆 + 4月號/5月號/向上管理/直球 活動報名狀態）進行端對端測試：確認合購訂單正確拆分、金額精確分攤、自動歸屬正確、同名同價票按日期推斷
