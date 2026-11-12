## Summary

財務總覽與演出收支的三項畫面調整：提示以前年度還沒付清的分潤、手機上把演出收支表改成看得到淨利的清單、把財務總覽縮短。

## Motivation

2026-11-12 的 code review 在實際畫面上量到三個問題，Jesse 同意照建議處理：

- 成員的「未付」是按年度算的，財務總覽預設顯示今年。2027/1/1 起預設畫面是空的 2027 年，但 12 月的分潤正好要在 1/10 出款，傑哥年底一次領的那筆也一樣；不切回去年就看不到還有錢沒付。
- 演出收支表有六欄，在 606px 寬就超出畫面（量到表格 652px、容器 572px），成本被切掉、淨利要橫向捲才看得到；手機更窄。
- 財務總覽在 606px 寬有 7.2 個螢幕高（量測值）。底部的「演出收支」與「演出收支」分頁是同一張完整表格，付費會員同時放了圖和逐月數字表，底部還有一張與分頁重複的「待確認」卡片。

## Proposed Solution

- 財務總覽：以前年度只要有成員還有未付的分潤，在成員分潤區塊上方顯示一行提示（哪一年、幾位、合計多少），點了切到那一年。不改預設年度、不改任何計算。
- 演出收支表：窄螢幕（小於 900px）改成清單，每場一列，左邊名稱與日期、系列，右邊淨利，下面一行小字是收入與成本；附排序用的連結。電腦版維持表格。
- 財務總覽的「演出收支」只列照目前排序的前 5 場，下面一行連結到完整列表；合計仍是全部的合計。
- 付費會員的逐月數字表預設收合（與每月收支圖的「看每月數字」同樣做法）。
- 拿掉財務總覽底部的「待確認」卡片（上方分頁已有待確認與筆數）。

## Non-Goals (optional)

- 不改分潤、預留、共同基金的任何計算規則（虧損年提撥另案，待 Jesse 決定）。
- 不改 /finance/shows 電腦版的表格、不改演出詳細頁。
- 不動資料庫。

## Alternatives Considered (optional)

- 跨年後把預設年度改成「還有未付的最近一年」：會讓「今年」的數字不在預設畫面，容易誤會，所以只加提示。
- 手機上保留表格但凍結名稱欄：仍然要橫向捲才看得到淨利，沒有解決問題。

## Impact

- Affected specs: finance-overview（新）
- Affected code:
  - Modified: platform/lib/finance/calc.ts
  - Modified: platform/lib/finance/calc.test.ts
  - Modified: platform/components/show-pnl-table.tsx
  - Modified: platform/components/charts.tsx
  - Modified: platform/app/(app)/finance/page.tsx
  - Modified: platform/app/globals.css
  - New: none
  - Removed: none
- 不牽動 MCP／plugin：不動任何端點或開發票操作函式。
