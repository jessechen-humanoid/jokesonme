## Why

財務分析頁面需要升級：收入/支出佔比需要視覺化為圓餅圖、代墊追蹤需整合進成員報表、成員需要完整的年度收支結算功能（含分次匯款紀錄）。

## What Changes

- 收入佔比和支出佔比改為兩張圓餅圖，左右並列，項目從佔比大排至小
- 移除獨立的「代墊追蹤」區塊，代墊資訊整合進成員報表
- 成員年度報表改為 5 欄：已收款淨利、未收款淨利、代墊未結清金額、需匯款金額、年度淨利
- 新增「成員結算」功能：記錄匯款給成員的紀錄，匯款後金額從「未收款」移至「已收款」
- 新增 Google Sheets「成員結算」sheet tab 儲存結算紀錄

## Capabilities

### New Capabilities

- `member-settlement`: 成員結算功能，涵蓋結算紀錄的新增/查詢、成員報表計算邏輯、結算 UI

### Modified Capabilities

- `financial-analytics`: 收入/支出佔比改為圓餅圖左右並列、移除代墊追蹤區塊
- `per-member-projected-earnings`: 成員報表改為 5 欄含已收款/未收款/代墊/需匯款/年度淨利
- `google-sheets-api`: 新增成員結算 sheet tab 和相關 API actions

## Impact

- Affected specs: `member-settlement`、`financial-analytics`、`per-member-projected-earnings`、`google-sheets-api`
- Affected code: `analytics.html`、`js/analytics.js`、`css/style.css`、`gas/Code.gs`、`js/api.js`
