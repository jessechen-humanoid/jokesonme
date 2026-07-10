## Summary

以穩定 UUID 取代「用試算表列號當交易 ID」，為所有寫入操作加上 LockService 互斥鎖，並修正「編輯交易會把日期覆蓋成今天」的缺陷，消除多人同時使用時刪錯／編錯交易與帳務日期被破壞的風險。

## Motivation

這是財務系統，算錯或改錯 = 團員拿錯錢，資料正確性風險遠高於其他項目。目前有三個具體缺陷（OPTIMIZATION_PLAN.md 階段 3 / P0-C）：

1. **列號當 ID + 稅務重算會位移列號**：後端回傳的交易 id 是試算表列號，而每次新增／編輯／刪除收入都會觸發稅務預留重算——它會刪除該專案既有的自動稅務列、再重新 append，導致其後所有列號位移。情境：甲開著收支頁 → 乙新增一筆收入（觸發重算、列號位移）→ 甲按刪除某筆 → 實際刪到別筆交易。編輯同理會改到別筆。
2. **無並發保護**：GAS 完全沒有鎖；稅務重算是「刪列→補列」的多步非原子操作，兩人同時操作會交錯、產生重複或錯誤的稅務預留列。
3. **編輯覆蓋日期**：前端送出交易時無論新增或編輯，一律用今天日期，導致編輯三個月前的交易改個備註、原始日期就被改成今天，破壞帳務追溯與稅務預留的日期計算。

## Proposed Solution

- **穩定 UUID**：收支紀錄 sheet 新增 ID 欄，所有 append（手動新增、批次匯入、稅務預留自動列）都以 UUID 填入；後端回傳 UUID 作為交易 id；更新／刪除改為掃 ID 欄找到對應列再操作，找不到則回明確錯誤。既有列以一次性函式補 UUID（由 Jesse 於 Apps Script 編輯器 Run 一次，不進 API 路由）。
- **並發鎖**：在請求進入點對所有寫入類 action 包 LockService script lock，讀取類不上鎖。
- **日期修正**：前端編輯模式送出時不帶 date 欄位（後端對 undefined 欄位不動作），原始日期保留。

## Non-Goals

- 不改 Checklist sheet 的 id 機制（該表 append-only、無自動刪列，列號穩定）。
- 不改動稅務預留的計算邏輯本身（3% 比率、分組規則不變），只讓其 append 帶 UUID。
- 不處理前端 api.js 的錯誤處理與逾時（屬 OPTIMIZATION_PLAN 階段 4 / D1）。
- 不引入外部資料庫或改變 Google Sheets 儲存架構。

## Impact

- Affected specs:
  - Modified `transaction-management`：交易持久化新增穩定 UUID 欄位；所有寫入操作以 script lock 互斥。
  - Modified `transaction-crud`：編輯／刪除以 UUID 定位交易列；編輯不再覆蓋原始日期。
- Affected code:
  - Modified: gas/Code.gs（TX 欄位新增 ID、add/batchImport/稅務 append 帶 UUID、getTransactions 回 UUID、update/delete 以 UUID 定位、handleRequest 寫入類 action 加 LockService、新增一次性 backfill 函式）、js/transaction.js（編輯模式不送 date、id 以字串處理）
- 部署與設定（需 Jesse 配合）：完成後手動部署 GAS；於 Apps Script 編輯器 Run 一次 backfill 函式為既有交易列補 UUID（冪等）。
