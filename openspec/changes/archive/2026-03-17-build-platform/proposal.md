## Why

看我笑話工作室是一個 8 人日式漫才喜劇團體，目前使用陽春的 Google Sheets 手動記帳，格式不統一、無法快速查看月/年淨利、各檔演出損益不清楚、墊款結清狀態難以追蹤。同時每月拼盤秀的演出準備待辦容易遺漏，缺乏一個共用的進度追蹤機制。

需要建立一個共用的線上平台，整合財務登記與演出準備管理，資料儲存於 Google Sheets，前端以純 HTML + JS 部署於 GitHub Pages，無需登入驗證。

## What Changes

- 建立三頁式靜態網頁平台（收支紀錄、演出準備、財務分析）
- 以 Google Apps Script 作為 API 中介層，串接 Google Sheets 作為資料庫
- 收支紀錄頁：依演出檔次登記收入/支出、記錄墊款人與結清狀態
- 演出準備頁：依演出檔次顯示 Checklist 模板（3 大類），支援進度追蹤（未開始/進行中/已完成）
- 財務分析頁：月/年淨利、各檔演出獨立損益、收入佔比、支出佔比、墊款未結清總覽
- 演出清單為兩頁面共用，預設載入第 2 季 11 檔演出
- 團員下拉選單：傑哥、柏文、巧達、芭樂、又又、兔子、大弋、竹節蟲 ＋「其他」可自填
- 視覺風格採 MUJI 簡潔高質感清爽設計

## Capabilities

### New Capabilities

- `transaction-management`: 收支紀錄功能——依演出檔次登記收入/支出，記錄金額、項目說明、墊款人、結清狀態
- `show-checklist`: 演出準備 Checklist——依演出檔次顯示待辦模板（演出內容/設備與人員/影片製作三大類），支援進度追蹤與自訂新增項目
- `financial-analytics`: 財務分析儀表板——月/年淨利、各檔演出獨立損益分析、收入與支出佔比圖表、墊款未結清總覽
- `google-sheets-api`: Google Apps Script API 中介層——處理前端與 Google Sheets 之間的 CRUD 操作
- `show-management`: 演出檔次管理——共用演出清單的新增與選擇，跨頁面共用

### Modified Capabilities

（無，全新專案）

## Impact

- 新增前端檔案：`index.html`、`styles.css`、`app.js`（或依頁面拆分）
- 新增 Google Apps Script 專案：處理 API 請求
- 新增 Google Sheets：結構化的資料表（收支紀錄、演出清單、Checklist 進度）
- 部署平台：GitHub Pages
