## Why

目前看我笑話工作室網頁採用 Liquid Glass（毛玻璃 + 漸層背景 + 彩色 accent）風格，與只要有人社群顧問的品牌設計系統（MUJI 風格：簡潔、留白、中性色系）不一致。將視覺語言統一到 MUJI 風格，可讓所有公司內部工具有一致的品牌體驗。

## What Changes

- **全頁背景**：彩色漸層 `linear-gradient(135deg, #E8E0F0 → #F0E4E8)` 改為純色 `#fafaf8`
- **移除毛玻璃效果**：所有 `backdrop-filter: blur(20px)` 刪除（navigation、cards）
- **移除立體效果**：所有 `box-shadow`（`--shadow`、`--shadow-sm`）全刪
- **移除圓角**：`--radius: 16px`、`--radius-sm: 10px` 改為 `0`（頭像 `border-radius: 50%` 保留）
- **主要字色**：`#2D2D2D` → `#1a1a1a`
- **輔助字色**：`#777777` → `#6b6b6b`
- **新增淡灰字色**：`#a0a09b`（用於 meta 資訊、placeholder）
- **邊框**：半透明白色改為實線 `1px solid #e8e8e5`，hover 態改為 `#c8c8c5`
- **Accent 色**：`--accent: #5B6EF5`（藍）改為 `#c9a96e`（金，限用於強調）
- **完成/次要底色**：新增 `#f6f6f3`（用於已完成卡片 / inactive 狀態）
- **語義色降飽和（D2 方案）**：
  - 紅 `#E74C3C` → `#B04237`（用於負淨利、支出、未結清警示）
  - 綠 `#27AE60` → `#4A7C59`（用於正淨利、收入、已結清）
  - 黃 `#F39C12` → `#B89056`（用於部分結清、warning）
  - 對應 light 版本降飽和
- **emoji 全面審查移除**：所有 HTML / JS 中的 emoji 檢查並移除
- **禁用 Liquid Glass fallback 規則**：該需求整個廢除
- **字體 stack 保留**：系統字 + Noto Sans TC 符合 MUJI 觀感
- **排版結構保留**：資訊架構不變，只改視覺

## Non-Goals

- 不改動資訊架構（頁面數量、區塊順序、表格欄位）
- 不改動互動行為（按鈕點擊流程、表單驗證）
- 不引入像素缺角 clip-path（那是 8-bit 專用系統）
- 不做 dark mode（MUJI 原則也不使用漸層陰影等暗色常見元件）
- 不修改財務計算邏輯（由 `tax-reserve-and-fund-payment` change 處理）

## Capabilities

### New Capabilities

- `muji-design-system`: MUJI 色盤、禁用效果、邊框 / 字色 / 強調色的視覺規範

### Modified Capabilities

(none — `liquid-glass-ui` will be replaced by `muji-design-system`, see Removed Capabilities below)

### Removed Capabilities

- `liquid-glass-ui`: 整份 spec 廢除（包括毛玻璃卡片、漸層背景、毛玻璃 nav、glassmorphism fallback 四個 requirement）

## Impact

- Affected specs（新建）: `specs/muji-design-system/spec.md`
- Affected specs（刪除）: `liquid-glass-ui` 整份（透過 REMOVED Requirements 標記）
- Affected code:
  - `css/style.css`（幾乎全改：色變數、漸層、圓角、陰影、backdrop-filter、borders）
  - `index.html`、`analytics.html`、`forecast.html`、`checklist.html`、`import.html`、`opentix.html`、`opentix-analytics.html`、`demo.html`（inline style / class 審查與 emoji 移除）
- 相依 change：建議在 `tax-reserve-and-fund-payment` 之後實作，避免 UI 改造與資料邏輯改造的 diff 混雜
