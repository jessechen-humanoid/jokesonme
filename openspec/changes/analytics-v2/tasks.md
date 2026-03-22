## 1. 圓餅圖視覺化

- [ ] 1.1 實作 income and expense category breakdown 圓餅圖：使用 Canvas API 繪製圓餅圖，左右並列（使用 Canvas API 繪製圓餅圖），項目從佔比大排至小，含標籤和百分比
- [ ] 1.2 在 `css/style.css` 新增圓餅圖容器樣式（左右並列 grid layout）

## 2. 移除代墊追蹤區塊

- [ ] 2.1 移除 advance payment overview：刪除 `analytics.html` 的 `#unsettled-advances` div 和 `js/analytics.js` 中 `renderAdvances` 函式及呼叫

## 3. 成員結算 API

- [ ] 3.1 修改 Google Sheets structure：成員結算紀錄存在新 Sheet tab「成員結算」，在 `gas/Code.gs` setupSheets 新增，欄位：成員、金額、日期、備註（settlement record storage）
- [ ] 3.2 實作 API action routing 新增 `getSettlements` 和 `addSettlement` actions（get settlement records + add settlement record）
- [ ] 3.3 在 `js/api.js` 新增 `getSettlements` 和 `addSettlement` 方法

## 4. 成員報表改版

- [ ] 4.1 修改 per-member annual earnings report：依據成員報表計算邏輯改為 5 欄（已收款淨利、未收款淨利、代墊未結清、需匯款金額、年度淨利），整合結算紀錄
- [ ] 4.2 實作結算 UI 用 modal 表單：在成員報表加「新增結算」按鈕，點擊彈出 modal 表單（add settlement via modal）

## 5. 部署

- [ ] 5.1 部署 GAS 新版本並推送 GitHub Pages
