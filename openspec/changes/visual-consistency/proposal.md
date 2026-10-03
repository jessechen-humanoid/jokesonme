## Why

Jesse 2026-10-03 回饋：平台字體與層級「忽大忽小、沒有一致性」，很多地方沒對齊，下拉選單外觀怪異。實測 10 個頁面（375px）每頁同時出現 6–8 種字級（11、12、13、14、15、16、18、22、26px）；樣式表另有元件內寫死的字級；選演出面板的單行晶片與多行晶片垂直對齊方式不同；下拉選單用瀏覽器原生外觀。

## What Changes

- 定義四級字級（22／16／14／12）並全平台套用，移除 11、13、15、18px 與元件內寫死的字級。
- 統一卡片與區塊內距為 16px、區塊標題不再額外內縮，巢狀清單文字與上方元件左緣對齊。
- 下拉選單改為與輸入框一致的自訂外觀（同高、同圓角、同底色、自繪箭頭）。
- 選演出面板晶片一律垂直置中。

## Non-Goals

- 不改配色、版面結構、功能與文案。
- 舊版應援匯入頁（public/legacy）的內部樣式不在範圍。

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `brand-design-system`: 新增字級階層、間距對齊與下拉選單外觀規則

## Impact

- platform/app/globals.css（字級 token、內距、select、picker）
- 移除元件內寫死字級：platform/app/(app)/admin/users/page.tsx、platform/app/(app)/finance/analytics/page.tsx、platform/app/login/page.tsx、platform/app/pending/page.tsx、platform/app/liff/[[...path]]/liff-login.tsx
