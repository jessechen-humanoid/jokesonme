## Why

目前 OPENTIX 票數追蹤系統（opentix-tracker）部署在 Vercel，與看我笑話工作室的管理站台是完全分離的。團隊成員需要在兩個網站之間切換才能同時管理收支和追蹤票數。將 opentix-tracker 以 iframe 嵌入 jokesonme 站台，讓團隊在同一個入口就能完成所有工作。

## What Changes

- jokesonme 導覽列新增「票數追蹤」tab
- 新建 `opentix.html` 頁面，以全版 iframe 載入 opentix-tracker
- opentix-tracker 支援 `?embed=true` 參數，啟用時隱藏自身 navbar，避免雙重導覽列

## Capabilities

### New Capabilities

- `opentix-embed`: 透過 iframe 嵌入外部 opentix-tracker 應用，支援 embed 模式隱藏被嵌入端的導覽列

### Modified Capabilities

（無）

## Impact

- 受影響程式碼（jokesonme）：`js/shared.js`（nav 頁面清單）、新增 `opentix.html`
- 受影響程式碼（opentix-tracker）：`src/components/NavBar.tsx`、`src/app/page.tsx`、`src/app/analytics/page.tsx`
- 外部依賴：opentix-tracker Vercel 部署 URL
