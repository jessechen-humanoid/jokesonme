## 1. 資料庫

- [x] 1.1 先寫測試：在 platform/supabase/test/finance_rules.test.sql 加跨年情境，涵蓋規格「Automatic tax reserve expense per show and allocation group」的四列範例（只有 2026 收入；2027 再進收入；2027 收入加退款；2027 只有退款）與「改日期跨年」情境，並把檢查索引的那段改成檢查新索引的定義含年度。驗證：在還沒有 0019 的狀態跑 `npm run test:db`（輸出導到檔案、印出退出碼），新情境失敗，而且失敗訊息指出 2026 的預留被改動或合併。
- [x] 1.2 [after: 1.1] 新增 platform/supabase/migrations/0019_tax_reserve_per_year.sql，實作 design.md「依專案、分組、年度三者分組」「跨年退款扣在退款當年」「唯一索引改成包含年度」：改寫 finance_sync_tax_reserve 依排除成員與日期年度分組；索引 transactions_auto_reserve_uq 改成包含年度；不含任何更新或刪除現有資料列的敘述；結尾寫入 _migrations，函式權限只給 service_role。驗證：`npm run test:db` 退出碼 0，1.1 的新情境全部通過，既有情境不變。

## 2. TypeScript 對照版本

- [x] 2.1 「TypeScript 對照版本同步改」：platform/lib/finance/calc.ts 的 taxReservesForShow 依排除成員與年度分組，platform/lib/finance/reserve.ts 的 planReserveSync 用同樣的鍵比對；calc.ts 檔頭與函式註解改寫成新規則並指向 0019。先在 calc.test.ts、reserve.test.ts 加規格範例的跨年案例。驗證：新案例在改程式前失敗、改後通過；`npm test` 退出碼 0。

## 3. 驗收

- [x] 3.1 [after: 1.2] [after: 2.1] 在 platform 跑 `npm run test`、`npm run test:db`、`npm run typecheck`、`npm run lint`，輸出各自導到檔案並印出退出碼。驗證：四個退出碼都是 0。
- [x] 3.2 [after: 2.1] 用新的 TypeScript 規則對正式庫跑 platform/scripts/check-tax-reserves.mts（唯讀，不寫入）。驗證：回報 0 個專案需要調整，代表套用 0019 不會改動現有資料；把輸出貼進 PR。
- [ ] 3.3 [after: 3.1] [after: 3.2] 開 PR：說明寫明新增 migration 0019_tax_reserve_per_year.sql、合併後 Jesse 要對正式庫跑 `npm run db:migrate`、期限是 2027 年第一筆收入進來之前，並寫「不牽動 MCP」。驗證：PR 內文含上述四點與 3.1、3.2 的結果。
- [ ] 3.4 [after: 3.3] Jesse 套用 0019 之後，再跑一次 check-tax-reserves.mts 並查有效自動預留列數。驗證：0 個專案需要調整，列數與套用前相同。
