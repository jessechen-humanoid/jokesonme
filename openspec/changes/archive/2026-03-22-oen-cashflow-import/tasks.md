## 1. 頁面基礎建設

- [x] 1.1 建立 `import.html` 頁面骨架，依據 XLSX 前端解析（SheetJS CDN）決策引入 SheetJS，包含導覽列、上傳區、儀表板區域
- [x] 1.2 在 `js/shared.js` 導覽列新增「應援匯入」連結
- [x] 1.3 在 `css/style.css` 新增匯入頁面樣式（上傳區、檔案狀態列表、儀表板卡片）

## 2. 檔案上傳與解析

- [x] 2.1 建立 `js/import.js`，實作上傳區：支援 upload cashflow and event files（拖曳或點擊），限制 `.xlsx` 格式
- [x] 2.2 實作 upload status visibility：顯示已上傳的撥款明細狀態（筆數、日期範圍、總額）及所有活動檔案清單（活動名稱、筆數、移除按鈕）
- [x] 2.3 實作活動名稱從檔名擷取（event name extraction from filename）

## 3. 金流配對邏輯

- [x] 3.1 實作 automatic cashflow classification：定期定額會費自動歸類為付費會員，退款標記排除
- [x] 3.2 依據三層配對策略實作 three-tier matching for ticket purchases：付款時間+姓名（5分鐘內）→ Email fallback → 標記未配對
- [x] 3.3 實作活動名稱對應演出清單（event name to show mapping）：提供下拉選單讓用戶確認對應關係

## 4. 匯入儀表板

- [x] 4.1 實作 import dashboard：顯示總收入、手續費、實收金額，以及按活動/來源分類的明細
- [x] 4.2 顯示未配對項目及手動指定下拉選單（manual assignment）

## 5. 批次寫入 Google Sheets

- [x] 5.1 在 `gas/Code.gs` 新增批次寫入 API action `batchImportTransactions`（batch import to Google Sheets），擴充 API action routing
- [x] 5.2 在前端實作匯入按鈕，將匯入結果分組方式（演出票房、付費會員、平台手續費）批次寫入，未配對項目未解決時停用按鈕
