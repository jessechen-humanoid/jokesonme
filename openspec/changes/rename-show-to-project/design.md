## Context

平台各處使用「演出」一詞，但部分項目（會員、週邊、頻道）並非演出。需改為「專案」使語義更通用。同時會員費匯入目標需修正。

## Goals / Non-Goals

**Goals:**
- UI 文字中的「演出」改為「專案」（排除 checklist 相關的「演出準備」「演出內容」和收入分類「演出票房」）
- GAS Sheet tab「演出清單」→「專案清單」
- 會員費匯入目標改為「看我笑話會員」
- 既有 Google Sheets 資料遷移

**Non-Goals:**
- 不改變 JS 變數名（如 `showName`、`showsList`）— 只改使用者可見文字
- 不改 API action 名稱（如 `getShows`）— 保持 API 相容性

## Decisions

### 只改 UI 文字不改程式碼變數名

變數名改動範圍太大且無使用者價值。`showName` 等內部變數保持不變，只改 UI 顯示文字。

### 用 GAS migration action 修正既有資料

新增一次性 `migrateData` action：
1. Rename sheet tab「演出清單」→「專案清單」
2. 將收支紀錄中 showName=「會員與其他收支」且 category=「付費會員」的紀錄改為 showName=「看我笑話會員」

前端在匯入頁提供「執行資料遷移」按鈕，呼叫後自動完成。

### 保留的「演出」用詞

- 「演出準備」— checklist 頁面標題，確實是演出準備
- 「演出票房」— 收入分類，票房來自演出
- 「演出內容」— checklist 分類

## Risks / Trade-offs

- [風險] Sheet tab 改名後舊版 GAS 會找不到 sheet → migration action 同步處理 rename + code 更新
- [取捨] 不改 API action 名稱，保持向後相容，避免同時更新多處
