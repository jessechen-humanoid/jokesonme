## 1. 排序 state 與函式

- [x] 1.1 在 `js/analytics.js` 內 `renderShowPnl()` 所在的範圍新增 `sortState` 物件（`{ column: 'net', direction: 'desc' }`），預設值落實「Initial table state」（淨利降序）
- [x] 1.2 實作 `sortShows(shows, sortState)` 純函式：依 column 與 direction 排序；`name` 欄使用 `localeCompare`；`expense` 欄使用 `Math.abs` 再比較（落實 Sortable per-show P&L table columns 中「expense column SHALL be sorted by absolute value」）
- [x] 1.3 實作 `getDefaultDirection(column)`：`name` 回傳 `'asc'`，`income` / `expense` / `net` 回傳 `'desc'`（落實 Click inactive column header 的預設方向規則）
- [x] 1.4 實作 `handleSortClick(column)`：若 column === sortState.column 則 toggle direction；否則切換 column 並套用該欄預設方向；呼叫 rerender

## 2. UI 指示器與互動

- [x] 2.1 改寫 `renderShowPnl()` 的 `<thead>`：四個 `<th>` 加上 `data-sort-key` 屬性（name / income / expense / net）並綁定 click handler
- [x] 2.2 根據 `sortState` 在當前排序 `<th>` 文字後加上 `▲` / `▼` 指示符；當前欄 `<th>` 加 `font-weight:600`；其他欄不顯示指示符
- [x] 2.3 rerender 時呼叫 `sortShows()` 取得排序後陣列再生成 `<tbody>`，確保合計列用獨立 `<tr class="totals-row">` 放最後（落實 Totals row stays pinned）
- [x] 2.4 `<th>` 加 `cursor: pointer` 與 `user-select: none`（若 style.css 現有規則不足則加入）

## 3. 驗證

- [ ] 3.1 開啟 `analytics.html`，確認初始狀態為淨利降序、最賺的演出在最上（落實 Initial table state）
- [ ] 3.2 點擊各欄標頭驗證切換行為（落實 Click inactive column header 與 Click active column header 兩個 Scenario）
- [ ] 3.3 驗證專案欄中文排序正確、支出欄降序時花最多的演出在最上（落實 Sort show name column with Chinese names 與 Sort expense column uses absolute values）
- [ ] 3.4 重新載入頁面，確認回到初始淨利降序狀態（落實 No sort state persistence across reload）
- [ ] 3.5 任意排序下，合計列永遠在最底（落實 Totals row stays pinned）
