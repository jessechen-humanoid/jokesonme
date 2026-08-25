## 1. 推導邏輯

- [x] 1.1 依 design「資料載入改為全量交易＋還款帳本並行抓取」改寫 `js/transaction.js` 的 `loadTransactions()`：以 `Promise.all` 並行呼叫 `API.getTransactions()`（不帶 show 參數）與 `API.getAdvanceReimbursements()`，渲染時以 `t.showName === currentShow` 客端過濾。完成行為：切換任一演出，清單內容與改動前伺服器端過濾結果一致；還款請求失敗時清單仍渲染、結清欄全顯示「—」並以既有錯誤提示告知失敗。驗證：瀏覽器實測切換演出比對筆數，並以 DevTools 模擬 `getAdvanceReimbursements` 失敗確認 fallback。
- [x] 1.2 依 design「結清狀態改為成員層級 FIFO 沖銷推導」在 `js/transaction.js` 新增純函式 `deriveSettleStatus(transactions, reimbursements)`：回傳 `Map<transactionId, { status: 'settled' | 'partial' | 'unsettled', reimbursedAmount: number }>`，只對 `advancedBy` 非空的交易產生條目；每位成員的代墊交易跨演出按 `date` 由舊到新（同日期依 API 回傳順序）用還款池沖銷，金額取 `Math.abs(amount)`，池足額→settled、部分→partial（記錄已還額）、池空→unsettled。驗證：在瀏覽器 console 以 spec「Track settlement status」的 Example 資料（柏文 22,933/188、又又 15,352/324 邊界表）呼叫函式，輸出逐筆狀態與 analytics 成員年度報表的已結清/未結清加總一致。

## 2. Badge 顯示與樣式

- [x] 2.1 依 design「移除手動 toggle，badge 改純顯示」改寫 `js/transaction.js` 的清單渲染與事件繫結：結清欄依 `deriveSettleStatus` 結果顯示 已結清/部分結清/未結清 三態（partial 附「已還 $X」），badge 由 `<button class="btn-settle">` 改為非互動元素並加上 title 提示「結清狀態由代墊還款自動計算，請至財務分析登錄還款」；刪除 `.btn-settle` click 事件處理（optimistic toggle 與 rollback）；整列 `unsettled` class 改為「推導狀態非 settled」時套用。完成行為：點擊結清欄無任何狀態變化、DevTools Network 無 `updateTransaction` 呼叫。驗證：瀏覽器實測點擊 + Network 面板確認零請求。
- [x] 2.2 依 design「三態 badge 樣式沿用品牌設計系統」更新 `css/style.css`：已結清＝中性灰綠、未結清＝沿用現有紅色系、部分結清＝橘色系含輔助小字；移除 `.btn-settle` 的按鈕互動樣式（hover/cursor）。完成行為：三態在頁面上可肉眼區分且符合品牌設計系統（暖白底、8px 圓角、無陰影）。驗證：瀏覽器截圖逐一檢視三態樣式。

## 3. 整合驗證

- [x] 3.1 端對端一致性驗證（spec「Track settlement status」全部 Scenario）：以正式資料載入收支紀錄頁，逐成員核對——任一成員「settled＋partial 已還額」加總 = analytics 的「代墊已結清」、「unsettled＋partial 未還額」加總 = analytics 的「代墊未結清」（至少核對柏文 22,933/188 與又又 15,352/324）；並確認無墊款人交易顯示「—」、還款登錄後重新載入頁面最舊代墊自動變已結清。驗證：瀏覽器實測兩頁數字比對，截圖留存。
- [x] 3.2 git commit 並 push 至 `main` 觸發 GitHub Pages 部署，於 `https://jessechen-humanoid.github.io/jokesonme/` 線上環境重跑 3.1 的柏文/又又核對。完成行為：線上站結清標示與 analytics 一致。驗證：線上頁面實測。
