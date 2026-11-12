## Summary

稅務預留從「每個專案、每個分組一筆」改成「每個專案、每個分組、每個年度一筆」，讓已經過去的年度數字不會因為隔年的新收入而變動。

## Motivation

2026-11-12 的 code review 發現：系統自動產生的稅務預留沒有年度的概念，一個專案的同一分組永遠只有一筆，日期跟著該組最新一筆收入走（platform/supabase/migrations/0013_finance_rules.sql 的 finance_sync_tax_reserve 與 platform/lib/finance/calc.ts 的 taxReservesForShow）。

後果（已用 calc.ts 的函式實際跑過）：某科目 2026/12 收入 100,000，2026 年每人分到 9,700；2027/1 同科目再進 10,000 之後，那筆預留變成 −3,300 並移到 2027，2026 年的預留歸零、每人變成 10,000。也就是說去年已經分完的數字會被改掉，兩年的預留全算在新的一年。

會遇到的不只是常年科目（例如「看我笑話會員」，2026/3 到 10 月都有收入）：月號的收入會拖到演出後數週才進完（正式庫實例：9 月號 9/19 演出，收入日期從 8/9 到 10/16），12/19 的 12 月號收入預期會有一部分落在 2027/1。目前正式庫 1,218 筆收支全部在 2026 年，問題還沒發生；必須在 2027 年第一筆收入進來之前上線。

Jesse 2026-11-12 同意照這個方向改。

## Proposed Solution

- 規則：預留依「專案 × 排除成員分組 × 台北日曆年」各自計算。某年度的基礎 = 該年度該組的收入 − 退款（最低 0），預留 = 基礎 × 3% 四捨五入，日期取該年度該組最新一筆收入或退款的日期。
- 資料庫：新增一支 migration，改寫 finance_sync_tax_reserve，並把「每專案每分組最多一筆自動預留」的唯一索引改成包含年度。不更新、不刪除任何現有資料列。
- 程式：calc.ts 的 taxReservesForShow 與 reserve.ts 的 planReserveSync（核對用的對照版本）改成同樣依年度分組，兩邊規則維持一致。
- 測試：資料庫測試與單元測試各加跨年情境。
- 現有資料不受影響：全部在 2026 年，新規則算出來的結果與現況相同（上線前用唯讀查詢確認差異為 0）。

## Non-Goals (optional)

## Alternatives Considered (optional)

- 維持現狀、年底鎖帳：需要新增鎖帳機制與畫面，而且鎖帳後跨年進帳的收入仍然要有地方提列預留，沒有比較簡單。
- 退款跨年時往回扣到原收入的年度：需要把退款對回原始收入，Oen 明細才有這個關聯、手動登記的沒有；而且會回頭改到已經分完的年度，與這次的目的相反。

## Impact

- Affected specs: tax-reserve-calculation
- Affected code:
  - Modified: platform/lib/finance/calc.ts
  - Modified: platform/lib/finance/calc.test.ts
  - Modified: platform/lib/finance/reserve.ts
  - Modified: platform/lib/finance/reserve.test.ts
  - Modified: platform/supabase/test/finance_rules.test.sql
  - New: platform/supabase/migrations/0019_tax_reserve_per_year.sql
  - Removed: none
- 合併後 Jesse 要對正式庫跑 db:migrate（套用 0019）。
- 不牽動 MCP／plugin：財務不在 MCP 包的端點裡，開發票的操作函式沒有改。
