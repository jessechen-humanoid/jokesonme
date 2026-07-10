## Why

`RAW DATA/` 資料夾內的應援撥款明細與活動報名 xlsx 檔案含有粉絲個資（姓名、Email、付款紀錄），其中一批已在 commit 706ef44 進入 git 歷史並推上公開的 GitHub repo（GitHub Pages 部署需公開 repo），等於個資公開在網路上；另有 7 個新檔案尚未被追蹤但也沒有 gitignore 保護，隨時可能被誤 commit。此為 OPTIMIZATION_PLAN.md 階段 1（P0-A / 任務 A1），是全計劃最優先事項。

## What Changes

- `.gitignore` 加入 RAW DATA 資料夾與 .DS_Store 的忽略規則，杜絕日後誤 commit。
- 將已被追蹤的 RAW DATA 檔案與 .DS_Store 移出 git 追蹤（本機檔案保留）。
- **BREAKING**：以 git filter-repo（或等效工具）重寫 git 歷史，徹底移除 RAW DATA 相關檔案後 force push 到 origin/main。所有既有 clone 的歷史將失效，協作者需重新 clone。
- 驗證 GitHub 上（含歷史 commit 頁面）已無法存取這些檔案。

## Capabilities

### New Capabilities

- `repo-data-hygiene`: 版本控制庫的個資與暫存檔案防護規則——含個資的原始資料檔案不得進入 git 追蹤與歷史。

### Modified Capabilities

(none)

## Impact

- Affected specs: 新增 `repo-data-hygiene`
- Affected code:
  - Modified: .gitignore
  - Removed: git 追蹤中的 RAW DATA 資料夾全部檔案、.DS_Store（僅移出版本控制，本機檔案保留）
- 外部影響：GitHub remote 歷史被重寫（force push）；執行前需 Jesse 明確同意，並通知持有 clone 的協作者重新 clone。GitHub Pages 部署不受影響（檔案內容不變，僅歷史改寫）。
