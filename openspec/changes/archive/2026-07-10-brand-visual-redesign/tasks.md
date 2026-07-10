# brand-visual-redesign — Tasks

## 1. 設計 token 基礎

- [x] 1.1 色彩 token 全面重定義：於 `css/style.css` 的 `:root` 實作 spec「Brand colour tokens」的全部 token 值，並汰除舊「MUJI colour palette」色值（`#fafaf8`、`#c9a96e` 等）。完成時頁面底色為 `#FAF7F2`、卡片白底暖灰框。驗證：`grep -ri "c9a96e" css/ js/ *.html` 零命中；preview inspect `body` 的 `background-color` 為 `rgb(250, 247, 242)`。
- [x] 1.2 語意色 token 與 --success bug 修復：實作 spec「Semantic colour tokens for financial state」（取代舊 spec「Semantic colour exception for financial state」），在 `:root` 定義 `--success`、`--danger`、`--warning` 及三個 `-bg` 變體，並確認 JS 動態 HTML 引用的每個 `var(--*)` 皆有定義。完成時 import 頁結清徽章正常顯示綠色。驗證：`grep -rhoE "var\(--[a-z-]+\)" js/ | sort -u` 逐一對照 `:root` 定義；preview 檢查徽章 computed color 為 `rgb(74, 124, 89)`。

## 2. 字型

- [x] 2.1 Noto Sans TC webfont 載入：實作 spec「Typography with loaded webfont」——七個正式頁面（index、checklist、analytics、forecast、import、opentix、opentix-analytics）的 `<head>` 加入 preconnect 與 Google Fonts css2 `<link>`（weights 400;500;700、`display=swap`），`css/style.css` 字型堆疊改為 `-apple-system, BlinkMacSystemFont, "Noto Sans TC", "Segoe UI", sans-serif`。驗證：`grep -l "fonts.googleapis.com" *.html` 列出七檔；preview network 確認字型檔實際載入。

## 3. 元件樣式

- [x] 3.1 圓角與邊框規範：實作 spec「Corner radius and surface styling」（取代舊 spec「No decorative effects」的零圓角規則與「Border styling」的舊邊框色）——控制項 `border-radius: 8px`、卡片與 modal `12px`、頭像 `50%`、邊框 `1px solid var(--border)` hover 轉 `var(--border-hover)`、全站維持無 box-shadow／漸層／backdrop-filter。驗證：preview inspect `.btn-primary` 的 `border-radius` 為 `8px`、卡片為 `12px`；`grep -n "box-shadow\|linear-gradient\|backdrop-filter" css/style.css` 僅允許 focus ring 相關命中。
- [x] 3.2 品牌橘使用限制：實作 spec「Brand orange usage restriction」——`.btn-primary` 改為 `--brand` 底白字、hover `--brand-deep`；nav 當前頁指示改用品牌橘；淺底上的橘色文字一律 `--brand-deep`；無大面積橘色鋪色。驗證：preview inspect `.btn-primary` 的 `background-color` 為 `rgb(255, 122, 0)`、hover 為 `rgb(217, 100, 0)`；七頁逐頁目視確認橘色僅出現於按鈕／nav 指示／關鍵強調。

## 4. JS 動態樣式與圖表

- [x] 4.1 圖表配色集中定義：實作 spec「Chart colour palette」——`js/analytics.js` 開頭建立 `CHART_COLORS` 具名常數（收入綠色階 6 階自 `#4A7C59`、支出暖紅色階 6 階自 `#C24E36`），所有圖表繪製改讀常數，移除舊綠／紅色階與 `#ffffff` 等散落硬編碼。驗證：analytics 頁圓餅圖以新色階渲染（preview 截圖）；`grep -n "#[0-9a-fA-F]\{6\}" js/analytics.js` 命中僅限 `CHART_COLORS` 定義區塊。
- [x] 4.2 動態 HTML inline 樣式收斂：掃描 `js/transaction.js`、`js/checklist.js`、`js/import.js`、`js/forecast.js`、`js/shared.js` 中動態產生 HTML 的顏色類 inline style，全部改讀 CSS variables，同時確認靜態 UI 字串維持 spec「No emoji in UI chrome」。驗證：`grep -n "#[0-9a-fA-F]\{3,6\}" js/*.js` 除 `CHART_COLORS` 外零命中；nav／按鈕／標題無 emoji（grep emoji range 抽查）。

## 5. Spec 汰換與全站驗收

- [x] 5.1 spec 汰換：確認 `muji-design-system` delta（全部 REMOVED）與 `brand-design-system`（ADDED）內容一致無缺漏，並移除已清空的 `openspec/specs/liquid-glass-ui/` 目錄。驗證：`spectra validate brand-visual-redesign` 通過；`ls openspec/specs/liquid-glass-ui` 回報不存在。
- [x] 5.2 全站驗收：依 design.md「Implementation Contract」逐條驗收——七頁 preview 截圖（暖白底、橘色主按鈕、圓角、新字型、新圖表色）、`git diff --stat demo.html` 為零、grep 驗收指令全數通過。驗證：截圖與 grep 輸出附於完成回報。
