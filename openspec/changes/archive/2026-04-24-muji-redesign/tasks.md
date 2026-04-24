## 1. CSS 變數與底色

- [x] 1.1 重寫 `css/style.css` `:root` 變數區——落實 MUJI colour palette（`--bg: #fafaf8`、`--text: #1a1a1a`、`--text-light: #6b6b6b`、`--text-meta: #a0a09b`、`--border: #e8e8e5`、`--border-hover: #c8c8c5`、`--accent: #c9a96e`、`--bg-secondary: #f6f6f3`）
- [x] 1.2 `body` 背景從 `linear-gradient(...)` 改為 `var(--bg)`，對應 Decision: 徹底移除 Liquid Glass 規格 的底色面向
- [x] 1.3 採 Decision: CSS 變數重整而非局部修改——沿用原變數名稱、只換值，減少引用變更

## 2. 移除裝飾效果

- [x] 2.1 刪除所有 `backdrop-filter` 與 `-webkit-backdrop-filter` 屬性（navigation 與 cards），落實 No decorative effects
- [x] 2.2 刪除所有 `box-shadow` 屬性；將 `--shadow`、`--shadow-sm` 變數刪除或留空值
- [x] 2.3 刪除所有 `text-shadow`
- [x] 2.4 採 Decision: border-radius 值採用 0 而非刪除屬性——將 `--radius: 16px`、`--radius-sm: 10px` 改為 `0`；頭像保留 `border-radius: 50%`，落實「Avatar is the only rounded element」
- [x] 2.5 移除所有非頭像的 `linear-gradient` / `radial-gradient` 背景

## 3. 邊框與 chrome

- [x] 3.1 全域邊框改為 `1px solid var(--border)`，落實 Border styling
- [x] 3.2 互動元件 `:hover` 邊框改為 `var(--border-hover)`
- [x] 3.3 Navigation bar 背景改為 `var(--bg)`、下緣保留 `1px solid var(--border)`，不使用毛玻璃

## 4. 語義色降飽和

- [x] 4.1 更新 `--red: #B04237`、`--green: #4A7C59`、`--yellow: #B89056`，落實 Semantic colour exception for financial state 與 Decision: 降飽和語義色的具體取值
- [x] 4.2 更新對應 light 變數 `--red-light` / `--green-light` / `--yellow-light` 為 alpha 0.1 版本
- [x] 4.3 驗證淨利正負、收支標籤、未結清 / 已結清 / 部分結清 badge、預算警示等所有使用點呈現正確
- [x] 4.4 採 Decision: 語義色保留（D2 方案）而非純 MUJI 單色——確認語義色僅用於功能提示，未做裝飾用途

## 5. 字體與 Typography

- [x] 5.1 確認 `body` font stack 符合 Typography 要求（`-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans TC", sans-serif`）
- [x] 5.2 審查 `font-weight`，除 400 / 600 以外全部替換

## 6. emoji 審查

- [x] 6.1 採 Decision: emoji 審查採全面 grep 而非局部替換——掃描 8 個 HTML、所有 JS、CSS 的 emoji 字元範圍
- [x] 6.2 移除 UI chrome 的 emoji（navigation labels、buttons、headings、form labels、static copy），落實 No emoji in UI chrome
- [x] 6.3 確認 transaction notes 等使用者資料欄位的 emoji 保留，落實「User-entered notes preserve emoji」

## 7. Accent 強調色

- [x] 7.1 Accent 色從 `#5B6EF5` 改為 `var(--accent)` = `#c9a96e`，落實 MUJI colour palette 中 Gold accent 的使用限制
- [x] 7.2 審查所有原先使用 `#5B6EF5` 的位置（連結、按鈕 primary 狀態、focus ring），確認新色符合語義

## 8. 舊 spec 清除

- [x] 8.1 確認新 spec 中 REMOVED 了 Frosted glass card style、Gradient background、Frosted glass navigation bar、Glassmorphism fallback 四個 requirement，採 Decision: 徹底移除 Liquid Glass 規格
- [x] 8.2 採 Decision: 保留 glassmorphism fallback 的同時刪除——確認無 backdrop-filter 使用因此不需 fallback

## 9. 驗證

- [x] 9.1 本地瀏覽 8 個頁面（`index.html`、`analytics.html`、`forecast.html`、`checklist.html`、`import.html`、`opentix.html`、`opentix-analytics.html`、`demo.html`），肉眼驗收
- [x] 9.2 Jesse 視覺審查降飽和紅綠黃是否協調，必要時微調 hex 值
- [x] 9.3 確認沒有殘留的 `rgba(255,255,255,...)` 毛玻璃色、沒有漸層背景、沒有 `box-shadow`
