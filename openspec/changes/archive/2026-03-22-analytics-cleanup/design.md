## Context

財務分析頁面需要清理：月度淨利不實用、舊專案需刪除、專案排序需調整。

## Goals / Non-Goals

**Goals:**
- 移除月度淨利區塊
- 刪除「會員與其他收支」專案
- 調整專案排序讓「畫大餅」在 Opening Party 之前

**Non-Goals:**
- 不新增任何分析功能

## Decisions

### 透過 GAS migration 調整 Google Sheets 資料

新增 `migrateAnalyticsCleanup` action：
1. 從專案清單刪除「會員與其他收支」行
2. 調整「看我笑話年度大會｜看我畫大餅」的行位置到 Opening Party 之前

### 移除月度淨利的方式

直接刪除 `analytics.html` 的 `#monthly-breakdown` div 和 `analytics.js` 中渲染月度淨利的函式呼叫。

## Risks / Trade-offs

- [風險] 刪除「會員與其他收支」後，如果有其他交易掛在該專案下會變成孤兒資料 → migration 前檢查是否有非會員費紀錄
