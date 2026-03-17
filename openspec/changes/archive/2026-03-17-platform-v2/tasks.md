## 1. Google Sheets API 與資料結構更新

- [x] 1.1 更新 `gas/Code.gs` 收支紀錄表 Google Sheets structure 欄位，從 item 改為 category + notes，並更新 addTransaction、getTransactions、updateTransaction 的欄位對應
- [x] 1.2 在 `gas/Code.gs` 新增 deleteTransaction API action routing，根據 row ID 刪除收支紀錄列
- [x] 1.3 更新 `gas/Code.gs` 預設演出清單擴充 Pre-loaded default shows，新增「會員與其他收支」「周邊商品收支」至 DEFAULT_SHOWS
- [x] 1.4 更新 `js/api.js` 新增 deleteTransaction 方法
- [x] 1.5 重新部署 Google Apps Script Web App 並驗證所有 API action routing 正常運作

## 2. 收支分類系統設計

- [x] 2.1 在 `js/shared.js` 新增 Fixed transaction categories 常數定義（收入 6 類、支出 7 類）與分類下拉選單建構函式，實作 Record transaction by show 所需的分類欄位
- [x] 2.2 更新 `index.html` 表單，實作收入支出切換按鈕 Income and expense toggle（預設支出），金額欄位改為正數輸入
- [x] 2.3 更新 `js/transaction.js` 表單邏輯，分類下拉 Category replaces free-text item field 隨收支模式動態切換，送出時自動加正負號，更新 View transactions by show 列表欄位顯示 category 與 notes
- [x] 2.4 實作 Legacy data compatibility：讀取無 category 欄位的 v1 資料時，自動歸類並映射 notes

## 3. 收支紀錄編輯刪除功能設計

- [x] 3.1 實作 Transaction row action menu：每筆紀錄新增「⋯」操作按鈕與下拉選單（編輯/刪除）
- [x] 3.2 實作 Edit transaction 功能：點擊編輯後捲動至表單、帶入現有值、按鈕改為「更新」、提交後呼叫 updateTransaction API
- [x] 3.3 實作 Delete transaction 功能：點擊刪除後彈出確認對話框、確認後呼叫 deleteTransaction API 並從列表移除

## 4. Optimistic UI 策略

- [x] 4.1 重構 `js/transaction.js` 結清狀態 Track settlement status 切換為 Optimistic UI，含 settlement API failure rollback
- [x] 4.2 重構 `js/checklist.js` 進度狀態 Track item progress with three states 切換為 Optimistic UI，含 progress API failure rollback

## 5. Liquid Glass 靜態版視覺設計

- [x] 5.1 更新 `css/style.css` 實作 Gradient background 漸層背景取代純色
- [x] 5.2 更新 `css/style.css` 實作 Frosted glass card style 卡片毛玻璃效果（半透明背景、backdrop-filter blur、圓角 16px、柔和陰影）
- [x] 5.3 更新 `css/style.css` 實作 Frosted glass navigation bar 導航列毛玻璃效果
- [x] 5.4 更新 `css/style.css` 實作 Glassmorphism fallback 不支援 backdrop-filter 瀏覽器的降級方案
- [x] 5.5 更新按鈕、表單、狀態標籤等元件樣式配合 Liquid Glass 靜態版視覺設計整體風格

## 6. Checklist 表格化佈局

- [x] 6.1 更新 `js/checklist.js` 與 `css/style.css` 實作 Checklist table layout，每個類別渲染為有表頭（項目/負責人/進度）的表格
- [x] 6.2 調整公關票備註 Public ticket notes below item 在表格中以 colspan 跨列呈現於項目下方

## 7. 財務報表欄位強化

- [x] 7.1 更新 `js/analytics.js` Monthly net profit 月度結算表加合計列
- [x] 7.2 更新 `js/analytics.js` Per-show profit and loss 演出結算表加合計列
- [x] 7.3 更新 `js/analytics.js` Income breakdown by category 與 Expense breakdown by category 改用固定分類聯合
- [x] 7.4 更新 `js/analytics.js` Unsettled advance payments overview 代墊追蹤表加已結清金額與總計欄

## 8. 部署與驗證

- [x] 8.1 重新部署 Google Apps Script Web App（含 deleteTransaction 與欄位變更）
- [x] 8.2 推送前端至 GitHub Pages 並驗證所有頁面正常運作
- [x] 8.3 端對端驗證：新增收支（含分類切換）、編輯收支、刪除收支、Checklist 操作、財務報表檢視
