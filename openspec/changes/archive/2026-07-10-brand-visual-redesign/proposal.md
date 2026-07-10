# brand-visual-redesign

## Why

「看我笑話」品牌定位為日系、有質感、簡約、以橘色為主，但後勤平台現行的 MUJI 風設計系統（灰金 accent `#c9a96e`、純黑 CTA、禁圓角）與品牌方向不符：全站沒有任何橘色、中文字型僅是 fallback 名稱未實際載入、圖表配色寫死為綠／紅色階。Jesse 已拍板視覺砍掉重練，不沿用 MUJI 系統。

## What Changes

- **BREAKING**：汰除 `muji-design-system` 全部 requirements（禁圓角、禁陰影、金色 accent 等原則不再適用），由新的 `brand-design-system` 取代
- 建立「暖白×墨×品牌橘」設計系統（已由 Jesse 從三組方向中拍板選定 A 案）：
  - 暖白底 `#FAF7F2`、白色卡片、墨色文字、暖灰邊框
  - 品牌橘 `#FF7A00` 僅用於主要按鈕與關鍵強調；深橘 `#D96400` 用於 hover 與淺底上的橘色文字（對比度補償）
  - 按鈕與輸入框改為圓角矩形（8px）、卡片圓角 10–12px
  - 實際載入 Noto Sans TC webfont（400/500/700），七個正式頁面補 `<link>`
- 圖表配色重建：`js/analytics.js` 寫死的綠／紅 6 色階改為由設計系統定義的去飽和暖色階（收入／支出語意方向保留）
- 財務語意色（正／負／部分結清）重新調校為與暖色調和諧的去飽和色，並定義對應 CSS variables（同時修復 `js/import.js` 引用未定義 `--success` 變數的既有 bug）
- 範圍涵蓋七個正式頁面：index、checklist、analytics、forecast、import、opentix、opentix-analytics（含各 js 動態產生的 HTML）
- 除役已清空的 `liquid-glass-ui` spec 目錄（repo 衛生）

## Capabilities

### New Capabilities

- `brand-design-system`: 看我笑話品牌視覺設計系統——色彩 token（暖白／墨／品牌橘／語意色）、字型載入、圓角與邊框規範、橘色使用限制、圖表配色規範

### Modified Capabilities

- `muji-design-system`: 全部 requirements REMOVED（MUJI 色盤、禁裝飾效果、零圓角、金色 accent、字型堆疊規範皆汰除，由 `brand-design-system` 取代；「UI chrome 禁 emoji」原則移入新 spec 延續）

## Impact

- Affected specs: `brand-design-system`（新增）、`muji-design-system`（整份汰除）、`liquid-glass-ui`（空 spec 目錄移除）
- Affected code:
  - `css/style.css`（token 重定義、元件樣式全面調整）
  - `js/analytics.js`（圖表色階、硬編碼 `#ffffff`）
  - `js/import.js`（`--success` 引用修復）
  - `index.html`、`checklist.html`、`analytics.html`、`forecast.html`、`import.html`、`opentix.html`、`opentix-analytics.html`（webfont `<link>`）
- 不影響：GAS 後端、資料結構、`demo.html`（孤兒展示頁，本次不碰）
