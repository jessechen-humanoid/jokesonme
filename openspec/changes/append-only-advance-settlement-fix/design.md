## Context

`fix-settlement-advance-accounting` change 已修正「新發 settlement 把代墊還款包進利潤結算」的 bug，但其歷史修正函式 `fixAdvanceSettlements()` 採 in-place mutation（直接把 `成員結算` 那筆 20,000 改成 15,000）。本專案後續對「會計修正」訂出新原則：**既有資料不可修改，只能新增修正紀錄**。同時，該函式從未實際在 sheet 上執行過，所以又又 / 兔子（以及可能所有成員）的歷史資料目前仍是錯的。

受影響邏輯（`js/analytics.js` 成員年度報表）：

```
settled      = sum(成員結算 表中該成員的金額)
unsettledNet = annualNet - settled
advances     = sum(該成員 未結清代墊金額)
toPay        = unsettledNet + advances
```

若某筆 settlement 金額包含了已結清代墊還款（例：20,000 包含 5,000 代墊），則 `settled` 被高估、`unsettledNet` 與 `toPay` 被低估。

## Goals / Non-Goals

**Goals:**

- 把歷史修正策略從 in-place mutation 改為 append-only：不修改任何既有列，只新增負數修正紀錄到 `成員結算`
- 提供 dry-run 預覽，使用者確認後才寫入
- 確保冪等性：重複執行不會重複寫入修正
- 涵蓋全 8 位成員，掃描範圍由 `advancedBy` 欄位決定

**Non-Goals:**

- 不修改 `addSettlement()` 行為（新發 settlement 已正確扣除代墊）
- 不修改 `收支紀錄` 表 schema，也不改變「狀態」欄位的 in-place 更新行為（狀態 flag 屬狀態更新，非歷史資料）
- 不支援部分代墊結清
- 不 archive 既有 `fix-settlement-advance-accounting`，僅取代其中 `fixAdvanceSettlements()` 的內部實作
- 不處理「修正寫錯需要回滾」的情境（靠 idempotency marker 防止重複寫入即可）

## Decisions

### Append-only 修正紀錄而非 in-place mutation

**決定**：對每位需要修正的成員，在 `成員結算` 新增一筆負數紀錄，欄位為「成員 / 負數金額 / 日期 / 備註 = 代墊還款修正」。**不修改任何既有列**。

**為何不選 in-place mutation**：違反使用者明確指示「不能刪除既有資料」；無審計痕跡；無法回滾；若同一筆 settlement 後續又需要修正會更難追溯。

**為何不選新開「代墊還款」獨立工作表**：前端公式 `已收款淨利 = sum(成員結算)` 不需改動就會自動對；新增表會強制改動前端聚合邏輯、影響範圍擴大。

### 修正紀錄的日期 = 該成員最大金額既有 settlement 的日期

**決定**：對成員 M，找出 `成員結算` 中 member = M 的所有既有紀錄，取金額最大那筆的日期作為修正紀錄日期。

**為何不用「修正執行當天」**：年度財務分析按日期切分時，去年的錯會跑到今年的帳期，污染年度報表。

**為何不用「代墊發生當天逐筆對應」**：每筆代墊一筆對應的負數修正，筆數會爆增，且無法跟原 settlement 對齊；對應關係（哪筆代墊還在哪筆 settlement 裡）也無法可靠重建。

**為何不用「最舊或最新 settlement 日期」**：「最大金額」與原 `fixAdvanceSettlements()` 找最大筆 settlement 來扣減的邏輯一致，沿用同樣的「對應關係假設」，行為可預期。

### 備註固定字串「代墊還款修正」作為冪等性 marker

**決定**：所有由本函式新增的修正紀錄，`備註` 欄位固定為「代墊還款修正」字串。執行前掃描既有 `成員結算`，若某成員已存在備註為「代墊還款修正」的列，則該成員跳過。

**為何不用獨立的「修正狀態」欄位**：`成員結算` 表 schema 只有 4 欄（成員 / 金額 / 日期 / 備註），擴充 schema 影響面大；備註欄位字串比對足夠且零侵入。

**為何不靠「金額為負」判斷已修正過**：使用者可能手動新增其他原因的負數紀錄（例：手動退款）；備註字串比金額符號精準。

### Dry-run 預覽強制流程

**決定**：前端「修正代墊帳」按鈕點下後，**強制**先呼叫 `previewAdvanceFix()` 並彈出預覽彈窗，使用者必須按「確認執行」才會呼叫 `fixAdvanceSettlements()` 實際寫入。預覽列出全 8 位成員（即使無需修正也列出，狀態欄標示「無需修正」或「跳過：原因」）。

**為何不沿用「按按鈕直接執行」**：本次涉及多筆寫入，且修正後 `已收款淨利` 數字會明顯變動，使用者需要先確認影響範圍；現行 `fixAdvanceSettlements()` 已內建 `dryRun` 參數但前端沒用，本次把該流程強制成 UI 必經步驟。

### 異常情境：代墊總額 > 結算總額 → warning + 跳過

**決定**：若某成員「已結清代墊」總額 > 其 `成員結算` 所有紀錄總額（含既有正數與本次預備新增的修正之外的其他紀錄），則預覽中該行標示 warning「跳過：代墊金額超過結算總額」，**不寫入** 修正紀錄。

**為何不寫入會導致負數結算**：負數總計的 `已收款淨利` 會讓 `未收款淨利 = annualNet - settled` 出現異常正向偏移，破壞前端公式語意，且代表資料本身有上游錯誤（可能是代墊金額輸入錯誤），不該被本函式靜默吞掉。

## Implementation Contract

#### 觀察行為（end-user / operator）

部署完成後，使用者在 analytics 頁面點「修正代墊帳」按鈕：

1. 系統先載入全 8 位成員的修正預覽，**未寫入任何資料**
2. 彈窗顯示表格，每位成員一行，欄位：成員名 / 歷史結算總額 / 已結清代墊總額 / 將新增修正金額（或「無需修正」或「跳過：原因」） / 修正後預期已收款淨利
3. 使用者按「確認執行」→ 系統對每位需修正成員新增一筆負數紀錄到 `成員結算`，並重新整理成員年度報表
4. 使用者按「取消」→ 無任何寫入，關閉彈窗
5. 修正執行完成後，前端表格中該成員的「已收款淨利」、「未收款淨利」、「需匯款金額」更新為正確值

#### GAS HTTP API 介面

**新增 action：`previewAdvanceFix`**

- HTTP POST，無額外 payload（或允許 `dryRun: true` 但內部固定 dry-run）
- 回傳格式：
  ```
  {
    success: true,
    data: {
      previews: [
        {
          member: string,          // 成員名
          settlementTotal: number, // 歷史結算總額（不含本次將寫入的修正）
          advanceTotal: number,    // 已結清代墊總額
          correctionAmount: number,// 將新增的修正金額（負數），或 0 表示無需修正
          correctionDate: string,  // YYYY-MM-DD，最大金額既有 settlement 的日期；無需修正時為 ""
          expectedSettledAfter: number, // 修正後預期 已收款淨利
          status: "needs-correction" | "no-correction-needed" | "already-corrected" | "skip-overflow",
          reason: string           // status 為 skip-* 或 already-* 時的說明文字
        },
        ...（每位成員一筆，含 8 位全員）
      ]
    }
  }
  ```

**修改 action：`fixAdvanceSettlements`**

- HTTP POST，payload 可選 `dryRun: boolean`（向下相容；本次主要由前端走 preview → confirm 流程，但函式本身仍接受 dryRun 參數作為內部工具）
- 行為：對 `status === "needs-correction"` 的成員，新增一筆 `[member, -advanceTotal, correctionDate, "代墊還款修正"]` 到 `成員結算`；其他 status 的成員跳過
- 回傳格式：
  ```
  {
    success: true,
    data: {
      corrections: [{ member, amount, date, rowAppended: number }, ...],
      skipped: [{ member, reason }, ...]
    }
  }
  ```

#### 失效模式

- **找不到「成員結算」或「收支紀錄」工作表** → `{ success: false, error: '找不到交易或結算工作表' }`，前端顯示錯誤 toast，不彈出預覽
- **某成員代墊總額 > 結算總額** → preview status = `"skip-overflow"`，預覽該行顯示 warning，confirm 後該成員不寫入
- **某成員已有「代墊還款修正」備註紀錄** → preview status = `"already-corrected"`，confirm 後該成員不寫入
- **使用者按取消** → 不呼叫 `fixAdvanceSettlements`，無任何 sheet 寫入

#### 驗收條件

- **手動驗收**：部署後，在 analytics 頁面點「修正代墊帳」→ 看到全 8 位成員預覽 → 確認執行 → 又又、兔子等被影響成員的「已收款淨利」變小、「未收款淨利」與「需匯款金額」變大，且能在 sheet 中找到對應的負數修正紀錄（備註為「代墊還款修正」）
- **冪等性驗收**：再次點「修正代墊帳」→ 預覽顯示所有需修正成員 status = `"already-corrected"`，按確認後 `成員結算` 不新增任何列
- **既有資料保留驗收**：執行修正後檢查 `成員結算` 表，所有原本的列（金額、日期、備註）完全不變；修正只以新增列形式存在
- **公式驗收**：對任意成員 M：`M.已收款淨利 顯示值 = sum(成員結算 表中 member = M 的所有金額)`

#### 範圍邊界

**In scope:**

- 重寫 `gas/Code.gs` 的 `fixAdvanceSettlements()` 為 append-only
- 新增 `gas/Code.gs` 的 `previewAdvanceFix()` 函式
- 新增 GAS HTTP action router 對 `previewAdvanceFix` 的 case
- 重寫 `js/analytics.js` 的 `showFixAdvanceModal()` 流程為「先預覽、後確認」
- 更新 `openspec/specs/member-settlement/spec.md`（透過 delta）

**Out of scope:**

- `addSettlement()` 不動
- `收支紀錄` 表 schema 與「狀態」欄位行為不動
- 前端「成員年度報表」公式（`settled / unsettledNet / toPay / annualNet`）不動 —— append-only 紀錄會自動讓 `sum` 出來的 `settled` 正確
- 其他 GAS 函式不動
- 既有 `fix-settlement-advance-accounting` change 不 archive、不刪
- 既有的 `addSettlement()` 邏輯與其前端表單流程不動

## Risks / Trade-offs

- **修正紀錄日期 = 最大金額 settlement 日期，可能不完全對應實際代墊還款時點** → 接受。此 trade-off 與 `fixAdvanceSettlements` 原始設計「最大筆 settlement 對應代墊還款」假設一致；逐筆精準對應的成本過高且資料不足
- **`成員結算` 表中出現負數紀錄，可能讓不熟悉的使用者困惑** → 備註固定「代墊還款修正」字串足以說明來源；不額外建欄位
- **若某成員代墊金額超過結算總額，本次跳過該成員** → 預覽 warning 提示；使用者需手動檢查上游資料是否錯誤
- **若使用者在預覽彈窗開啟期間，於另一視窗新增/刪除 settlement 或代墊紀錄，confirm 寫入時的金額會與預覽不同** → 接受。生產環境僅單人使用，併發風險低；確認流程已是足夠保護
