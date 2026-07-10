# site-optimization — Tasks

## 1. GAS 後端（一次改完、一次部署）

- [x] 1.1 getCommonFund 端點移除：刪除 `gas/Code.gs` 的 `getCommonFund` 路由分支與函式本體，該 action 改走既有 unknown-action 錯誤路徑，「共同基金」sheet 不再因讀取請求被寫入。驗證：`grep -n "getCommonFund" gas/Code.gs` 零命中；部署後 curl production 端點以 `action=getCommonFund` 回 unknown-action 類錯誤（歸 4.1 實測）。
- [x] 1.2 getForecast 結構檢查：實作 spec「Forecast structure validation」——`getForecast` 與 `updateForecast` 讀寫前驗證工作表錨點標籤，不符回 `FORECAST_STRUCTURE_MISMATCH` 與錨點位置、不回傳/不寫入部分資料；結構正常時行為不變。同時依「死碼與雙源常數清理」刪除 `cols===1` 死分支。驗證：程式碼中錨點清單與工作表實際標籤逐一對照（附對照結果）；`grep -n "cols===1\|cols === 1" gas/Code.gs` 零命中；production 實測歸 4.1。
- [x] 1.3 API_TOKEN 輪替文件化＋GAS 側常數註解：`gas/Code.gs` 頂部加輪替 SOP 註解（改 Script Properties → 團隊重登 → 免重新部署）；`MEMBERS` 與 `FUND_SHOW_NAME` 定義處各加一行「改這裡必須同步改 <前端路徑>」。驗證：grep 指認四段註解存在且路徑正確。

## 2. 前端

- [x] 2.1 checklist 輸入焦點保留：實作 spec「Project name editing preserves focus」——企劃名稱輸入 debounce 後走單項更新 API＋就地更新 DOM，不呼叫整頁 `loadChecklist()`；存檔失敗顯示既有錯誤提示並還原值。驗證：browser preview 連續輸入超過 debounce 間隔，焦點與游標不跳（實測）；重新整理後名稱持久化（實測或以 API mock 驗證呼叫路徑）。
- [x] 2.2 initChecklist 去重：實作 spec「Checklist initialization is not repeated」——已有項目的專案不再發 `initChecklist`，空清單才初始化一次。驗證：preview network 面板重複切換已初始化專案，無 `initChecklist` 請求。
- [x] 2.3 SheetJS SRI：實作 spec「External library integrity verification」——`import.html` 鎖定 SheetJS 版本、加 `integrity`（SHA-384 實算）與 `crossorigin="anonymous"`，旁註 hash 重算指令。驗證：preview 開 import 頁 `typeof XLSX !== 'undefined'` 為 true；故意改壞 hash 一位重載，script 被瀏覽器擋下（實測後改回）。
- [x] 2.4 前端死碼與雙源常數清理：依「死碼與雙源常數清理」刪除 `js/analytics.js` 的 `formatAmountAbs`；`js/shared.js` 的 `MEMBERS` 與 `js/transaction.js` 的 `FUND_SHOW_NAME` 各加同步提醒註解。驗證：`grep -rn "formatAmountAbs" js/` 零命中；`node --check` 全過；grep 指認兩段註解。

## 3. 文件與孤兒頁

- [x] 3.1 demo.html 標註＋OPTIMIZATION_PLAN 除役：`demo.html` 頂部加一行 HTML 註解標明孤兒展示頁性質（除此行外 diff 為零）；`OPTIMIZATION_PLAN.md` 精簡為 superseded 指標檔（指向本 change）。驗證：`git diff demo.html` 僅一行註解；OPTIMIZATION_PLAN.md 內容檢視含 superseded 聲明與 change 名。

## 4. 部署與驗收

- [x] 4.1 GAS 部署與 production 實測：Jesse 於 Apps Script 編輯器建立新版本並部署後，curl 實測——`action=getCommonFund` 回 unknown-action 錯誤；`action=getForecast` 正常結構回資料、（可行時）於測試副本插列驗證回 `FORECAST_STRUCTURE_MISMATCH`。驗證：curl 輸出原文記錄於完成回報。
- [x] 4.2 全項驗收：依 design.md「Implementation Contract」逐條核對六項可觀察行為與全部 grep 驗收，`spectra validate site-optimization` 通過。驗證：驗收清單與指令輸出附於完成回報。
