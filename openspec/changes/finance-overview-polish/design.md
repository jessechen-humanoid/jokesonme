## Context

- platform/app/(app)/finance/page.tsx 是財務總覽：一次撈全部收支、結算、還款，用 platform/lib/finance/calc.ts 的 memberEarnings(allTxs, settlements, repayments, year) 算該年度每位成員的 annualNet、settled、unsettledNet。年度清單 years 由 yearsOf 產生。
- platform/components/show-pnl-table.tsx 的 ShowPnlTable 是伺服器元件，總覽（compact）與 /finance/shows 共用；排序與篩選靠網址參數。`compact` 目前只多一個 CSS class，不截列。
- platform/components/charts.tsx 的 MonthlyChart 已經用 `<details className="chart-table">` 收合每月數字；MembershipChart 的表格是直接攤開的。
- 版面切換沿用 globals.css 既有的 `.mobile-only`（900px 以上隱藏）與 `.desk-only`（899px 以下隱藏）。

## Goals / Non-Goals

**Goals:**

- 跨年後不用切年度也知道以前年度還有分潤沒付。
- 手機上不用橫向捲就看得到每場的淨利。
- 財務總覽變短，同一份資訊不出現兩次。

**Non-Goals:**

- 不改任何金額的計算。
- 不改 /finance/shows 電腦版表格、演出詳細頁、待確認頁。
- 不動資料庫、不新增端點。

## Decisions

### 以前年度未付用 memberEarnings 逐年算

在 calc.ts 新增純函式 priorYearsUnpaid(allTxs, settlements, repayments, years, year)，對 years 裡每個小於 year 的年度呼叫 memberEarnings，取 unsettledNet 大於 0 的成員，回傳 `{ year, members, amount }[]`（由新到舊，沒有人未付的年度不回傳）。這樣提示上的數字與切到那一年看到的「未付」一定一致。資料全部已在頁面上，不多任何查詢；年度數目很少（目前只有 2026），多算幾次的成本可忽略。

替代方案：另外寫一個跨年度累計的算法。會跟成員卡的數字出現兩套口徑，不採用。

### 手機清單與電腦表格同時輸出、用 CSS 切換

ShowPnlTable 同時輸出 `<table>`（包在 `.desk-only`）與清單（`.mobile-only`）。伺服器不知道螢幕寬度，網址參數的排序兩邊共用。清單每列是一個連結：左側名稱（可換行）、下面一行小字「日期・系列」，右側淨利；再下一行小字「收入 x・成本 y」。清單上方一排排序連結（日期、淨利、收入、成本），目前排序的那個標示方向。合計放在清單最後一列。

替代方案：用 JS 依螢幕寬度切換。這個元件目前不需要 JS，維持伺服器輸出。

### 總覽只列前 5 場

ShowPnlTable 新增 `limit?: number`。有給的時候：排序與篩選後取前 limit 列（演出與科目照目前排序混在一起取，不再分組），下方顯示「看全部 N 項 →」連到 basePath 對應的完整列表（總覽傳 `/finance/shows`，帶著年度與篩選）；合計列照舊加總全部列，文字標成「全部 N 項合計」。沒有給 limit 時行為不變。總覽傳 5。`compact` 參數保留（表格無外框）。

### 付費會員表收合、拿掉待確認卡

MembershipChart 的表格包進 `<details className="chart-table"><summary>看每月數字</summary>…</details>`。財務總覽底部的「待確認」連結卡刪除；頁面仍需要 pending 數字給頁首的分頁用。

## Implementation Contract

- 行為：見規格四條需求。
- 介面：
  - `priorYearsUnpaid(allTxs: Tx[], settlements: Ledger[], repayments: Ledger[], years: readonly string[], year: string): { year: string; members: number; amount: number }[]`，由新到舊。
  - `ShowPnlTable` 新增選填 prop `limit?: number` 與 `moreHref?: string`（「看全部」連結的目的地）；其餘 props 不變。
  - `MembershipChart` 的 props 不變。
- 失敗情況：沒有新的失敗路徑；years 為空或 year 是最早一年時 priorYearsUnpaid 回傳空陣列。
- 驗收：
  - `npm test`：calc.test.ts 新增 priorYearsUnpaid 的案例（規格範例三列），先失敗後通過。
  - 用 esbuild 把 ShowPnlTable 與提示區塊以假資料算成靜態 HTML，套正式的 globals.css，在 375px 寬確認：清單可見、表格不可見、每列淨利在畫面內、`scrollWidth` 等於 `innerWidth`；在 1280px 寬確認相反。
  - 找一個沒看過製作過程的 agent 獨立審查 diff。
  - `npm run test`、`npm run test:db`、`npm run typecheck`、`npm run lint` 退出碼都是 0。
- 範圍：只動 Impact 列出的六個檔案。

## Risks / Trade-offs

- 同時輸出表格與清單，HTML 會大一些（每列約多一倍的標記）；/finance/shows 目前約 30 列，影響小。
- 總覽前 5 場把演出與科目混排；想分開看要進完整列表。
- 提示只看「未付大於 0」：超付（負數）的年度不會提示。
