# site-optimization

## Why

2026/07/10 全站 review 確認：OPTIMIZATION_PLAN.md 的 P0/P1 已完成並經 production 驗證，但 P2（E1–E4）全數未做、D3 只完成前端半套，且發現數個計劃外問題（讀取端點帶寫入副作用、CDN 資源無完整性驗證、重複 API 呼叫）。這些殘留項讓文件與程式實況漂移，且部分有實際風險。

## What Changes

- **正確性**：
  - 移除 GAS 端點 `getCommonFund` 及其寫回「共同基金」sheet 的副作用（完成 D3 決策的後端半套；前端已不使用此端點）
  - `getForecast` 加結構檢查：讀取前驗證工作表關鍵儲存格結構，不符時回明確錯誤而非默默讀錯資料（E4）
- **體驗**：
  - checklist 企劃名稱輸入改為不重載整頁、保留輸入焦點（E1）
  - checklist 選擇專案時，已初始化的專案不再重複呼叫 `initChecklist`
- **資安**：
  - `import.html` 的 SheetJS CDN `<script>` 加上 SRI `integrity` 與 `crossorigin` 屬性
  - GAS `API_TOKEN` 輪替流程文件化（寫入 gas/ 下的 README 或 Code.gs 頂部註解）
- **清理**：
  - 移除 GAS 死分支（`getForecast` 的 `cols===1`）與前端未用函式（`formatAmountAbs`）（E2）
  - `MEMBERS`、`FUND_SHOW_NAME` 前後端雙源常數加互相提醒註解（E3）
  - `demo.html` 頂部加註解標明「孤兒展示頁，僅供直接網址分享，非站內功能」
  - OPTIMIZATION_PLAN.md 除役：標註 superseded by 本 change 並精簡為指標檔（避免兩套追蹤再度漂移）

## Non-Goals

- 不做 RWD／行動裝置優化（團隊完全不用手機開此站）
- 不加任何新功能（新報表、通知等）
- 不動視覺（已由 brand-visual-redesign 完成）
- 粉絲個資的 GitHub expunge 申請不在本 change（需 Jesse 以 GitHub 帳號向 GitHub Support 提交，屬立即行動）

## Capabilities

### New Capabilities

（無）

### Modified Capabilities

- `google-sheets-api`: ADDED——forecast 資料讀取的結構驗證要求（結構不符回明確錯誤）
- `show-checklist`: ADDED——企劃名稱編輯保留輸入焦點、不重載整頁的要求
- `oen-cashflow-import`: ADDED——外部函式庫（SheetJS）載入須含 SRI 完整性驗證的要求

## Impact

- Affected specs: `google-sheets-api`、`show-checklist`、`oen-cashflow-import`（皆為 ADDED delta）
- Affected code:
  - `gas/Code.gs`（移除 getCommonFund 路由與函式、getForecast 結構檢查、死分支清理、常數註解、token 輪替說明）
  - `js/checklist.js`（輸入不重載、init 去重）
  - `js/analytics.js`（移除 `formatAmountAbs`）
  - `js/shared.js`、`js/transaction.js`（雙源常數註解）
  - `import.html`（SheetJS SRI）
  - `demo.html`（僅頂部加一行註解，不動其餘內容）
  - `OPTIMIZATION_PLAN.md`（除役精簡）
- **部署注意**：`gas/Code.gs` 有動——完成後需在 Apps Script 編輯器手動建立新版本並部署，驗收含 production curl 實測
