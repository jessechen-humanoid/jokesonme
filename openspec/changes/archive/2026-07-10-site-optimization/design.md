# site-optimization — Design

## Context

前端 Vanilla JS（GitHub Pages）＋ GAS Web App（Google Sheets 為資料庫）。OPTIMIZATION_PLAN.md 的 P0/P1 已上線，本 change 收尾 P2 殘留與 2026/07/10 review 新發現。GAS 端改動需手動部署（Apps Script 編輯器建新版本），因此後端改動集中一次處理、一次部署。

## Goals / Non-Goals

**Goals:**

- 消除「讀取端點寫入 sheet」的副作用與「插列讀錯資料」的沉默失敗
- checklist 輸入體驗不被重載打斷；去除重複 API 呼叫
- 外部資源載入可驗證完整性；token 輪替有文件可循
- 追蹤文件單一化（Spectra 為唯一真相）

**Non-Goals:**

- RWD／行動裝置優化、新功能、視覺調整（皆已另案或明確排除）
- 不重構 GAS 整體架構（單檔 Code.gs 維持現狀）
- PII expunge 申請（Jesse 親自向 GitHub Support 提交）

## Decisions

### getCommonFund 端點移除

直接刪除 `gas/Code.gs` 中 `getCommonFund` 的路由分支與函式本體（含每次 GET 寫回「共同基金」sheet 的邏輯）。前端已於 D3 前半改為自行計算，production 無呼叫方。為何刪而不留：讀取端點帶寫入副作用違反最小驚訝原則，留著就是下一次資料飄移的來源。移除後未知 action 走既有的 unknown-action 錯誤路徑。

### getForecast 結構檢查

`getForecast` 讀取資料前，先驗證財務預估工作表的錨點儲存格（各區段的標題列標籤）包含預期的區段名（包含式比對——實際標籤帶有【】與說明後綴，如「【基礎參數】（藍色 = 可調整）」；列被插挪後該列通常不含區段名，仍會正確報錯）；不符時回傳 `{ success: false, error: "FORECAST_STRUCTURE_MISMATCH", detail: <錨點位置> }`，不回傳部分解析的資料。為何用錨點驗證而非改成動態尋列：動態尋列改動大且引入新的模糊比對風險；錨點驗證改動小、把「沉默讀錯」變成「明確報錯」，已消除主要風險。`updateForecast` 寫入前做同樣檢查。

### checklist 輸入焦點保留

企劃名稱輸入的 debounce callback 從「呼叫 `loadChecklist()` 整頁重載」改為「呼叫既有的單項更新 API ＋ 就地更新本地狀態與受影響的 DOM 節點」，輸入框不被重建、焦點不丟失。與既有「Track item progress」的 optimistic UI 模式一致（該 requirement 已明訂狀態切換不重載，本改動把同一模式套到名稱輸入）。

### initChecklist 去重

選擇專案後先看 `getChecklist` 回傳：已有項目就跳過 `initChecklist` 呼叫；只有空清單才初始化。為何在前端判斷而非後端擋：後端 `initChecklist` 本身冪等與否不動（範圍控制），前端少打一次 API 是純收益。

### SheetJS SRI

`import.html` 的 `cdn.sheetjs.com` script 標籤加 `integrity="sha384-<hash>"` 與 `crossorigin="anonymous"`，hash 以當前鎖定版本的檔案實算產生。為何不本地化檔案：repo 是 GitHub Pages 靜態站，vendor 檔進 repo 會膨脹且失去 CDN 快取；SRI 已阻斷「CDN 被竄改」這條攻擊路徑。取捨：SheetJS 升版時要重算 hash（在旁邊加註解說明重算指令）。

### API_TOKEN 輪替文件化

在 `gas/Code.gs` 頂部註解區塊寫明輪替 SOP：到 Apps Script「專案設定 → Script Properties」改 `API_TOKEN` 值 → 通知團隊重新登入（token 存 sessionStorage，關瀏覽器即失效，無需清除步驟）→ 無需重新部署。為何寫在 Code.gs 而非獨立文件：GAS 端只有這一個檔，維護者一定會開它；獨立 README 反而容易被漏看。

### 死碼與雙源常數清理

刪除 `getForecast` 的 `cols===1` 死分支與 `js/analytics.js` 未使用的 `formatAmountAbs`。`MEMBERS`（js/shared.js ↔ gas/Code.gs）與 `FUND_SHOW_NAME`（js/transaction.js ↔ gas/Code.gs）四處各加一行註解指向對方位置（「改這裡必須同步改 <路徑>」）。為何不消除雙源：前後端無共用模組機制（GAS 不能 import 前端檔），建同步機制的成本遠高於註解提醒，8 人團隊夠用。

### OPTIMIZATION_PLAN 除役

OPTIMIZATION_PLAN.md 內容精簡為一段說明：「P0/P1 已完成（2026/07 驗證）；其餘項目由 Spectra change `site-optimization` 接手並完成；本檔僅留作歷史指標」。為何不直接刪檔：git 歷史裡它被多次引用，留一個指標檔比讓連結斷掉便宜。

## Implementation Contract

**可觀察行為**：

1. 對 production GAS 端點以 `action=getCommonFund` 發 GET，回傳 unknown-action 類錯誤，且「共同基金」sheet 不再因此請求產生任何寫入
2. 財務預估工作表被插入一列後呼叫 `getForecast`，回傳 `FORECAST_STRUCTURE_MISMATCH` 錯誤而非錯位資料；結構正常時行為與現狀完全相同
3. 在 checklist 企劃名稱輸入框連續輸入超過 debounce 間隔，焦點不丟失、游標不跳動；手動重新整理後輸入的名稱已持久化
4. 對已初始化的專案重複切換選擇，network 面板看不到 `initChecklist` 請求
5. `import.html` 的 SheetJS script 帶 `integrity` 與 `crossorigin`，匯入功能實跑正常（hash 正確才載得進來）
6. `demo.html` 除頂部一行 HTML 註解外 diff 為零

**驗收條件**：

- GAS 部分：部署後以 curl 實測（1）（2）的 production 行為；部署前以 `node --check` 不適用（.gs），改以 clasp 或肉眼確認語法完整、grep 確認 `getCommonFund` 零殘留
- 前端部分：browser preview 實測（3）（4）（5）；`grep -n "formatAmountAbs" js/` 零命中；雙源常數四處註解到位（grep 指認）
- `spectra validate site-optimization` 通過

**範圍邊界**：in scope＝上列檔案的上列行為；out of scope＝GAS 架構重構、checklist 以外頁面的 API 呼叫模式、任何視覺改動。

## Risks / Trade-offs

- [GAS 手動部署失敗或部署舊版本] → 驗收含 production curl 實測，部署版本號記錄在完成回報；rollback＝Apps Script 部署管理切回前一版本
- [SheetJS hash 算錯導致匯入功能整個掛掉] → 驗收必含 import 頁實際載入 SheetJS 成功的檢查（`typeof XLSX !== 'undefined'`）
- [checklist 就地更新與後端狀態漂移] → 沿用既有單項更新 API（與狀態切換同一條路徑），失敗時顯示既有錯誤提示並還原輸入框值
- [錨點字串驗證過於嚴格（工作表標籤微調就報錯）] → 這是刻意取捨：寧可明確報錯也不沉默讀錯；錯誤訊息附錨點位置，修表即恢復
