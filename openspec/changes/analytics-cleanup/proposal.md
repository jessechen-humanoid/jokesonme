## Summary

移除月度淨利區塊、刪除「會員與其他收支」專案、調整專案排序讓「畫大餅」排在 Opening Party 前。

## Motivation

- 月度淨利因認列時間點問題（撥款明細的日期 ≠ 活動實際月份）不具參考價值
- 「會員與其他收支」已被「看我笑話會員」取代，留著會造成混淆
- 「看我笑話年度大會｜看我畫大餅」是在 Opening Party 之前舉辦的活動，排序應反映實際時序

## Proposed Solution

1. `analytics.html` 移除 `#monthly-breakdown` 區塊，`analytics.js` 移除月度淨利相關渲染邏輯
2. `gas/Code.gs` 的 `DEFAULT_SHOWS` 刪除「會員與其他收支」，並透過 migration 從 Google Sheets 專案清單中刪除該行
3. 調整 `DEFAULT_SHOWS` 順序：「看我笑話年度大會｜看我畫大餅」排在 Opening Party 前。透過 migration 調整 Google Sheets 中的行順序

## Impact

- Affected specs: `financial-analytics`、`show-management`、`google-sheets-api`
- Affected code: `analytics.html`、`js/analytics.js`、`gas/Code.gs`
