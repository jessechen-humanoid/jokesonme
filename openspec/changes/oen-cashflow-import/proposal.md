## Why

看我笑話工作室使用「應援（Oen）」平台販售演出門票、週邊商品及會員訂閱。每月從應援下載的「撥款明細」只顯示金流類型與票種名稱，無法直接判斷每筆金流對應哪一場活動。需要手動與各場「活動報名狀態」交叉比對，才能知道收入來源，既耗時又容易遺漏。

需要一個自動化匯入工具，讓用戶上傳 xlsx 檔案後，系統自動配對金流與活動、分類來源、視覺化呈現，並一鍵寫入現有 Google Sheets 收支紀錄。

## What Changes

- 新增「應援匯入」頁面（`import.html`），整合至現有平台導覽列
- 支援上傳「撥款明細」及多份「活動報名狀態」xlsx 檔案，並即時顯示上傳狀態
- 前端使用 SheetJS 解析 xlsx，自動分類金流：
  - 定期定額會費 → 付費會員
  - 單筆購買 → 透過「付款時間 + 姓名」配對活動，fallback 用 Email
  - 未配對項目 → 標記供手動指定
- 呈現匯入儀表板：總收入、手續費、按活動/來源分類的明細
- 提供「匯入到 Google Sheets」功能，將配對完成的資料批次寫入收支紀錄

## Capabilities

### New Capabilities

- `oen-cashflow-import`: 應援平台 xlsx 金流匯入功能，涵蓋檔案上傳、xlsx 解析、金流與活動自動配對、匯入儀表板、批次寫入 Google Sheets

### Modified Capabilities

- `google-sheets-api`: 新增批次寫入交易的 API endpoint，支援一次匯入多筆收支紀錄與手續費

## Impact

- 新增檔案：`import.html`、`js/import.js`
- 修改檔案：`js/shared.js`（導覽列加入匯入頁連結）、`css/style.css`（匯入頁樣式）、`gas/Code.gs`（批次寫入 API）
- 新增前端依賴：SheetJS（xlsx.js）CDN 引入
- 現有頁面不受影響，新功能為獨立頁面
