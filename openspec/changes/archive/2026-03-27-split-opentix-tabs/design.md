## Context

jokesonme nav 目前有一個「票數追蹤」tab 指向 `opentix.html`，以 iframe 載入 opentix-tracker 首頁。opentix-tracker 有兩個頁面（`/` 追蹤管理、`/analytics` 數據圖表），但只有首頁能從 jokesonme nav 直達。

## Goals / Non-Goals

**Goals:**

- 拆分為兩個 nav tab：「追蹤演出」和「追蹤售票」
- 各自載入對應的 opentix-tracker 頁面（含 `?embed=true`）

**Non-Goals:**

- 不修改 opentix-tracker 的任何程式碼

## Decisions

### Tab 命名與對應

- 「追蹤演出」→ `opentix.html` → iframe 載入 `/?embed=true`（現有，僅改 label）
- 「追蹤售票」→ `opentix-analytics.html` → iframe 載入 `/analytics?embed=true`（新增）

### 頁面結構複用

`opentix-analytics.html` 結構與 `opentix.html` 完全相同，只有 title、iframe src、renderNav active page 不同。

## Risks / Trade-offs

- nav tab 數量增加到 6 個，在窄螢幕上可能擠壓 → 目前可接受，之後需要再改成 hamburger menu
