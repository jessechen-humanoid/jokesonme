## 1. 換行

- [x] 1.1 依 Slash idea keeps line breaks 修改 `parseCommand`（mention 移除後只壓縮行內空白、保留換行；待辦與行程標題仍單行）；驗證：`npm test` 涵蓋 spec 範例表兩列，原有指令測試維持通過
- [x] 1.2 一次性修復已被壓掉換行的靈感（以 LINE 原始訊息重算，只更新內容不同的列，預設 dry-run）；驗證：dry-run 列出受影響筆數與前後差異，實際執行後查詢該則含換行 [after: 1.1]

## 2. Markdown

- [x] 2.1 依 Idea text renders Markdown 實作 `lib/markdown.ts` 解析與 `components/rich-text.tsx` 繪製，靈感卡片改用；驗證：`npm test` 涵蓋 spec 範例表四列與連結、自動連結；本機截圖一則含標題、條列、粗體的靈感，量測字級只有 12／14／16 [after: 1.1]

## 3. 上線

- [ ] 3.1 部署後請 Jesse 在群組用 `/靈感` 傳一則多行訊息確認換行與 Markdown；驗證：Jesse 確認 [after: 1.2, 2.1]
