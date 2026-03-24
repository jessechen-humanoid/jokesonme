## Summary

將 jokesonme nav 上的單一「票數追蹤」tab 拆成「追蹤演出」和「追蹤售票」兩個 tab，分別對應 opentix-tracker 的追蹤管理頁和數據圖表頁。

## Motivation

目前只有一個「票數追蹤」tab 載入 opentix-tracker 首頁，使用者無法直接從 jokesonme 進入數據圖表頁，必須在 iframe 內點擊 opentix-tracker 的 navbar 切換。拆成兩個 tab 後，兩個功能都能從 jokesonme nav 一鍵到達。

## Proposed Solution

- 將 nav 的「票數追蹤」改為「追蹤演出」（指向 `opentix.html`，載入 `/`）
- 新增「追蹤售票」tab（指向 `opentix-analytics.html`，載入 `/analytics`）
- 新建 `opentix-analytics.html`，結構與 `opentix.html` 相同，iframe src 指向 `/analytics?embed=true`

## Impact

- 受影響 specs：`opentix-embed`
- 受影響程式碼：`js/shared.js`、`opentix.html`、新增 `opentix-analytics.html`
