## 1. GAS：穩定 UUID 欄位

- [x] 1.1 依決策「新增第 12 欄 ID，值為 Utilities.getUuid()」，在 gas/Code.gs 的 TX_COL 增加 ID = 12、TX_HEADERS 追加 'ID'，並將 getTransactions／getCommonFund／recalcTaxReserveForShow 等讀取處的 numCols 由 Math.max(getLastColumn(), 11) 調整為 12，確保讀得到 ID 欄；驗證方式：getTransactions 回傳物件含 id 欄且來源為第 12 欄
- [x] 1.2 落實 spec 需求 Transaction persistence：讓所有 append 交易列的路徑（addTransactionInternal、batchImportTransactions、recalcTaxReserveForShow 的自動稅務列）在寫入時以 Utilities.getUuid() 填入 ID 欄；驗證方式：手動新增一筆、跑一次批次匯入、觸發一次稅務重算後，對應新列的 ID 欄皆有唯一 UUID
- [x] 1.3 落實 spec 需求 View transactions by show：getTransactions 回傳的 id 改為 ID 欄的 UUID 字串（非列號）；驗證方式：curl getTransactions 帶 token，回傳每筆 id 為 UUID 字串

## 2. GAS：以 UUID 定位 + 並發鎖

- [x] 2.1 依決策「update/delete 改以 UUID 掃描定位列，而非直接用列號」落實 spec 需求 Edit transaction／Delete transaction：updateTransaction／deleteTransaction 收到的 id 改為 UUID，讀取 ID 整欄找到相符列再操作，找不到回 { success: false, error: '找不到該筆交易（可能已被刪除）' }；驗證方式：curl 對假 UUID 呼叫 deleteTransaction 回該錯誤訊息且未刪任何列
- [x] 2.2 依決策「寫入類 action 在 handleRequest 層包 LockService script lock」落實 spec 需求 Concurrency-safe writes：對 add/update/delete/batchImport 等寫入類 action 取得 LockService.getScriptLock() + waitLock(20000)、finally 釋放，讀取類與 verifyPassword 不上鎖，逾時回明確錯誤；驗證方式：正常操作無異狀，且逾時路徑回 { success:false } 不半寫入
- [x] 2.3 依決策「backfill 以編輯器 Run 的一次性函式執行，不進 API 路由」，新增 migrateBackfillTxIds 函式：掃描收支紀錄，ID 欄為空者填 Utilities.getUuid()、已有值跳過（冪等），且不加入 handleRequest 路由；驗證方式：node --check 語法通過，且函式不出現在 handleRequest 的 switch

## 3. 前端：編輯不覆蓋日期 + 字串 id

- [x] 3.1 依決策「前端編輯模式不送 date 欄位」落實 spec 需求 Edit transaction：js/transaction.js 的 submitTransaction 在 editingId 非空時，update payload 不含 date（新增模式仍送今天）；驗證方式：編輯一筆舊交易備註後，sheet 該列日期不變
- [x] 3.2 js/transaction.js 將交易 id 以字串處理（移除對 id 的 Number() 轉型，data-id 與 API 呼叫改傳 UUID 字串）以配合 UUID；驗證方式：編輯與刪除既有交易皆命中正確列、無 NaN id

## 4. 部署與驗證（需 Jesse 配合）

- [x] 4.1 Jesse 於 Apps Script 貼上新版 gas/Code.gs 並部署新版本；驗證方式：curl getTransactions 帶 token 回傳每筆 id 為 UUID 字串（新列）或空（既有列，待 backfill）
- [x] 4.2 Jesse 於 Apps Script 編輯器選 migrateBackfillTxIds 按 Run 一次，為既有交易列補 UUID；驗證方式：Run 後 curl getTransactions，既有交易皆有 UUID id；再 Run 一次列數與值不變（冪等）
- [x] 4.3 端到端並發正確性驗證：兩瀏覽器分頁開收支頁，分頁一新增一筆收入（觸發稅務重算、列號位移），分頁二不刷新直接刪除某筆舊交易；驗證方式：sheet 中被刪除的是正確那筆交易、稅務預留列無重複
- [x] 4.4 前端 commit + push（js/transaction.js）觸發 GitHub Pages 部署；驗證方式：https://jessechen-humanoid.github.io/jokesonme/ 登入後編輯／刪除交易功能正常、無 console 錯誤
