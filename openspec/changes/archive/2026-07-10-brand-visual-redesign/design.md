# brand-visual-redesign — Design

## Context

現行 UI 為 2026/04 `muji-redesign` 建立的 MUJI 風系統：米白底 `#fafaf8`、灰金 accent `#c9a96e`、純黑 CTA、全面禁圓角禁陰影。token 已集中於 `css/style.css` 的 `:root`，但 `js/analytics.js` 圖表色階（綠／紅各 6 色）寫死脫離 token，`js/import.js` 引用了從未定義的 `--success` 變數（既有 bug），中文字型僅為 fallback 名稱、未載入 webfont。

Jesse 於 2026/07/10 拍板：視覺砍掉重練、按鈕改圓角矩形、品牌橘取自品牌色票（約 `#FF7A00`）且僅用於重點按鈕；三組方向中選定「A・暖白×墨」（Noto Sans TC、暖白底、8px 圓角）。

## Goals / Non-Goals

**Goals:**

- 建立「看我笑話」品牌設計系統：日系、有質感、簡約、品牌橘點綴
- 全部色彩／圓角／字型決策收斂回 CSS variables，JS 動態 HTML 不再出現脫離 token 的硬編碼色
- 七個正式頁面（index、checklist、analytics、forecast、import、opentix、opentix-analytics）視覺一致

**Non-Goals:**

- 不動 GAS 後端與資料結構
- 不碰 `demo.html`（孤兒展示頁，無站內連結）
- 不做深色模式
- 不重排版面資訊架構（頁面內容與功能布局不變，只換視覺系統）；RWD 僅維持現狀水準，全面行動版優化另案處理
- 架構優化項目（OPTIMIZATION_PLAN 收尾）另開 change，不混入本案

## Decisions

### 色彩 token 全面重定義

`css/style.css` 的 `:root` 汰換為以下 token（舊 token 名沿用者保留名稱、僅換值，減少全檔改名範圍）：

| Token | 值 | 用途 |
|---|---|---|
| `--bg` | `#FAF7F2` | 頁面底（暖白） |
| `--surface` | `#FFFFFF` | 卡片、表格底 |
| `--surface-2` | `#F5F0E8` | 次要底（完成態、inactive、斑馬紋） |
| `--text-primary` | `#33302B` | 主文字（墨） |
| `--text-secondary` | `#6B655C` | 次要文字 |
| `--text-muted` | `#9A938A` | meta、placeholder |
| `--border` | `#E8E2D8` | 預設 1px 邊框 |
| `--border-hover` | `#D3CBBD` | 互動元素 hover 邊框 |
| `--brand` | `#FF7A00` | 品牌橘：主按鈕底、關鍵強調 |
| `--brand-deep` | `#D96400` | 橘 hover；淺底上的橘色文字（對比補償） |
| `--brand-tint` | `#FFF1E4` | 橘色淺底（badge、highlight 列） |

為何不沿用金色系：品牌色票已定為橘，金橘並存會稀釋識別。為何補 `--brand-deep`：`#FF7A00` 配白字對比約 2.4:1，按鈕大字可接受，但小字與純文字場景須用深橘。

### 語意色 token 與 --success bug 修復

財務語意色調校為與暖色調和諧的去飽和值，並補齊 `import.js` 引用的缺失變數：

| Token | 值 | 用途 |
|---|---|---|
| `--success` | `#4A7C59` | 收入、已結清、正值 |
| `--danger` | `#C24E36` | 支出、未結清、負值（原 `#B04237` 微調暖） |
| `--warning` | `#C08A3E` | 部分結清、提醒 |
| `--success-bg` / `--danger-bg` / `--warning-bg` | 各色 alpha 0.1 | 徽章與強調列底色 |

語意色僅用於功能性提示（金額正負、結清狀態、警示），不做裝飾。此決策同時修復 `js/import.js` 的 `--success` 未定義 bug（定義 token 即修復，不改 JS）。

### Noto Sans TC webfont 載入

七個正式頁面 `<head>` 加入 Google Fonts `<link>`（preconnect + css2，weights 400;500;700），字型堆疊改為 `-apple-system, BlinkMacSystemFont, "Noto Sans TC", "Segoe UI", sans-serif`。為何選 webfont 而非續用系統字：日系質感的核心是中文字排印品質，系統字在 Windows 上會落到微軟正黑，質感不可控。取捨：多一個外部依賴與首載字型閃動（以 `display=swap` 緩解）。

### 圓角與邊框規範

- 控制項（按鈕、輸入框、select）：`border-radius: 8px`（token `--radius`）
- 卡片、modal：`border-radius: 12px`（token `--radius-lg`）
- 頭像維持 `50%`
- 邊框一律 `1px solid var(--border)`，互動 hover 轉 `var(--border-hover)`
- 維持無 box-shadow、無漸層、無 backdrop-filter（日系簡約以留白與邊框構成層次，不靠陰影）；focus 狀態用 `--brand-tint` 外框補償

### 品牌橘使用限制

橘色只出現在：主要按鈕（`.btn-primary` 由純黑改 `--brand` 底白字，hover `--brand-deep`）、nav 當前頁指示、關鍵數字或狀態的點狀強調。禁止：大面積鋪色、一般內文、裝飾性色塊。一個畫面同時可見的橘色主按鈕以一顆為原則。

### 圖表配色集中定義

`js/analytics.js` 開頭將寫死的兩組色階收斂為具名常數 `CHART_COLORS`（單一定義點，值與設計系統對齊）：

- 收入色階（6 階，`--success` 家族由深至淺）：`#4A7C59` `#5E8F6C` `#749F80` `#8BB095` `#A3C1AB` `#BCD2C2`
- 支出色階（6 階，`--danger` 家族由深至淺）：`#C24E36` `#CB6650` `#D47D6A` `#DD9585` `#E6ADA1` `#EFC6BD`

為何不改成橘色階：圖表的綠＝收入、紅＝支出是財務語意，改橘會犧牲可讀性；品牌橘保留給操作層（按鈕），資料層用語意色，兩層不打架。`#ffffff` 等圖表內硬編碼改讀 token 或引用常數。

### spec 汰換

- `openspec/specs/muji-design-system/`：本 change 以 delta spec 將全部 requirements REMOVED；「UI chrome 禁 emoji」原則以新 requirement 形式在 `brand-design-system` 延續
- `openspec/specs/liquid-glass-ui/`：已無任何 requirement 的空殼，archive 時直接刪除目錄（repo 衛生，無行為影響）

## Implementation Contract

**可觀察行為**：

1. 任一正式頁面載入後，`body` 背景為 `#FAF7F2`、文字以 Noto Sans TC 渲染（網路可用時）
2. 主要按鈕呈品牌橘底、白字、8px 圓角；hover 轉深橘 `#D96400`
3. 全站找不到灰金 `#c9a96e` 與純黑 CTA；卡片為白底、1px 暖灰邊框、12px 圓角
4. analytics 圓餅圖收入為綠色階、支出為暖紅色階（新色值），圖表不再出現舊綠 `#2d6a4f` 家族／舊紅家族
5. import 頁的結清徽章顏色正常顯示（`--success` 已定義）
6. opentix 兩頁的自帶樣式與主站一致

**驗收條件**：

- `grep -ri "c9a96e" css/ js/ *.html` 零命中；`grep -rn "var(--success)" js/` 命中處在 style.css 皆有對應定義
- 七個正式頁面的 `<head>` 皆含 fonts.googleapis.com 的 Noto Sans TC `<link>`
- 以瀏覽器 preview 逐頁截圖驗證（七頁），並用 computed style 抽查 `.btn-primary` 的 `background-color` 與 `border-radius`
- `demo.html` 的 diff 為零（明確不在範圍內）

**範圍邊界**：in scope＝css/style.css、七個 html 的 head、js 檔中動態 HTML 的顏色類 inline style 與圖表常數；out of scope＝GAS、資料流程、頁面資訊架構、demo.html、RWD 重構。

## Risks / Trade-offs

- [Google Fonts 在無網路／中國網路環境載入失敗] → 字型堆疊保留系統字 fallback，功能不受影響
- [橘白對比不足導致可讀性問題] → 小字與純文字場景一律用 `--brand-deep`，spec 以 requirement 明定
- [JS 動態 HTML 的 inline style 散佈，改版有漏網] → 驗收用 grep 舊色值全掃 + 逐頁截圖，不靠肉眼記憶
- [opentix 頁面含第三方 iframe，內部樣式不可控] → 只保證我方 chrome（nav、容器）一致，iframe 內容明示為不可控範圍
