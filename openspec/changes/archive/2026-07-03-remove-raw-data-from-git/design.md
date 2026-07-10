## Context

`RAW DATA/` 內的應援撥款明細與活動報名 xlsx 含粉絲個資（姓名、Email、付款紀錄），已於 commit 706ef44 進入 git 歷史並推上公開 GitHub repo（`jessechen-humanoid/jokesonme`，因 GitHub Pages 需公開）。另有 7 個新 xlsx 未追蹤、根目錄 .DS_Store 已被追蹤。目標是徹底移除個資於版本控制中的存在，並防止再犯。

本 change 純屬 git 儲存庫操作，不修改任何應用程式碼，網站功能與 GitHub Pages 部署內容不受影響。

## Goals / Non-Goals

**Goals:**

- git 歷史（所有 branch/tag）中不再存在 RAW DATA 資料夾任何檔案與 .DS_Store。
- .gitignore 規則防止 RAW DATA 資料夾與 .DS_Store 日後被追蹤。
- 本機工作目錄的 RAW DATA 檔案完整保留（僅移出版本控制）。
- 重寫前有完整備份，操作可回復。

**Non-Goals:**

- 不處理 API 安全與密碼問題（OPTIMIZATION_PLAN.md 階段 2 的範圍）。
- 不刪除或搬移本機的 RAW DATA 檔案。
- 不處理 Google Sheets 端的資料。
- 不在本 change 中 commit OPTIMIZATION_PLAN.md（該文件含現行密碼描述，待階段 2 密碼失效後再決定是否入庫）。
- 不處理 fork（目前無已知 fork）。

## Decisions

### 使用 git filter-repo 重寫歷史

選 git filter-repo 而非 BFG Repo-Cleaner 或手動 interactive rebase：filter-repo 是 git 官方文件推薦的工具、以路徑為單位操作最直觀（invert-paths 模式一次移除整個資料夾的所有歷史）、比 BFG 不需要 Java、比手動 rebase 不易出錯。代價是需先安裝（brew install git-filter-repo），且工具會為安全預設移除 origin remote，事後需重新加回。

### 重寫前建立 mirror 備份

在專案資料夾之外建立一份 mirror clone 作為完整備份（含所有 refs）。若重寫出錯或事後發現誤刪，可從備份還原。備份放本機即可，不推到任何遠端。

### force push 前需 Jesse 明確同意

歷史重寫 + force push 是不可逆的破壞性操作（對 remote 而言）。執行 force push 的那一步必須先向 Jesse 口頭確認，並提醒所有持有 clone 的協作者在 push 後重新 clone（不可 pull，會把舊歷史 merge 回來）。

### gitignore 規則涵蓋整個 RAW DATA 資料夾

忽略整個資料夾而非個別副檔名，因為該資料夾的用途就是存放含個資的原始資料，未來任何格式的新檔案都不應入庫。同時加入 .DS_Store 全域規則。

### 向 GitHub 申請清除快取為選配後續

force push 後，舊 commit 在 GitHub 上可能仍可透過 SHA 直接存取（dangling commit 待 GitHub 內部 GC）。GitHub 官方「Removing sensitive data」流程建議可聯絡 GitHub Support 申請清除快取。列為選配後續行動，由 Jesse 決定是否申請。

## Implementation Contract

- **可觀察結果**：
  1. 在專案目錄執行 git log --all --name-only 後以 grep 檢查，無任何 RAW DATA 路徑出現。
  2. git ls-files 輸出不含 RAW DATA 與 .DS_Store。
  3. .gitignore 含 RAW DATA 資料夾、.DS_Store 的忽略規則；在 RAW DATA 內新增測試檔後 git status 不顯示該檔。
  4. 本機 RAW DATA 資料夾檔案數量與內容和操作前一致。
  5. GitHub 網頁上瀏覽 main 分支任一歷史 commit，看不到 RAW DATA 檔案。
- **失敗模式**：filter-repo 執行失敗或結果不符預期時，停止流程、不執行 force push，從 mirror 備份還原後回報。
- **驗收方式**：上述五項可觀察結果逐一手動驗證，全數通過才算完成。
- **範圍邊界**：只動 .gitignore 與 git 歷史；不改任何 js、html、gas 檔案；不 commit OPTIMIZATION_PLAN.md。

## Risks / Trade-offs

- [force push 後協作者誤用舊 clone pull，把舊歷史（含個資）推回] → push 完成後立即通知協作者重新 clone；短期內留意 remote 是否出現非預期 push。
- [filter-repo 誤刪非目標檔案] → 操作前建 mirror 備份；重寫後先在本機驗證檔案清單再 push。
- [GitHub 快取殘留舊 commit] → 列為選配後續：依 GitHub 官方流程聯絡 Support 清除；個資已洩露的時間窗無法回收，只能盡快縮短。
- [GitHub Pages 部署短暫異常] → 歷史重寫不改變 HEAD 檔案內容，Pages 會以新 commit 重新部署相同內容；風險極低，push 後檢查網站可開即可。
