## Why

前端有兩類健壯性缺陷會造成「使用者以為成功、實際失敗」與潛在破版：

1. **靜默失敗**：js/api.js 的 get／post 不檢查 res.ok、無逾時，且呼叫端多處不檢查 success。最痛的是收支頁 submitTransaction——新增／更新失敗時完全不檢查回傳，表單照樣清空、按鈕還原，使用者以為存好了，實際沒進試算表。GAS 冷啟動慢時尤其容易踩到。
2. **HTML 跳脫不一致**：escapeHtml 在五個 js 檔各自重複實作，import.js 版本缺 null guard（escapeHtml(undefined) 會輸出字串 "undefined"）；shared.js 的 renderShowSelector 直接把專案名稱插進 option 完全未跳脫，專案名含引號或角括號會破版。

此為 OPTIMIZATION_PLAN.md 階段 4（P1 / D1 + D2）。純前端修正，只需推 GitHub Pages，不需重新部署 GAS。

## What Changes

- js/api.js 的 get／post 包 try/catch 與請求逾時，網路錯誤或非 2xx 或 JSON 解析失敗時統一回 { success: false, error: '網路錯誤，請重試' }，讓呼叫端只需檢查 success。
- 收支頁 submitTransaction 檢查回傳 success：失敗時顯示錯誤、保留表單內容、還原按鈕文字（編輯模式還原為「更新」）。巡檢並補上 checklist 等其他未檢查 success 的寫入呼叫點。
- 在 js/shared.js 提供唯一一份含 null guard 的 escapeHtml 與 escapeAttr，移除其餘四個檔案的重複實作；renderShowSelector 等動態插入專案名稱／成員名稱處一律跳脫。

## Non-Goals

- 不改後端 GAS 行為（token、鎖、稅務等皆不動）。
- 不做 D3 共同基金端點收斂（低效益且需重新部署 GAS，延後）。
- 不把 alert 改為 toast（屬 P3 選配）。
- 不改任何財務計算邏輯。

## Capabilities

### New Capabilities

- `frontend-resilience`: 前端韌性——API 呼叫的錯誤正規化與逾時、寫入操作的失敗回饋（不誤清表單）、以及全站一致且安全的 HTML 跳脫。

### Modified Capabilities

(none)

## Impact

- Affected specs: 新增 `frontend-resilience`
- Affected code:
  - Modified: js/api.js（get／post 錯誤處理與逾時）、js/transaction.js（submitTransaction 檢查 success、還原按鈕）、js/shared.js（唯一 escapeHtml／escapeAttr、renderShowSelector 跳脫）、js/analytics.js、js/checklist.js、js/forecast.js、js/import.js（移除重複 escapeHtml、改用 shared 版；checklist 補檢查寫入 success）
- 部署：僅需 commit + push 觸發 GitHub Pages，不需重新部署 GAS。
