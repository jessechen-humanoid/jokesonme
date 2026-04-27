## 1. GAS 後端：修正 addSettlement 結算金額語意

- [x] 1.1 修改 `addSettlement()`：接收額外參數 `includeAdvances`（boolean），當為 true 時，計算未結清代墊總額並從 amount 中扣除，僅儲存利潤結算金額（結算金額語意：儲存利潤部分，不含代墊還款）
- [x] 1.2 確保 `addSettlement()` 在 `includeAdvances = false` 時行為與原本完全相同（向下相容）

## 2. GAS 後端：歷史資料修正工具

- [x] 2.1 實作 `fixAdvanceSettlements()` GAS 函式：掃描已結清代墊交易、按成員加總，修正最大 settlement 紀錄（歷史代墊結算修正）
- [x] 2.2 新增 GAS action `fixAdvanceSettlements` 對應 HTTP POST 入口，回傳修正摘要

## 3. 前端 Modal UI：動態顯示代墊區塊

- [x] 3.1 在 `showSettlementModal()` 選擇成員時，呼叫現有的 unsettledAdvances 資料（從已載入的 transactions 取得），若有代墊則顯示代墊區塊（Modal UI：動態顯示代墊區塊）
- [x] 3.2 代墊區塊包含：代墊金額顯示、「一起結清代墊」checkbox（預設勾選）
- [x] 3.3 金額欄位 label 在有代墊且勾選時改為「總匯款金額」；即時顯示拆分：利潤結算 $X / 代墊還款 $Y

## 4. 前端 Modal UI：送出邏輯

- [x] 4.1 修改 `submitSettlement()`：勾選「一起結清代墊」時，傳入 `includeAdvances: true` 及原始總金額，讓後端計算扣除（新增結算紀錄符合 add settlement record 規格）
- [x] 4.2 未勾選時，行為與原本相同

## 5. 前端：歷史資料修正入口

- [x] 5.1 在 analytics 頁新增「修正代墊帳」按鈕，呼叫 `fixAdvanceSettlements` action，顯示預覽（各成員修正前/後金額），讓使用者確認後執行（Historical advance settlement correction；歷史資料修正：GAS 修正函式 + 前端觸發）
- [x] 5.2 執行後重新整理報表
