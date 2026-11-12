## 1. 以前年度未付提示

- [x] 1.1 Prior-year unpaid notice 的計算，對應「以前年度未付用 memberEarnings 逐年算」：先在 platform/lib/finance/calc.test.ts 加 priorYearsUnpaid 的案例（規格範例的三列：有一年未付、較早年度才有未付、最早年度），再在 calc.ts 實作。驗證：新案例在實作前失敗、實作後通過；`npm test` 退出碼 0。
- [x] 1.2 [after: 1.1] Prior-year unpaid notice 的畫面：財務總覽在成員分潤區塊上方，對每個有未付的以前年度顯示一行（年度、人數、合計），連到該年度的總覽；沒有就不顯示。驗證：用假資料算出的靜態 HTML 含「2026 年還有 2 位成員共 $61,458 未付」與 `/finance?year=2026` 連結；沒有未付時不含這個區塊。

## 2. 演出收支

- [x] 2.1 Show profit and loss stays readable on narrow screens，對應「手機清單與電腦表格同時輸出、用 CSS 切換」：ShowPnlTable 在窄螢幕輸出清單（名稱、日期與系列、淨利、收入與成本、排序連結、合計），電腦版維持表格。驗證：靜態 HTML 套正式 globals.css，375px 寬時清單可見、表格不可見、每列淨利的右緣在畫面內、沒有橫向捲動；1280px 寬時相反。
- [x] 2.2 [after: 2.1] Finance overview shows a short show list，對應「總覽只列前 5 場」：ShowPnlTable 加 `limit` 與 `moreHref`；財務總覽傳 5，列出前 5 列、下方「看全部 N 項」連結、合計為全部列的合計；/finance/shows 不受影響。驗證：靜態 HTML 以 8 列假資料、limit 5 輸出 5 列與「看全部 8 項」，合計等於 8 列加總；不給 limit 時輸出 8 列。

## 3. 總覽瘦身

- [x] 3.1 Finance overview avoids duplicated blocks，對應「付費會員表收合、拿掉待確認卡」：MembershipChart 的逐月表包進預設收合的 details；刪除財務總覽底部的待確認連結卡。驗證：靜態 HTML 的會員表在 `<details>` 內且沒有 `open`；finance/page.tsx 不再有連到 `/finance/inbox` 的 `link-row` 卡片，頁首分頁仍收到 pendingCount。

## 3b. 成員卡的出款日

- [x] 3b.1 Member tile shows the last recorded payout，對應「成員卡顯示上次出款，不推算下一次」：calc.ts 新增 lastPayoutByMember（先寫測試）；成員卡改顯示「上次出款 M/D」或「還沒有出款紀錄」；刪除 schedule.ts 的 `member_unsettled` 與 `YEAR_END`。驗證：`npm test` 退出碼 0；用正式庫唯讀查詢每位成員最近一筆正數結算的日期，與畫面規則一致。

## 4. 驗收

- [x] 4.1 [after: 1.2] [after: 2.2] [after: 3.1] 在 platform 跑 `npm run test`、`npm run test:db`、`npm run typecheck`、`npm run lint`，輸出導到檔案並印出退出碼。驗證：四個退出碼都是 0。
- [ ] 4.2 [after: 4.1] 找一個沒看過製作過程的 agent 獨立審查 diff，修完「會壞」「會醜」的項目；開 PR，說明寫「不牽動 MCP」與未驗證事項。驗證：PR 內文含四項自檢結果與審查結論。
