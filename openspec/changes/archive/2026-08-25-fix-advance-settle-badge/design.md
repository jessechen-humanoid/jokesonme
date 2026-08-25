## Context

2026-06-05 的 advance-reimbursement-ledger 重構後，結清事實的唯一真相來源是「代墊還款」工作表（成員層級的還款帳本），analytics 頁已改用「代墊總額 − 還款加總」推導。但收支紀錄頁（index.html + `js/transaction.js`）的結清 badge 仍讀交易表第 7 欄的單筆布林旗標 `settled`，且該旗標在還款登錄時不會被更新，唯一更新路徑是使用者手動點 badge。兩頁因此長期不一致。

既有可用素材：`API.getTransactions()` 不帶參數會回傳全量交易且每筆含 `showName` 欄位；`API.getAdvanceReimbursements()` 已存在並回傳 `{ member, amount, date, notes }` 陣列。

## Goals / Non-Goals

**Goals:**

- 收支紀錄頁的結清標示與 analytics 使用同一真相來源（代墊還款帳本），兩頁永遠一致。
- 逐筆交易顯示「已結清／部分結清／未結清」三態，讓使用者在清單層級看得出哪幾筆代墊已被還款覆蓋。
- 純前端變更，不動 GAS、不動 Sheet schema、不需重新部署 Apps Script。

**Non-Goals:**

- 不建立「哪筆還款沖銷哪筆代墊」的逐筆對應資料（前次 design 已否決，部分還款無法乾淨對應）。
- 不在 GAS 端回寫交易表第 7 欄（否決理由：回寫不可逆、刪還款列後狀態欄無法還原、會重新污染資料）。
- 不移除交易表第 7 欄、`updateTransaction` 的 settled 路徑、以及「由共同基金支付」強制寫已結清的既有 GAS 邏輯——保留為殘留欄位，index 單純不再讀寫。
- 不改 analytics 頁（其計算已正確）。

## Decisions

### 結清狀態改為成員層級 FIFO 沖銷推導

每位成員的結清狀態推導：取該成員名下所有 `advancedBy` 為該成員的交易（跨演出、全量），按 `date` 由舊到新排序（同日期依 API 回傳的原始順序，即工作表列序），還款池 = 該成員在「代墊還款」帳本的金額加總。依序沖銷：池 ≥ 該筆金額（取 `Math.abs(amount)`）→ 已結清並扣池；0 < 池 < 該筆金額 → 部分結清（記錄已還金額）並清空池；池 = 0 → 未結清。

為什麼選 FIFO 而非只顯示成員層級餘額：清單是逐筆列表，逐筆狀態才回答得了「這一筆結了沒」；FIFO（時間序）是唯一不需要人工對應就能決定順序的規則，且與「先墊的先還」的直覺一致。

### 移除手動 toggle，badge 改純顯示

刪除 `js/transaction.js` 中 `.btn-settle` 的 click 事件處理（optimistic toggle 與失敗 rollback），badge 由 `<button>` 改為非互動元素。理由：推導制下手動旗標會重新製造兩套真相；使用者要改結清狀態的正確動作是去 analytics 登錄「代墊還款」。

### 資料載入改為全量交易＋還款帳本並行抓取

`loadTransactions()` 改為並行呼叫 `API.getTransactions()`（不帶 show 參數，取全量）與 `API.getAdvanceReimbursements()`，推導以全量交易執行，渲染時以 `t.showName === currentShow` 客端過濾重現原本的伺服器端過濾行為。理由：FIFO 推導必須看到成員跨演出的完整代墊歷史，單一演出的子集會算錯；全量抓取（目前數百筆量級）成本可忽略，且省掉第三個 API 請求。

### 三態 badge 樣式沿用品牌設計系統

`css/style.css` 的 `.btn-settle` 樣式改為狀態 badge：已結清＝中性灰綠、未結清＝現有紅色系、部分結清＝橘色系並顯示「已還 $X」輔助文字（tooltip 或小字）。整列紅底 `unsettled` class 的適用條件從「未結清」改為「狀態非已結清」（未結清與部分結清都保留列提示）。

## Implementation Contract

**行為：**

- 收支紀錄頁載入後，任何有墊款人的交易列，其結清欄顯示「已結清」「部分結清」或「未結清」三者之一；無墊款人的交易維持顯示「—」。
- 顯示狀態完全由「代墊還款」帳本推導：在 analytics 新增一筆足額的代墊還款後，重新載入收支紀錄頁，該成員名下依日期最早的代墊交易變為「已結清」，不需要任何人工點擊。
- 部分結清的交易顯示已沖銷金額（例：badge 附註「已還 $100」）。
- 點擊結清欄不再改變任何狀態、不發出任何 API 請求。
- 推導結果與 analytics 成員年度報表一致性：任一成員「已結清＋部分結清已還額」的加總 = analytics 的「代墊已結清」；「未結清＋部分結清未還額」的加總 = analytics 的「代墊未結清」。

**介面／資料形狀：**

- 新增純函式 `deriveSettleStatus(transactions, reimbursements)`（置於 `js/transaction.js`），輸入全量交易陣列與還款紀錄陣列，回傳 `Map<transactionId, { status: 'settled' | 'partial' | 'unsettled', reimbursedAmount: number }>`，只對 `advancedBy` 非空的交易產生條目。
- 不新增、不修改任何 API action；不改變 GAS 回應形狀。

**失敗模式：**

- `getAdvanceReimbursements` 請求失敗時，交易清單仍須渲染，結清欄顯示「—」並沿用既有的錯誤提示機制告知還款資料載入失敗；不得讓整頁掛掉。

**驗收方式：**

- 以瀏覽器實際載入收支紀錄頁，對照 analytics 成員年度報表：柏文（代墊已結清 22,933／未結清 188）與又又（15,352／324）名下的交易列，狀態須符合 FIFO 沖銷結果，且各成員三態金額加總與 analytics 相符。
- 手動驗證：點擊結清欄無反應、無網路請求（DevTools Network 無 updateTransaction 呼叫）。
- 切換不同演出，清單內容與改動前的伺服器端過濾結果一致。

**範圍邊界：**

- In scope：`js/transaction.js`、`css/style.css`。
- Out of scope：`gas/Code.gs`、`js/analytics.js`、`js/api.js`、Google Sheet 結構、其他頁面。

## Risks / Trade-offs

- [FIFO 順序與實際還款對象不符]（例如成員實際先還了較新的一筆）→ 這是成員層級帳本的固有限制，前次 design 已接受；清單狀態是「覆蓋率的呈現」而非法律事實，成員層級總額永遠正確。
- [交易表第 7 欄變殘留欄位，未來讀該欄的人會拿到過時資料] → Non-Goals 明文保留並宣告殘留；spec delta 同步改寫 Track settlement status 需求，讓 spec 成為正確依據。
- [全量抓交易在資料量成長後變慢] → 目前量級（數百筆）可忽略；若未來變慢，可加後端聚合 API，屬後續優化。
- [使用者習慣點 badge 改狀態，移除後找不到入口] → badge 的 tooltip／title 註明「結清狀態由代墊還款自動計算，請至財務分析登錄還款」。
