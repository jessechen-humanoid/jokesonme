<!--
Each task delivers an observable behavior + verification target. File paths are locator context.
-->

## 1. GAS 後端：Append-only 修正紀錄而非 in-place mutation

- [x] 1.1 重寫 `gas/Code.gs` 的 `fixAdvanceSettlements()` 為 append-only：對每位需修正成員，**新增**一筆 `[member, -advanceTotal, correctionDate, "代墊還款修正"]` 列到 `成員結算` 工作表，**不修改任何既有列**。實作後驗證契約：依「Append-only historical advance settlement correction」spec 的 Scenario「First-time correction for member with bundled advance reimbursement」，手動建立測試資料（兔子 20000 + 8000 兩筆既有 settlement，cleared advances 共 5000），執行函式，檢查 `成員結算` 變成 3 筆且既有 2 筆完全不變，新增第 3 筆為 `兔子, -5000, 2026-03-10, 代墊還款修正`。

- [x] 1.2 在 `fixAdvanceSettlements()` 加入「備註固定字串「代墊還款修正」作為冪等性 marker」邏輯：執行前掃描既有 `成員結算`，若某成員已有備註為「代墊還款修正」的列，該成員加入 `skipped` 並 reason = `already-corrected`，**不寫入**新列。驗收：對同一份測試資料連續呼叫函式兩次，第二次呼叫後 `成員結算` 列數不變、回傳 `skipped` 含該成員、reason 為 `already-corrected`（對應「Append-only historical advance settlement correction」spec 的 Idempotency scenario）。

- [x] 1.3 在 `fixAdvanceSettlements()` 加入「異常情境：代墊總額 > 結算總額 → warning + 跳過」邏輯：若某成員 cleared advance total > 該成員所有既有 `成員結算` 列金額總和，加入 `skipped`、reason = `skip-overflow`，**不寫入**修正列。驗收：建立測試資料（大弋 cleared advances 50000、settlements 總和 30000），執行函式，檢查 `成員結算` 該成員無新增列、回傳 `skipped` 含大弋 reason `skip-overflow`（對應 spec 的 overflow scenario）。

- [x] 1.4 在 `fixAdvanceSettlements()` 實作「修正紀錄的日期 = 該成員最大金額既有 settlement 的日期」決定：對每位需修正成員，掃描其在 `成員結算` 的所有既有列（**排除**備註為「代墊還款修正」的列），取金額絕對值最大那筆的日期作為新增修正列的日期。驗收：依測試資料兔子最大筆為 20000 在 2026-03-10，執行後新增列日期欄位 = `2026-03-10`。

- [x] 1.5 保留 `fixAdvanceSettlements()` 對 `dryRun: true` payload 的支援：當 payload 含 `dryRun === true`，函式回傳與正常執行相同結構的 `corrections` / `skipped` 摘要，但**不呼叫 `appendRow`**。驗收：以 `{ dryRun: true }` 呼叫後，`成員結算` 列數不變、回傳 summary 結構正確。

## 2. GAS 後端：Advance settlement correction preview

- [x] 2.1 新增 `previewAdvanceFix(payload)` 函式到 `gas/Code.gs`：執行與 `fixAdvanceSettlements` 相同的分析（settlement totals、cleared advance totals、prior 修正 marker、overflow 檢查），回傳 `{ success: true, data: { previews: [...] } }`，**不寫入任何 sheet**。`previews` 陣列含**全 8 位成員**（依 `MEMBERS` 常數），每筆含 `member` / `settlementTotal` / `advanceTotal` / `correctionAmount` / `correctionDate` / `expectedSettledAfter` / `status` / `reason` 欄位（對應「Advance settlement correction preview」requirement）。驗收：建立混合測試資料（含 needs-correction、no-correction-needed、already-corrected、skip-overflow 四種情境）後呼叫 `previewAdvanceFix`，回傳 previews 陣列長度 = 8，每位成員 status 正確、`成員結算` sheet 列數不變。

- [x] 2.2 在 `gas/Code.gs` 的 HTTP POST action router 新增 `case 'previewAdvanceFix'` 路由，轉派到 `previewAdvanceFix(postData)`。驗收：以 `action=previewAdvanceFix` 對部署的 GAS Web App POST 請求，HTTP 200 回應 body 結構與 2.1 函式回傳一致。

## 3. 前端 Modal：Dry-run 預覽強制流程（Advance fix preview must precede execution in UI）

- [x] 3.1 重寫 `js/analytics.js` 的 `showFixAdvanceModal()` 入口邏輯，落地「Advance fix preview must precede execution in UI」requirement：按 `修正代墊帳` 按鈕後**先呼叫** `previewAdvanceFix`（透過 `js/api.js` 包裝），顯示載入狀態，待回傳後再渲染預覽表格。Modal 必開（即使全成員 status 都是 `no-correction-needed` 或 `already-corrected` 也要顯示，讓使用者明確看到「無需修正」）。驗收：對應「Preview displays even when no correction is needed」scenario — 在乾淨資料狀態下點按鈕，看到 modal 開啟、列出全 8 位成員。

- [x] 3.2 預覽 modal 渲染表格欄位：`成員 / 歷史結算總額 / 已結清代墊總額 / 將新增修正金額（或狀態文字）/ 修正後預期已收款淨利`。對 `needs-correction` 顯示金額；`no-correction-needed` 顯示「無需修正」；`already-corrected` 顯示「已修正過」；`skip-overflow` 顯示 warning 樣式「跳過：代墊金額超過結算總額」。驗收：手動建立含四種狀態的測試資料，點按鈕後檢視 modal 表格，每列文字 / 樣式與 status 一致。

- [x] 3.3 預覽 modal 提供 `確認執行` 按鈕：點下後呼叫 `fixAdvanceSettlements`（非 dry-run），等待回傳後關閉 modal、呼叫既有 `loadAnalytics()`（或同等成員年度報表重新渲染函式）重新整理畫面，並顯示成功 toast 含修正成員數。驗收：對應「Preview then confirm」scenario — 預覽後按確認，`成員結算` sheet 新增對應修正列、analytics 表格中受影響成員的 `已收款淨利` 與 `需匯款金額` 數字更新。

- [x] 3.4 預覽 modal 提供 `取消` 按鈕：點下後關閉 modal，**不呼叫**任何寫入 action。驗收：對應「Preview then cancel」scenario — 點取消後 `成員結算` sheet 列數不變、無 API 寫入請求。

## 4. 部署

- [ ] 4.1 GAS 部署：在 Apps Script editor 操作「管理部署作業 → 建立新版本 → 部署」，確保新版包含 `fixAdvanceSettlements()`（重寫版）與 `previewAdvanceFix()`。驗收：用 curl 或前端對部署 URL 以 `action=previewAdvanceFix` 發送 POST 請求，HTTP 200 並回傳含 `previews` 陣列的 JSON。

- [ ] 4.2 前端部署：git commit 修改檔（`js/analytics.js`、`gas/Code.gs`）並 push 到 `main`，等 GitHub Pages 自動部署完成（`https://jessechen-humanoid.github.io/jokesonme/`）。驗收：以無痕視窗開啟 analytics 頁面，看到「修正代墊帳」按鈕點下後跳出預覽 modal（而非舊版直接執行）。

- [ ] 4.3 生產資料修正執行：在 production analytics 頁面點「修正代墊帳」→ 檢查預覽含全 8 位成員、確認又又 / 兔子等顯示 `needs-correction` → 按確認執行 → 重新檢視成員年度報表，又又 / 兔子的「已收款淨利」變小、「未收款淨利」與「需匯款金額」變大。驗收：直接打開 Google Sheet 的 `成員結算` 工作表，確認新增修正列存在（備註欄為「代墊還款修正」）、且**原本任何列都沒被修改**。

- [ ] 4.4 冪等性生產驗收：再次點「修正代墊帳」按鈕，預覽顯示先前已修正的成員 status = `already-corrected`，按確認後 `成員結算` 列數不增加。
