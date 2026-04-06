## 1. UI 文字改名

- [x] 1.1 修改 show selector on each page：`js/shared.js` 中的使用者可見文字「演出」→「專案」（請選擇專案、新增一個專案、新增專案、專案名稱、載入專案清單中），注意保留的「演出」用詞不改（演出準備、演出票房、演出內容）
- [x] 1.2 修改 `js/analytics.js`「各檔演出損益」→「各專案損益」、表頭「演出」→「專案」
- [x] 1.3 修改 `js/import.js`「活動對應演出」→「活動對應專案」、「選擇演出」→「選擇專案」、「指定演出」→「指定專案」，event name to show mapping 文字更新
- [x] 1.4 修改 `import.html` card title「活動對應演出」→「活動對應專案」
- [x] 1.5 修改 `js/transaction.js` 和 `index.html` 中使用者可見的「演出」→「專案」文字（如有）

## 2. GAS 後端改名 + 資料遷移

- [x] 2.1 修改 Google Sheets structure：`gas/Code.gs` 的 `SHEET_NAMES.SHOWS` 從 `'演出清單'` 改為 `'專案清單'`，error messages 中「演出」→「專案」，只改 UI 文字不改程式碼變數名
- [x] 2.2 實作 data migration action `migrateRenameShowToProject`：rename sheet tab + 將「會員與其他收支」的付費會員紀錄搬到「看我笑話會員」，用 GAS migration action 修正既有資料
- [x] 2.3 在 GAS 部署新版本並在 Google Sheets 中執行 migration

## 3. 會員費匯入目標修正

- [x] 3.1 修改 batch import to Google Sheets：`js/import.js` 中會員費匯入的 showName 從「會員與其他收支」改為「看我笑話會員」
