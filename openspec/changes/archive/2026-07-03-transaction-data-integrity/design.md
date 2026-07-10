## Context

收支紀錄 sheet 目前欄位為 1–11（專案名稱…系統自動）。後端 getTransactions 以陣列索引 + 2 當作 id 回傳（即試算表列號）。recalcTaxReserveForShow 在每次收入異動後刪除該專案的自動稅務列再重新 append，使列號位移；前端拿著舊列號做 update/delete 就會操作到錯誤的列。GAS 無任何鎖。前端 submitTransaction 一律以今天日期送出。此 change 專注資料正確性，屬 OPTIMIZATION_PLAN 階段 3。

## Goals / Non-Goals

**Goals:**
- 交易的識別碼在其生命週期內穩定不變，不受列號位移影響。
- 兩人同時寫入不會產生交錯、重複或錯誤的資料列。
- 編輯既有交易不改變其原始日期。
- 既有交易資料無痛補上 UUID，過程冪等可重跑。

**Non-Goals:**
- 不改 Checklist、成員結算、代墊還款等其他 sheet 的 id 機制。
- 不改稅務預留計算規則。
- 不改前端錯誤處理／逾時（階段 4）。

## Decisions

### 新增第 12 欄 ID，值為 Utilities.getUuid()

在 TX_COL 增加 ID = 12、TX_HEADERS 追加 'ID'。所有寫入交易列的路徑（addTransactionInternal、batchImportTransactions、recalcTaxReserveForShow 的自動稅務列）在 append 時填入 Utilities.getUuid()。getTransactions 回傳該欄值作為 id。選 sheet 欄位存 UUID 而非另建對照表：最小改動、與現有列資料同生共死、無需額外查表。

### update/delete 改以 UUID 掃描定位列，而非直接用列號

updateTransaction／deleteTransaction 收到的 id 改為 UUID：讀取 ID 整欄，找到相符的列號再操作；找不到回 { success: false, error: '找不到該筆交易（可能已被刪除）' }。這是修正「刪錯列」的核心。代價是每次 update/delete 多一次讀取 ID 欄，對此資料量（數百列）可忽略。

### 寫入類 action 在 handleRequest 層包 LockService script lock

對 add/update/delete/batchImport 等會寫入的 action 取得 LockService.getScriptLock() 並 waitLock(20000)，finally 釋放；verifyPassword 與 get 類讀取不上鎖。放在 handleRequest 層而非各函式內：單一切入點、涵蓋含稅務重算在內的整個寫入交易，確保「刪列→補列」整段互斥。script lock（非 user lock）因為所有人共用同一份試算表。

### 前端編輯模式不送 date 欄位

submitTransaction 在 editingId 非空時，update payload 不含 date。後端 updateTransactionInternal 對 undefined 欄位本就不動作，故原始日期保留。新增模式仍送今天日期。不在本 change 加「可編輯日期輸入框」（YAGNI，需要時再做）。

### backfill 以編輯器 Run 的一次性函式執行，不進 API 路由

新增 migrateBackfillTxIds 函式：掃描收支紀錄，對 ID 欄為空的列填入 Utilities.getUuid()，已有值則跳過（冪等）。由 Jesse 於 Apps Script 編輯器 Run 一次，不加入 handleRequest 路由——延續階段 2「不路由一次性 migration」的原則，避免多餘攻擊面與日後清理。

## Implementation Contract

**可觀察行為：**
- getTransactions 回傳的每筆交易 id 為 UUID 字串（非數字列號）。
- 對某 UUID 呼叫 updateTransaction／deleteTransaction，只會影響該 UUID 對應的那一列；即使此前有其他寫入造成列號位移，仍命中正確列。
- 對不存在的 UUID 呼叫 update/delete，回 { success: false, error: '找不到該筆交易（可能已被刪除）' }，不動任何列。
- 兩個並發寫入請求會被序列化，最終稅務預留列數正確、無重複。
- 編輯一筆既有交易的備註後，該列日期欄不變。
- 既有列跑過 backfill 後每列 ID 欄皆有唯一 UUID；重跑 backfill 不改變已有值、不新增列。

**介面／資料形狀：**
- 收支紀錄 sheet 第 12 欄 = ID（UUID 字串）。
- getTransactions 回傳物件 id 欄型別由數字改為字串 UUID。
- updateTransaction／deleteTransaction 的 payload.id 型別為字串 UUID。
- 新增函式 migrateBackfillTxIds（僅供編輯器執行）。

**失敗模式：**
- 找不到 UUID → 明確錯誤訊息，不誤刪。
- 取鎖逾時（20 秒）→ 該次寫入拋錯由既有 try/catch 回 { success:false, error }，使用者可重試；不會半寫入。

**驗收方式：**
- 手動並發測試：兩分頁，一頁新增收入觸發稅務重算造成列號位移，另一頁不刷新直接刪某舊交易，確認 sheet 刪掉的是正確那筆。
- 手動：編輯舊交易備註後，sheet 該列日期不變。
- 手動：Run backfill 後所有列 ID 欄有值；再 Run 一次列數與值不變。
- curl：對假 UUID 呼叫 deleteTransaction 回「找不到該筆交易」。

**範圍邊界：**
- In scope：gas/Code.gs 的 TX 欄位/append/getTransactions/update/delete/handleRequest 鎖/backfill 函式；js/transaction.js 的編輯不送 date 與字串 id。
- Out of scope：Checklist 等其他 sheet、稅務計算規則、前端錯誤處理、其他頁面。

## Risks / Trade-offs

- [既有列 backfill 前，前端仍可能拿到空 id] → 部署順序：先部署新 GAS、立即 Run backfill；backfill 完成前避免大量刪除操作。backfill 冪等可重跑。
- [update/delete 每次多掃一次 ID 欄] → 資料量小（數百列），效能影響可忽略；換得正確性值得。
- [LockService waitLock 逾時造成寫入失敗] → 20 秒足夠一般試算表操作；逾時回明確錯誤讓使用者重試，優於資料交錯。
- [新增 ID 欄後既有讀取邏輯的 numCols 假設] → getTransactions 等以 Math.max(getLastColumn(), N) 讀取，需將 N 由 11 調為 12，確保讀到 ID 欄；未調整會讀不到 UUID。
