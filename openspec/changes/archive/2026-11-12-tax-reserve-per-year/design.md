## Context

稅務預留由資料庫函式 finance_sync_tax_reserve(p_show_id) 維護（platform/supabase/migrations/0013_finance_rules.sql）：每次寫入、編輯、刪除收支、Oen 核准、設定參與成員之後，在同一個交易裡重算該專案的預留。它以 excluded_members 分組，每組最多一筆自動預留，並有部分唯一索引 transactions_auto_reserve_uq (show_id, excluded_members) 擋重複（2026-11-12 查過正式庫，這個索引存在）。

platform/lib/finance/calc.ts 的 taxReservesForShow 與 platform/lib/finance/reserve.ts 的 planReserveSync 是同一套規則的 TypeScript 對照版本，只給 platform/scripts/check-tax-reserves.mts 核對用，不在正式寫入路徑上。

年度的定義沿用 calc.ts 的 yearOf：transactions.date 是台北的民用日期，年度就是日期的前四碼。

2026-11-12 的現況（唯讀查詢）：1,218 筆有效收支全在 2026 年；30 組自動預留逐組重算與規則一致、沒有重複。

## Goals / Non-Goals

**Goals:**

- 某年度的預留只由該年度的收入與退款決定，其他年度的收支變動不會改到它。
- 資料庫函式與 TypeScript 對照版本算出相同結果。
- 套用後現有資料一列都不變。

**Non-Goals:**

- 不做年底鎖帳。
- 不把跨年退款往回扣到原收入的年度。
- 不改共同基金在虧損年的提撥規則（另案，尚待 Jesse 決定）。
- 不改財務總覽「稅務預留」卡片上「基礎」的算法與顯示。
- 不處理「以前年度尚未付清」的提示（另案）。

## Decisions

### 依專案、分組、年度三者分組

分組鍵由 (excluded_members) 改成 (excluded_members, 日期的年度)。每組：基礎 = 計入列的金額加總（最低 0）；預留 = −round(基礎 × 0.03)；日期 = 該組計入列的最新日期。預留為 0 的組不建列。計入列的定義不變（正數列，加上「退款」分類或收入分類的負數列；系統自動的預留列不算）。

現有的自動預留列以「排除成員＋自身日期的年度」對應到新的分組。因為預留的日期永遠取自同一年度的計入列，對應關係穩定。

替代方案：在 transactions 加一個 reserve_year 欄位。多一個要維護的欄位，而日期本身已經帶有年度，所以不加。

### 跨年退款扣在退款當年

退款日期落在哪一年，就扣那一年的基礎；該年該組沒有足夠收入時，基礎以 0 為下限，不產生負的預留，也不回頭改前一年。這是已知的取捨：12 月賣的票在 1 月退，1 月那年若沒有其他收入，這筆退款就扣不到預留（預留會多留退款金額的 3%）。Jesse 2026-11-12 接受這個取捨。

替代方案見 proposal 的 Alternatives Considered。

### 唯一索引改成包含年度

移除 transactions_auto_reserve_uq，改建同名索引於 (show_id, excluded_members, (extract(year from date)::int))，條件不變（auto_generated、category = '稅務預留'、deleted_at is null）。先建新索引的替代名稱再換名並非必要：migration 在單一交易內執行，先 drop 再 create 即可。

函式內對同一專案仍用同一把 advisory lock（pg_advisory_xact_lock），所以並行寫入的保護不變。

### TypeScript 對照版本同步改

taxReservesForShow 的分組鍵加上年度（yearOf(t.date)），回傳的 ReserveGroup 型別不變（日期已帶年度）。planReserveSync 比對現有列與應有列時，鍵由 groupKey(excludedMembers) 改成 groupKey 加上日期的年度。

calc.ts 檔頭註解、taxReservesForShow 的註解一併更新為新規則，並把引用改成 0019。

## Implementation Contract

- 行為：
  - 一個專案同一分組在不同年度各有自己的自動預留列；新增、編輯、刪除任何一筆收支後，只有該筆日期所屬年度（編輯日期時是新舊兩個年度）的預留會變。
  - 套用 migration 時不更新、不刪除任何 transactions 列。
- 介面：
  - 資料庫函式簽名不變：finance_sync_tax_reserve(p_show_id uuid) returns void；其他 finance_* 函式不改。
  - taxReservesForShow(showName, showTxs) 與 planReserveSync(existing, desired) 的簽名與回傳型別不變。
  - migration 檔名 0019_tax_reserve_per_year.sql，結尾寫入 _migrations；函式權限維持只給 service_role。
- 失敗情況：
  - 專案不存在時，函式照舊丟出「專案 … 不存在」。
  - 若套用時現有資料已有「同專案、同分組、同年度」的重複自動預留，建唯一索引會失敗、整支 migration 回滾；先用 finance_sync_tax_reserve 逐專案整理後再重跑。
- 驗收：
  - `npm run test:db` 通過，且 platform/supabase/test/finance_rules.test.sql 新增的跨年情境涵蓋規格的四列範例與「改日期跨年」情境；把新函式暫時改回只依分組時，這些新測試要失敗（確認測試抓得到這個 bug）。
  - `npm test` 通過，calc.test.ts 與 reserve.test.ts 有對應的跨年案例。
  - 套用前後各跑一次 platform/scripts/check-tax-reserves.mts（唯讀），都回報 0 個專案需要調整。
  - 套用後查正式庫：有效的自動預留列數與套用前相同（2026-11-12 是 30 組）。
- 範圍：只動 Impact 列出的檔案。不動畫面、不動其他財務規則、不動任何現有資料。

## Risks / Trade-offs

- 跨年退款可能讓預留多留一點（見上方決定）。發生時可以由人工在退款當年登記說明，或日後另案處理。
- 資料庫與 TypeScript 是兩份要同步的規則。靠 check-tax-reserves.mts 與兩邊各自的測試維持一致；這支核對腳本目前要手動跑。
- migration 要由 Jesse 對正式庫執行；在 2027 年第一筆收入進來前沒有套用的話，問題會照原樣發生。套用之後若已經有跨年資料被舊規則合併成一筆，下一次該專案有寫入時會自動拆回各年度；也可以對受影響的專案手動呼叫 finance_sync_tax_reserve。
