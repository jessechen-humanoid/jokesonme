## 1. opentix-tracker embed 模式

- [x] 1.1 實作 embed 模式實作方式：在 opentix-tracker 的 `page.tsx` 和 `analytics/page.tsx` 加入判斷，embed mode hides navbar in opentix-tracker（`?embed=true` 時不 render NavBar）
- [x] 1.2 部署 opentix-tracker 至 Vercel，確認 `?embed=true` 正常運作

## 2. jokesonme iframe 嵌入頁面

- [x] 2.1 新建 `opentix.html`，以 iframe 嵌入策略載入 opentix-tracker（iframe embed page），iframe 使用 Vercel URL 加 `?embed=true` 參數
- [x] 2.2 在 `js/shared.js` 的 nav pages 陣列新增「票數追蹤」項目（navigation tab for OpenTix Tracker）
