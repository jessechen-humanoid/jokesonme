## Context

js/api.js 的 get／post 目前直接 fetch 後 return handleUnauthorized(await res.json())，不檢查 res.ok、無逾時；GAS 冷啟動慢，偶發網路錯誤或非 JSON 回應會讓 res.json() 拋錯，呼叫端拿到 rejected promise 或未定義行為。收支頁 submitTransaction 對 add／update 回傳完全不檢查，失敗仍清空表單。escapeHtml 在 transaction.js／analytics.js／checklist.js／forecast.js／import.js 各有一份，import.js 版缺 null guard；shared.js 的 renderShowSelector 用未跳脫的專案名稱組 option。屬 OPTIMIZATION_PLAN 階段 4（D1 + D2），純前端。

shared.js 在每個頁面都於其他頁面 js 之前載入，故其定義的函式全站可用。

## Goals / Non-Goals

**Goals:**
- 任何 API 呼叫失敗（網路、逾時、非 2xx、非 JSON）都回傳統一形狀 { success: false, error }，呼叫端只需檢查 success。
- 寫入操作失敗時使用者看得到錯誤、表單內容不被清空、按鈕文字正確還原。
- 全站僅一份含 null guard 的 escapeHtml／escapeAttr；動態插入使用者可控字串處一律跳脫。

**Non-Goals:**
- 不動後端 GAS。
- 不做 D3（共同基金端點收斂）。
- 不改 alert 為 toast。

## Decisions

### API 錯誤在 api.js 統一正規化，逾時 30 秒

get／post 以 try/catch 包住 fetch 與 res.json()，並加 AbortSignal.timeout(30000)。任何例外（網路中斷、逾時、abort）或 res.ok 為 false 時，回傳 { success: false, error: '網路錯誤，請重試' }；成功則照常經 handleUnauthorized 回傳。逾時取 30 秒因 GAS 冷啟動可能達十餘秒，過短會誤判。好處：呼叫端一律只需檢查 success，不需各自 try/catch。

### submitTransaction 失敗不清表單、還原正確按鈕文字

submitTransaction 對 addTransaction／updateTransaction 的回傳檢查 success：失敗時 alert 錯誤訊息、直接 return（不執行既有的清空表單邏輯）、並將按鈕還原為對應模式文字（編輯模式為「更新」、新增模式為「新增」）——修正目前失敗後一律寫死「新增」的錯誤。成功路徑維持原行為。

### escapeHtml／escapeAttr 單一實作放 shared.js，其餘檔案移除重複

在 shared.js 定義唯一的 escapeHtml(str)（含 null／undefined guard，回空字串）與 escapeAttr(str)，移除 transaction.js／analytics.js／checklist.js／forecast.js／import.js 內的重複定義，全部改用 shared 版。因 shared.js 先載入，直接可用。

### renderShowSelector 等下拉插入值一律跳脫

renderShowSelector 的 option value 用 escapeAttr、顯示文字用 escapeHtml；createMemberSelect／createCategorySelect 的動態值同樣檢查。修正專案名稱含引號／角括號時破版與潛在注入。

### checklist 等其他寫入呼叫點補檢查 success

巡檢 checklist.js 的 addChecklistItem 與 updateChecklistItem（assignee／notes／progress 路徑）等未檢查 success 的寫入呼叫，失敗時以 alert 告知；進度切換的樂觀更新已有 rollback，維持不動。

## Implementation Contract

**可觀察行為：**
- 斷網或 GAS 逾時時送出任一 API 呼叫，回傳 { success: false, error: '網路錯誤，請重試' }，不拋未捕捉例外。
- 斷網時於收支頁按「新增」，跳出錯誤提示、表單的分類／金額／備註內容仍在、按鈕文字回到「新增」（編輯模式回到「更新」）；恢復網路後重送成功。
- 新增名為含引號與角括號的專案（例如 A 引號 B 角括號 C），專案下拉可正常顯示與選取、可記帳，頁面不破版。
- 全專案 js 目錄中 escapeHtml 的函式定義僅一處。

**介面／資料形狀：**
- api.js get／post 恆回傳物件且必有布林 success 欄位。
- shared.js 匯出（全域）escapeHtml(str)、escapeAttr(str)。

**失敗模式：**
- fetch 逾時（30 秒）／網路錯誤／非 2xx／JSON 解析失敗 → { success: false, error: '網路錯誤，請重試' }。
- 既有 unauthorized 處理（清 token、重顯示密碼閘門）維持不變。

**驗收方式：**
- 手動：瀏覽器 devtools 設離線，收支頁送出交易，確認錯誤提示 + 表單不清空 + 按鈕文字正確；恢復連線重送成功。
- 手動：新增含特殊字元專案名稱，下拉正常、可記帳、無破版。
- 指令：grep 統計 js 目錄 escapeHtml 定義數為 1。

**範圍邊界：**
- In scope：js/api.js、js/transaction.js、js/shared.js、js/analytics.js、js/checklist.js、js/forecast.js、js/import.js 的錯誤處理、跳脫與重複移除。
- Out of scope：GAS、共同基金端點、alert→toast、財務計算。

## Risks / Trade-offs

- [移除各檔 escapeHtml 後若某檔在 shared.js 之前使用] → shared.js 於所有頁面最先載入，且這些函式在事件與渲染時才呼叫（非模組載入期），無時序問題；部署後逐頁點一輪確認。
- [30 秒逾時對極慢冷啟動仍可能誤判] → 取 30 秒為務實折衷；逾時回可重試錯誤，使用者重送即可。
- [統一錯誤訊息較籠統] → 對此小工具足夠；需要時未來可帶入更細的後端 error 字串。
