## Context

看我笑話工作室管理站台是一個純前端靜態站（GitHub Pages），透過 nav 導覽列切換不同頁面（收支紀錄、演出準備、財務分析、應援匯入）。OPENTIX 票數追蹤系統（opentix-tracker）則是獨立的 Next.js 應用，部署在 Vercel，有自己的 navbar（追蹤管理、數據圖表兩個 tab）。

## Goals / Non-Goals

**Goals:**

- 在 jokesonme 站台新增「票數追蹤」nav tab，以 iframe 載入 opentix-tracker
- opentix-tracker 支援 embed 模式，隱藏自身 navbar 以避免雙重導覽列
- 使用者在 jokesonme 站台內即可操作 opentix-tracker 的所有功能

**Non-Goals:**

- 不整合兩個系統的認證或資料
- 不將 opentix-tracker 的程式碼搬入 jokesonme
- 不修改 opentix-tracker 的功能邏輯

## Decisions

### iframe 嵌入策略

採用全版 iframe（`width: 100%; height: calc(100vh - nav高度)`），讓 opentix-tracker 佔滿 nav 以下的空間。不使用 container 限寬，因為 opentix-tracker 內部已有自己的 `max-w-4xl` 限寬。

### embed 模式實作方式

在 opentix-tracker 的每個 page component 中讀取 `searchParams`，當 `embed=true` 時不 render `<NavBar />`。選擇在各 page 層級判斷而非 layout 層級，因為目前 NavBar 就是在各 page 中引入的，維持現有模式最簡單。

### Vercel URL

iframe src 使用 opentix-tracker 的 production deployment URL（非 preview URL），加上 `?embed=true` 參數。jokesonme 的 opentix.html 頁面不需要 show-selector，因為 opentix-tracker 有自己的演出管理邏輯。

## Risks / Trade-offs

- [跨域限制] iframe 內的 opentix-tracker 與外層 jokesonme 無法直接通訊 → 目前不需要通訊，各自獨立運作即可
- [Vercel URL 變動] 如果 opentix-tracker 的 deployment URL 改變，需要更新 jokesonme 的 iframe src → 使用 production URL 而非 preview URL 可降低此風險
- [行動裝置體驗] iframe 在手機上可能出現雙重捲軸 → iframe 設定 `overflow: hidden` 或確保內層頁面高度自適應
