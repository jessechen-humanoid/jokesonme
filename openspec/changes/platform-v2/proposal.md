## Why

平台 v1 已上線運作，但實際使用後發現多項體驗與功能不足：收支紀錄缺乏編輯刪除、無法區分收入/支出類型、沒有固定分類導致報表聚合不準確、介面視覺過於陽春、Checklist 排版凌亂、財務報表欄位不夠完整。這些問題影響團員日常使用意願與資料品質，需要全面優化。

## What Changes

- 新增「會員與其他收支」「周邊商品收支」為預設演出項目，讓非演出類收支有固定歸屬
- 收支紀錄新增編輯與刪除功能（編輯跳回表單帶入值、刪除需確認）
- 金額輸入改為按鈕切換收入/支出（預設支出），只需輸入正數
- 項目欄位拆分為「分類（固定下拉）」+「備註（自由文字）」，收入 6 類、支出 7 類
- 結清狀態與 Checklist 進度切換改為 Optimistic UI，不重新載入整個列表
- 整體視覺升級為 Liquid Glass 靜態版（毛玻璃卡片、漸層背景、純 CSS 實現）
- Checklist 改為表格佈局（表頭：項目/負責人/進度），公關票備註維持項目下方展開
- 財務報表強化：月度與演出結算加合計列、代墊追蹤加已結清與總計欄

## Capabilities

### New Capabilities

- `transaction-categories`: 固定收支分類系統，收入 6 類（演出票房、付費會員、商演合作、周邊商品、品牌贊助、其他收入）、支出 7 類（場地租借、工作人員、設備道具、剪輯製作、行政雜支、平台手續、其他支出），搭配按鈕切換收入/支出模式
- `transaction-crud`: 收支紀錄的完整 CRUD 操作，包含編輯（帶入表單值）與刪除（確認對話框）功能
- `liquid-glass-ui`: Liquid Glass 靜態版視覺設計系統，包含毛玻璃卡片、漸層背景、半透明導航列、圓角加大等純 CSS 實現

### Modified Capabilities

- `transaction-management`: 新增 category 與 notes 欄位取代原 item 欄位、金額改為正數搭配收支類型、結清切換改 Optimistic UI
- `show-management`: 預設演出清單新增「會員與其他收支」「周邊商品收支」
- `show-checklist`: 改為表格式佈局、進度切換改 Optimistic UI
- `financial-analytics`: 月度與演出結算加合計列、代墊追蹤加已結清與總計欄、報表依固定分類聚合
- `google-sheets-api`: 新增 deleteTransaction API、收支紀錄表結構新增 category/notes 欄位取代 item

## Impact

- 影響的程式碼：`js/transaction.js`、`js/checklist.js`、`js/analytics.js`、`js/shared.js`、`js/api.js`、`css/style.css`、`index.html`、`checklist.html`、`analytics.html`、`gas/Code.gs`
- 影響的資料結構：Google Sheets 收支紀錄表欄位變更（item → category + notes）、演出清單新增預設項目
- 需重新部署：Google Apps Script Web App、GitHub Pages
