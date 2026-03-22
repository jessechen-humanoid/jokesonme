## Why

使用者在收支紀錄頁選了一檔演出後，切換到演出準備或財務分析再回來，下拉選單會重設為「請選擇演出」，每次都要重新選。這在日常操作中很不方便。

## What Changes

- 選擇演出時，將選中的演出名稱存入 `sessionStorage`
- 頁面載入時，自動從 `sessionStorage` 讀取並還原上次選的演出
- 同一個瀏覽器 session 內跨頁保持，關閉分頁後自動清除

## Capabilities

### New Capabilities

（無）

### Modified Capabilities

- `show-management`: 新增演出選擇的 session 持久化行為

## Impact

- 受影響程式碼：`js/shared.js`（`renderShowSelector` 函式）
