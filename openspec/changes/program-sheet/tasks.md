## 1. 資料

- [x] 1.1 依「段落一張表、開始時間放在 shows」新增 0011 migration（`program_items`、`shows.program_start_time` 預設 19:00、audit、RLS、無 DELETE／TRUNCATE），滿足 Program sheet data；驗證：`npm run test:db` 新增測試涵蓋無 actor 被拒、軟刪除留 audit、service_role 硬刪被拒、anon 讀不到，並 `npm run db:migrate` 套用正式庫後跑 `scripts/db-check.sql` 無缺漏
- [x] 1.2 依「時間點與輸出都是純函式」實作 `withTimes`、`rundownHtml`、`rundownText`、`claudePrompt`，滿足 Rundown copy 與 Copy for Claude；驗證：`npm test` 逐列涵蓋 spec 的 cue times 與 row cells 範例表、Claude 文字含所有段落與指令

## 2. 頁面

- [x] 2.1 依「順序用整數 position，上下移動交換兩段」與「從上一場複製」實作 Program sheet editing page（開始時間、新增／編輯／刪除、上移下移、空白時從其他演出複製且伺服器端拒絕覆蓋、finance_partner 不可進）；驗證：本機以測試帳號實際新增 3 段、上移 1 次、刪除 1 次、從另一場複製，`audit_log` 有對應紀錄，375px 截圖 `scrollWidth` 等於視窗寬，測完清除 [after: 1.1, 1.2]
- [x] 2.2 依「複製到剪貼簿同時放 HTML 與純文字」做節目表頁「複製 Rundown」「複製給 Claude」按鈕（ClipboardItem HTML＋純文字、不支援時退回純文字、成功顯示「已複製」）；驗證：本機點按後以 `navigator.clipboard.read()` 讀回確認含 `<table>` 與 7 個欄名，純文字含 tab 分隔 [after: 2.1]
- [x] 2.3 演出頁「節目表」入口顯示段落數與總分鐘數或「還沒有節目表」（Program sheet entry on show page）；驗證：本機開有段落與沒段落的兩場演出頁確認文字與連結 [after: 2.1]

## 3. 上線

- [ ] 3.1 部署並把 10 月號的節目表實際填一份（可從 9 月號 rundown 內容手動建立）讓 Jesse 試用、貼進 Google Doc；驗證：Jesse 確認貼上後是表格且時間點正確 [after: 2.2, 2.3]
