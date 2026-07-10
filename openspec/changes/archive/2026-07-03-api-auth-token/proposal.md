## Summary

在 Google Apps Script（GAS）後端加入伺服器端密碼驗證與 API token 授權，並下架已執行完的一次性 migration endpoints，讓「任何人拿到 Web App URL 就能讀寫刪全部財務資料」的漏洞關閉。

## Motivation

GAS Web App URL 公開在前端 `js/api.js`，目前後端對每個 request 完全不驗證身分——任何知道 URL 的人可直接呼叫 addTransaction／deleteTransaction／batchImportTransactions 等，讀寫刪全部財務與個資。前端密碼 `joke0321` 硬編碼在 `js/shared.js`，只是畫面遮罩，改一行 sessionStorage 即繞過，對後端毫無保護作用。此外 router 仍掛著 5 個已執行完的一次性 migration（其中 migrateAnalyticsCleanup 無冪等保護，被呼叫就會刪改專案清單），構成額外攻擊面。此為 OPTIMIZATION_PLAN.md 階段 2（P0-B / 任務 B1+B2）。

## Proposed Solution

採「共用密碼 + GAS 伺服器端驗證」方案（不引入 Google OAuth，符合 8 人小團隊威脅模型）：

**B1 — 伺服器端密碼驗證 + API token**
- GAS 以 Script Properties 儲存 APP_PASSWORD 與 API_TOKEN（由 Jesse 手動設定，不進 git）。
- 新增 action `verifyPassword`：比對送入密碼與 APP_PASSWORD，成功回傳 API_TOKEN。
- `handleRequest` 對除 `verifyPassword` 外的所有 action 檢查 token，不符回傳 unauthorized 錯誤。
- 前端密碼閘門改為呼叫 `verifyPassword`，成功後將 token 存入 sessionStorage；移除硬編碼密碼 `joke0321`。
- 前端 API 封裝在每次請求自動附帶 token；收到 unauthorized 時清除 sessionStorage 並重新顯示密碼框。
- 過渡部署：GAS 先上「API_TOKEN property 未設定時放行」的相容版，待前端上線後由 Jesse 設定 property 正式啟用強制驗證。

**B2 — 下架一次性 migration endpoints**
- 從 `handleRequest` 的 action 路由移除 5 個已執行完的一次性 action：migrateRenameShowToProject、migrateAnalyticsCleanup、migrateTaxAndFundSetup、migrateAdvanceLedger、setup。函式本體保留於檔案供查閱，但不再可經 API 觸發。
- 移除前端 API 封裝中對應且未被使用的 wrapper：migrateAdvanceLedger、migrateTaxAndFundSetup、setup、getCommonFund。

## Impact

- Affected specs:
  - Modified `password-gate`：密碼改由伺服器端驗證、以 token 取代 boolean 旗標、移除硬編碼密碼。
  - Modified `google-sheets-api`：新增 verifyPassword action 與全域 token 授權；action 路由移除 5 個一次性 migration。
- Affected code:
  - Modified: gas/Code.gs（新增 verifyPassword、token 檢查、移除 migration 路由）、js/api.js（附帶 token、錯誤處理、移除死 wrapper）、js/shared.js（密碼閘門改呼叫伺服器、移除硬編碼密碼）
- 部署與設定（需 Jesse 配合）：於 GAS Script Properties 設定 APP_PASSWORD 與 API_TOKEN；依過渡順序先部署 GAS 相容版、再推前端、最後設定 property 啟用強制驗證。
- 相依性：無新增外部套件。
