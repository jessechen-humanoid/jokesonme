## 1. Google Sheets 結構與 API 基礎建設

- [x] 1.1 建立 Google Sheets 資料表結構（演出清單、收支紀錄、Checklist、Checklist模板四張工作表），填入預設演出清單（Pre-loaded default shows）與 Checklist 模板內容（Checklist template with three categories）
- [x] 1.2 依照 Google Apps Script API 設計，建立 Web App 專案，實作 API action routing 與 JSON response format，部署為 Web App 並設定 CORS support
- [x] 1.3 實作演出管理相關 API：getShows、addShow（Show list shared across pages、Add new show）
- [x] 1.4 實作收支紀錄相關 API：getTransactions、addTransaction、updateTransaction（Record transaction by show、Track advance payments、Track settlement status、Transaction persistence）
- [x] 1.5 實作 Checklist 相關 API：getChecklist、initChecklist、updateChecklistItem、addChecklistItem（Initialize checklist from template、Track item progress with three states、Change item assignee、Add custom checklist items、Checklist data persistence、Public relations ticket notes）

## 2. 前端共用架構

- [x] 2.1 依照前端技術選擇（純 HTML + CSS + vanilla JS），建立前端頁面結構（index.html、checklist.html、analytics.html）與導覽列，套用 MUJI 視覺設計方向
- [x] 2.2 建立共用 CSS 樣式（css/style.css），包含 MUJI 風格色調、狀態色（Progress status visual indicators：紅黃綠）、RWD 基本響應式佈局
- [x] 2.3 建立共用 JS 模組：api.js（Google Apps Script API 呼叫封裝）與 shared.js（演出下拉選單、Member selection 團員選單含「其他」自填功能）

## 3. 收支紀錄頁

- [x] 3.1 實作收支紀錄頁面（js/transaction.js）：演出選擇下拉選單、新增收支表單（項目、金額、墊款人、日期）
- [x] 3.2 實作收支列表顯示（View transactions by show），包含結清狀態切換按鈕（Mark a transaction as settled）與未結清項目視覺區分

## 4. 演出準備 Checklist 頁

- [x] 4.1 實作 Checklist 頁面（js/checklist.js）：演出選擇下拉選單、首次選擇時自動從模板初始化（Initialize checklist from template）
- [x] 4.2 實作三大類別待辦項目顯示（演出內容、設備與人員、影片製作），包含進度狀態選擇（三階段）與負責人修改
- [x] 4.3 實作影片製作類別的企劃名稱自動帶入（Video production items auto-populate project names）
- [x] 4.4 實作新增自訂待辦事項功能（Add custom checklist items）與公關票備註欄位（Public relations ticket notes）

## 5. 財務分析頁

- [x] 5.1 實作財務分析頁面（js/analytics.js）：Yearly net profit 年度淨利總覽與 Monthly net profit 月度淨利明細
- [x] 5.2 實作 Per-show profit and loss 各檔演出獨立損益分析
- [x] 5.3 實作 Income breakdown by category 收入佔比與 Expense breakdown by category 支出佈比
- [x] 5.4 實作 Unsettled advance payments overview 墊款未結清總覽

## 6. 部署與驗證

- [x] 6.1 部署前端至 GitHub Pages，確認 API deployed as Google Apps Script Web App 串接正常運作
- [x] 6.2 端對端測試：建立演出、登記收支、操作 Checklist、查看財務分析報表，驗證 Google Sheets structure 資料正確寫入與讀取
