## Context

成員年度報表的「已收款淨利 / 未收款淨利 / 代墊未結清 / 需匯款金額」是這樣算的（`js/analytics.js`）：

```
settled      = sum(成員結算 該成員所有金額)
unsettledNet = annualNet - settled
advances     = sum(該成員 未結清代墊)        // 用 收支紀錄「狀態」欄
toPay        = unsettledNet + advances
```

問題：歷史上把「代墊還款」金額夾進了 `成員結算`（例：柏文匯 37,665 = 30,000 利潤 + 7,665 代墊還款，整筆當利潤存入），導致 `settled` 虛高。上一個 change 試圖用 `fixAdvanceSettlements()` 自動掃描「已結清代墊」並從結算扣除來修正，但「已結清」狀態無法區分「夾在結算裡還的」vs「還沒還或另外還的」，於是對柏文 / 又又 過度扣減。

production 經 xlsx 對帳後的真實狀態（下載快照 2026-06-04，已含上次跑錯的修正列）：

| 成員 | 成員結算現值 | 應有純利潤 | 代墊總額 | 已還代墊 | 還欠代墊 | 上次錯誤修正 |
|---|---|---|---|---|---|---|
| 柏文 | 21,920 | 30,000 | 15,745 | 7,665 | 8,080 | -15,745（錯，應 -7,665）|
| 又又 | 24,000 | 30,000 | 14,380 | 8,380 | 6,000 | -14,380（錯，應 -8,380）|
| 芭樂 | 30,000 | 30,000 | 1,600 | 1,600 | 0 | -1,600（正確）|
| 兔子 | 30,000 | 30,000 | 6,000 | 6,000 | 0 | -6,000（正確）|

其餘成員（傑哥 0、巧達 30,000、大弋 / 竹節蟲 69,850）無代墊、結算正確。

## Goals / Non-Goals

**Goals:**

- 代墊還款獨立成 append-only 帳本，與利潤分配（成員結算）徹底分離
- 報表用「代墊總額 − 代墊已結清(帳本)」推導代墊未結清，不再依賴交易狀態
- 廢掉自動偵測式修正，移除其前後端
- 一次性把 production 被改錯的資料導回正確狀態，且全程 append-only / 不刪 Jesse 手動輸入的原始列
- 報表恆等式成立：代墊已結清 + 代墊未結清 = 代墊總額

**Non-Goals:**

- 不綁定「還款」到特定代墊交易列（記總額）
- 不改 `年度分配淨利` 計算邏輯
- 不改 `收支紀錄` schema
- 不自動修正「超還」（已結清 > 總額），僅警示
- 不保留「需匯款金額」欄（依 Jesse 指示改成「代墊已結清」）

## Decisions

### 雙帳本架構：成員結算記利潤、代墊還款記還款

`成員結算` 只存利潤分配；新增 `代墊還款` 工作表（欄位：成員 / 金額 / 日期 / 備註）只存代墊還款。兩本都 append-only。報表把兩者分開呈現。

**替代方案**：維持單帳本、用負數修正列在 `成員結算` 內表達還款。否決——會讓「已收款淨利 = sum(成員結算)」這個直覺公式被污染，且無法獨立查詢「總共還了多少代墊」。

### 代墊未結清改用「總額 − 帳本」推導，不再讀交易狀態

`代墊總額` = 收支紀錄中 `墊款人 = 該成員` 的所有交易金額絕對值加總（不分結清狀態）。`代墊已結清` = `代墊還款` 帳本該成員加總。`代墊未結清` = 代墊總額 − 代墊已結清。

**替代方案**：沿用交易「結清狀態」欄算未結清（Option A）。否決——部分還款無法乾淨對應單筆交易，且狀態欄已被舊流程污染成全部已結清。

### 廢掉自動偵測修正（fixAdvanceSettlements / previewAdvanceFix）

整組移除：GAS 兩個函式 + action 路由、`js/api.js` 兩個 wrapper、`js/analytics.js` 的 `showFixAdvanceModal()` 與「修正代墊帳」按鈕。

**替代方案**：保留並加啟發式判斷。否決——「已結清」不帶「是否夾在結算裡」資訊，再多啟發式都是猜。

### 結算回歸純利潤，移除「一起結清代墊」流程

`addSettlement()` 簡化為只存利潤金額（移除 `includeAdvances` 拆分與標記代墊已結清的邏輯）。結算 modal 移除代墊區塊與「一起結清代墊」checkbox。代墊還款改由獨立的「新增代墊還款」入口處理。

**替代方案**：保留結算夾帶代墊、同時寫兩本帳。否決——夾帶正是污染來源，要斷乾淨。

### 成員年度報表欄位改版

欄位改為：`成員 / 已收款淨利 / 未收款淨利 / 代墊未結清 / 代墊已結清 / 年度分配淨利`。移除「需匯款金額」欄（依 Jesse 指示）。

- 已收款淨利 = sum(成員結算 該成員) 〔純利潤〕
- 未收款淨利 = 年度分配淨利 − 已收款淨利
- 代墊已結清 = sum(代墊還款 帳本 該成員)
- 代墊未結清 = 代墊總額 − 代墊已結清
- 若 代墊未結清 < 0（超還）→ 顯示警示樣式，數值照實顯示

### 一次性歷史資料遷移（migrateAdvanceLedger）

提供一次性 GAS 函式 `migrateAdvanceLedger()`，把 production 導回正確狀態：

1. **修正 `成員結算` 至純利潤**（append-only，只刪上次機器跑錯的列）：
   - 刪除上次自動偵測產生的兩筆錯誤修正列：柏文 `-15,745`、又又 `-14,380`（備註「代墊還款修正」、日期 2026-04-27）。這兩列是程式錯誤產物、非 Jesse 手動輸入，故可刪。
   - 新增正確的利潤校正列：柏文 `-7,665`、又又 `-8,380`（備註「代墊還款移轉至代墊還款帳本」、日期沿用各自最大筆結算日期）。
   - 芭樂 `-1,600`、兔子 `-6,000` 既有修正列正確，保留不動。
   - 遷移後 `成員結算` 加總：柏文 / 又又 / 芭樂 / 兔子 / 巧達 = 30,000；大弋 / 竹節蟲 = 69,850；傑哥 = 0。
2. **植入 `代墊還款` 帳本初始資料**（每人實際已還金額）：
   - 柏文 7,665、又又 8,380、芭樂 1,600、兔子 6,000；日期沿用各自 6 月結算日期、備註「歷史代墊還款（自結算拆出）」。
3. **冪等保護**：函式執行前檢查 `代墊還款` 是否已有「歷史代墊還款」標記列；若有則整個遷移跳過，回傳 already-migrated。

遷移後驗證：每位成員「代墊已結清 + 代墊未結清 = 代墊總額」成立；柏文已收款淨利 = 30,000、代墊已結清 = 7,665、代墊未結清 = 8,080。

**前提**：純利潤 30,000 / 69,850 等數字由 Jesse 確認（標準分期 4 月 20,000 + 6 月 10,000；大弋 / 竹節蟲 含直球專場）。

### 處理被取代的 change

`append-only-advance-settlement-fix`（applied、未 archive）方向已被本 change 取代，其 spec deltas（append-only correction / preview / preview-before-execution UI）不應再被合併。實作時將該 change drop（`spectra` 移除其目錄）或標記 superseded，避免日後誤套。

## Implementation Contract

#### 觀察行為

部署 + 遷移後，使用者在 analytics 頁面看到：

- 成員年度報表欄位為：成員 / 已收款淨利 / 未收款淨利 / 代墊未結清 / 代墊已結清 / 年度分配淨利（無「需匯款金額」、無「修正代墊帳」按鈕）
- 柏文列：已收款淨利 30,000、代墊已結清 7,665、代墊未結清 8,080
- 又又列：已收款淨利 30,000、代墊已結清 8,380、代墊未結清 6,000
- 芭樂 / 兔子列：已收款淨利 30,000、代墊已結清 = 代墊總額、代墊未結清 0
- 結算區有「新增結算」（純利潤）與「新增代墊還款」兩個入口
- 新增結算 modal 不含代墊區塊與「一起結清代墊」checkbox

#### GAS HTTP API 介面

**新增 sheet 常數**：`SHEET_NAMES.ADVANCE_REPAYMENTS = '代墊還款'`，表頭 `['成員', '金額', '日期', '備註']`。

**新增 action `getAdvanceReimbursements`**（GET）：回傳 `{ success: true, data: [{ member, amount, date, notes }, ...] }`，讀自 `代墊還款` sheet（不存在則建表回空陣列）。

**新增 action `addAdvanceReimbursement`**（POST）：payload `{ member, amount, date?, notes? }`；append 一列到 `代墊還款`；回傳 `{ success: true, data: { member, amount } }`。amount 必填且 > 0，否則 `{ success: false, error: '成員和金額為必填' }`。

**新增一次性 action `migrateAdvanceLedger`**（POST）：執行上述遷移計畫；回傳 `{ success: true, data: { settlementsAdjusted: [...], reimbursementsSeeded: [...], status } }`，status ∈ `migrated` / `already-migrated`。

**簡化 `addSettlement`**：payload `{ member, amount, date?, notes? }`，只 append 純利潤列到 `成員結算`，不再接受 `includeAdvances`、不再掃描或標記代墊。

**移除 action**：`fixAdvanceSettlements`、`previewAdvanceFix` 及其 router case 與函式。

#### 失效模式

- 找不到 `成員結算` 或 `收支紀錄` 工作表 → `{ success: false, error: '找不到交易或結算工作表' }`
- `migrateAdvanceLedger` 重複執行 → 偵測到「歷史代墊還款」標記列，回傳 status `already-migrated`、不重複寫入
- 某成員 代墊已結清 > 代墊總額（超還）→ 報表該列代墊未結清顯示負值 + 警示樣式，不阻擋
- `addAdvanceReimbursement` 金額 ≤ 0 或無成員 → 回傳必填錯誤

#### 驗收條件

- **遷移正確性**：執行 `migrateAdvanceLedger` 後，直接看 Google Sheet——`成員結算` 加總 柏文/又又/芭樂/兔子 = 30,000；`代墊還款` 有 4 筆「歷史代墊還款」初始列（7,665 / 8,380 / 1,600 / 6,000）；Jesse 手動輸入的 4 月、6 月結算原始列完全未被刪改
- **報表正確性**：analytics 成員年度報表柏文列 已收款淨利 30,000 / 代墊已結清 7,665 / 代墊未結清 8,080；又又列 30,000 / 8,380 / 6,000
- **恆等式**：每位成員 代墊已結清 + 代墊未結清 = 代墊總額
- **冪等性**：再次呼叫 `migrateAdvanceLedger` 回傳 already-migrated，sheet 無變化
- **舊機制移除**：analytics 頁無「修正代墊帳」按鈕；對 GAS 發 `action=previewAdvanceFix` 回「未知的 action」
- **結算純利潤**：新增結算 modal 無代墊區塊；新增一筆結算只寫一列純利潤到 `成員結算`

#### 範圍邊界

**In scope:**

- `gas/Code.gs`：新增 `代墊還款` sheet 常數與 `getAdvanceReimbursements` / `addAdvanceReimbursement` / `migrateAdvanceLedger`；移除 `fixAdvanceSettlements` / `previewAdvanceFix` 與其路由；簡化 `addSettlement`
- `js/api.js`：新增兩個 reimbursement wrapper + migrate wrapper；移除兩個舊 wrapper
- `js/analytics.js`：成員年度報表欄位 / 公式改版；移除 `showFixAdvanceModal` 與「修正代墊帳」按鈕；新增「新增代墊還款」modal 與入口；簡化結算 modal
- 三份 spec delta（member-settlement、per-member-projected-earnings、financial-analytics）
- production 一次性遷移

**Out of scope:**

- `收支紀錄` schema 與其「結清狀態」欄位本身不動（只是報表不再讀它算代墊未結清）
- `年度分配淨利` 計算邏輯不動
- 結算分期邏輯不動
- 部分代墊還款對應單筆交易、超還自動修正

## Risks / Trade-offs

- **遷移依賴 Jesse 確認的純利潤數字** → 已透過 xlsx 對帳 + Jesse 口頭確認（30,000 / 69,850）；遷移函式把這些數字寫死，執行前會在 PR / commit 留紀錄
- **刪除上次的兩筆錯誤修正列** → 這兩列是機器錯誤產物（非手動輸入），刪除符合「保護手動原始資料」原則；遷移前建議 Jesse 另存一份 sheet 快照備援
- **報表不再讀代墊狀態** → 代墊交易的「結清狀態」欄變成 vestigial，未來若有其他功能依賴它需另行確認（本次掃描確認僅報表與已廢除的自動修正在用）
- **代墊還款記總額、不綁交易** → 無法回答「哪一筆代墊還了沒」，但符合 Jesse 實際工作流（還款是金額、不是逐筆勾稽）
