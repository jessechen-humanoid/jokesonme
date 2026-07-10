## 1. API 錯誤正規化

- [x] 1.1 依決策「API 錯誤在 api.js 統一正規化，逾時 30 秒」落實 spec 需求 Normalized API error handling：js/api.js 的 get／post 以 try/catch 包住 fetch 與 res.json()，加 AbortSignal.timeout(30000)，網路錯誤／逾時／非 2xx／JSON 解析失敗一律回 { success: false, error: '網路錯誤，請重試' }，成功維持經 handleUnauthorized 回傳；驗證方式：devtools 設離線送出任一請求，回傳物件 success 為 false 且不拋未捕捉例外

## 2. 寫入失敗回饋

- [x] 2.1 依決策「submitTransaction 失敗不清表單、還原正確按鈕文字」落實 spec 需求 Write-operation failure feedback：js/transaction.js 的 submitTransaction 檢查 add／update 回傳 success，失敗時 alert 錯誤、不清空表單、按鈕還原為編輯模式「更新」或新增模式「新增」，成功維持原重置行為；驗證方式：離線送出交易後錯誤提示出現、分類/金額/備註仍在、按鈕文字正確，恢復連線重送成功
- [x] 2.2 依決策「checklist 等其他寫入呼叫點補檢查 success」落實 spec 需求 Write-operation failure feedback：巡檢 js/checklist.js 的 addChecklistItem 與 updateChecklistItem（assignee／notes 路徑）等未檢查 success 的寫入呼叫，失敗時以 alert 告知；進度切換既有樂觀更新 rollback 維持不動；驗證方式：離線觸發新增待辦或改負責人時出現錯誤提示、不誤報成功

## 3. HTML 跳脫統一

- [x] 3.1 依決策「escapeHtml／escapeAttr 單一實作放 shared.js，其餘檔案移除重複」落實 spec 需求 Consistent HTML escaping：在 js/shared.js 定義唯一含 null/undefined guard 的 escapeHtml 與 escapeAttr，移除 js/transaction.js、js/analytics.js、js/checklist.js、js/forecast.js、js/import.js 內的重複定義並改用 shared 版；驗證方式：grep 統計 js 目錄 escapeHtml 函式定義數為 1，全站頁面渲染正常
- [x] 3.2 依決策「renderShowSelector 等下拉插入值一律跳脫」落實 spec 需求 Consistent HTML escaping：js/shared.js 的 renderShowSelector option value 用 escapeAttr、顯示文字用 escapeHtml，createMemberSelect／createCategorySelect 動態值同樣跳脫；驗證方式：新增名稱含雙引號與角括號的專案，下拉可顯示、可選取、可記帳、頁面不破版

## 4. 部署與驗證

- [x] 4.1 前端 commit + push 觸發 GitHub Pages 部署（本 change 不需重新部署 GAS）；驗證方式：https://jessechen-humanoid.github.io/jokesonme/ 登入後逐頁載入正常、無 console 錯誤
- [x] 4.2 端到端驗證：離線送出交易確認表單不清空且錯誤提示正確、恢復連線重送成功；新增含特殊字元專案名稱確認下拉與記帳正常不破版；驗證方式：上述兩情境於部署後的網站手動操作皆通過
