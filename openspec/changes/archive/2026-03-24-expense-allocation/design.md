## Context

目前系統的成員分配機制僅適用於收入交易。收入使用 checkbox grid 讓使用者選擇參與分配的成員，未勾選的成員記錄在 Google Sheets 的「排除成員」欄位。支出則固定由 8 人平分，「排除成員」欄位始終為空。

支出表單目前顯示「墊款人」下拉選單，收入表單顯示「成員分配」checkbox grid，兩者互斥切換。

## Goals / Non-Goals

**Goals:**

- 支出表單同時顯示「墊款人」和「成員分擔」兩個欄位
- 複用現有的 `createMemberCheckboxGrid` 元件
- 財務分析中的支出分攤根據排除成員動態計算
- 既有資料（排除成員為空）行為不變，向下相容

**Non-Goals:**

- 不做金額不等分（目前只做人頭平分）
- 不重新命名 `income-allocation` spec（雖然現在支出也用，但保持現有命名）

## Decisions

### UI：支出表單同時顯示墊款人與分擔成員

修改 `toggleAllocationFields()` 讓支出模式下同時顯示墊款人下拉選單和 checkbox grid。收入模式維持現有行為（只顯示 checkbox grid）。

### 儲存：支出也寫入排除成員

修改 `saveTransaction()` 中的 `excludedMembers` 取值邏輯，從 `isIncome ? getExcludedMembers(...) : ''` 改為不分收支都呼叫 `getExcludedMembers()`。

### 分析：支出分攤改為動態計算

`analytics.js` 中的 `expensePerMember = totalExpense / MEMBERS.length` 改為跟收入相同的邏輯：逐筆讀取 `excludedMembers`，計算每人實際分攤的支出金額。

### 交易列表：支出也顯示分擔資訊

支出的「分擔/墊款」欄目前只顯示墊款人。改為同時顯示分擔人數（若非全員）和墊款人。

## Risks / Trade-offs

- [既有資料相容] → 排除成員為空等同全員分攤，計算結果與改前一致，無風險
- [UI 複雜度增加] → 支出表單多了一組 checkbox，但使用者已熟悉收入的相同操作
