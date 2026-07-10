## 1. 前置準備與備份

- [x] 1.1 確認 git-filter-repo 可用：執行 git filter-repo --version 有版本輸出；若未安裝，以 brew install git-filter-repo 安裝後重新驗證
- [x] 1.2 依 design 決策「重寫前建立 mirror 備份」建立完整備份：在專案目錄之外（例如 ~/Backups/jokesonme-backup.git）執行 git clone --mirror 產生含所有 refs 的備份，滿足 spec 需求 History rewrite requires explicit owner approval 的備份前提；驗證方式：備份目錄存在且 git -C <備份路徑> log --oneline -1 能列出與專案相同的最新 commit

## 2. 歷史重寫

- [x] 2.1 ⚠️ 依 design 決策「force push 前需 Jesse 明確同意」，取得 Jesse 明確同意後才可執行本組任務（同意範圍：重寫歷史 + force push + 通知協作者重新 clone），落實 spec 需求 History rewrite requires explicit owner approval；驗證方式：對話中有 Jesse 明確同意的紀錄
- [x] 2.2 依 design 決策「使用 git filter-repo 重寫歷史」從所有歷史移除個資檔案：執行 git filter-repo --invert-paths --path "RAW DATA" --path .DS_Store --force，滿足 spec 需求 Personal data files excluded from version control 的歷史清除條件；完成後 git log --all --name-only 以 grep 檢查無任何 RAW DATA 或 .DS_Store 路徑
- [x] 2.3 重寫後完整性驗證：git ls-files 不含 RAW DATA 與 .DS_Store、其餘檔案清單與重寫前一致（與備份比對檔案數）、本機 RAW DATA 資料夾檔案原封不動；任一項不符即停止，不得 force push，並依 design.md 從 mirror 備份還原

## 3. 防再犯規則與推送

- [x] 3.1 依 design 決策「gitignore 規則涵蓋整個 RAW DATA 資料夾」，.gitignore 加入 RAW DATA 資料夾與 .DS_Store 忽略規則並 commit，滿足 spec 需求 Personal data files excluded from version control 的防再犯條件：完成後在 RAW DATA 內建立測試檔，git status 不顯示該檔（驗證後刪除測試檔）
- [x] 3.2 重新加回 origin remote（filter-repo 會移除 remote）並 force push main：git remote add origin https://github.com/jessechen-humanoid/jokesonme.git 後 git push --force origin main；驗證方式：git ls-remote origin main 的 SHA 與本機 main 一致
- [x] 3.3 遠端驗證：GitHub 網頁上瀏覽 main 與任一歷史 commit 均看不到 RAW DATA 檔案；GitHub Pages 網站 https://jessechen-humanoid.github.io/jokesonme/ 可正常開啟

## 4. 後續行動

- [x] 4.1 提醒 Jesse 通知持有 clone 的協作者重新 clone（不可 pull，避免舊歷史被 merge 回來）；驗證方式：對話中已向 Jesse 明確提出此提醒
- [x] 4.2 （選配，由 Jesse 決定）依 design 決策「向 GitHub 申請清除快取為選配後續」，依 GitHub 官方 Removing sensitive data 流程聯絡 GitHub Support 申請清除舊 commit 快取；驗證方式：Jesse 已決定申請或明確略過
