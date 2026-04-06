## 1. 移除月度淨利

- [x] 1.1 移除 monthly net profit：刪除 `analytics.html` 的 `#monthly-breakdown` div 和 `js/analytics.js` 中月度淨利渲染邏輯

## 2. 專案清單清理與排序

- [x] 2.1 修改 default project list：`gas/Code.gs` 的 `DEFAULT_SHOWS` 刪除「會員與其他收支」，調整「看我笑話年度大會｜看我畫大餅」排在 Opening Party 前
- [x] 2.2 實作 analytics cleanup migration action `migrateAnalyticsCleanup`：從 Google Sheets 專案清單刪除「會員與其他收支」行、調整「畫大餅」排序，透過 GAS migration 調整 Google Sheets 資料
- [x] 2.3 部署 GAS 新版本並執行 migration，移除月度淨利的方式已在 1.1 完成
