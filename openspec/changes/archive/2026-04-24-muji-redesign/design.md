## Context

看我笑話工作室網頁目前用 Liquid Glass 風格——彩色漸層背景、毛玻璃卡片、柔和陰影、大圓角、藍色 accent。要整體換成只要有人社群顧問的 MUJI 品牌設計系統。

參考文件：`My-Vault/skills/設計系統.md` 定義了 MUJI 色盤與禁用規則（無陰影、無漸層、無圓角、無新增色碼、不用像素缺角）。

主要檔案：
- `css/style.css`（集中度高，大部分變更發生在此）
- 8 個 HTML 檔（inline style + class 使用）
- JS 檔（動態產生的 HTML 片段，少量樣式字串）

## Goals / Non-Goals

**Goals:**

- 視覺風格完全符合 MUJI 設計原則（簡潔、留白、中性色）
- 財務工具最關鍵的「正負號一眼辨識」能力不被犧牲（故保留降飽和的紅綠黃）
- CSS 變數集中管理，未來微調容易
- 舊 Liquid Glass spec 被新 MUJI spec 乾淨取代

**Non-Goals:**

- 不改變資訊架構（頁面 / 區塊 / 欄位順序）
- 不改變互動流程
- 不做 dark mode
- 不引入像素缺角 clip-path（8-bit 系統專屬）

## Decisions

### Decision: 語義色保留（D2 方案）而非純 MUJI 單色

**選擇**：MUJI 色盤套在 chrome（背景、卡片、邊框、字）；紅綠黃語義色保留但降飽和版本，專門用在財務數字 / 結清狀態 / 警示。

**替代方案**：
- D1 嚴格 MUJI：全部單色，正負用符號 + 粗體表達。代價是財務工具每天快速掃視損益的效率大幅降低。
- D3 只用金色當 accent：負數全黑粗體、正數金色。一眼分不出正負，不適合財務場景。

**理由**：MUJI 禁止「裝飾色」新增，但財務工具的紅綠屬於「功能色」——是資料意義的一部分。降飽和可以讓它視覺上協調，不破壞 MUJI 感。

### Decision: 降飽和語義色的具體取值

**選擇**：紅 `#B04237`、綠 `#4A7C59`、黃 `#B89056`；對應 light 背景色 alpha 0.1。

**替代方案**：
- 維持原飽和色（`#E74C3C` 等）：與 MUJI chrome 併用顯得突兀
- 更極端降飽和（近灰）：辨識度下降

**理由**：這組值是透過降 saturation 30-40% 的中間點，既能保留辨識也能與 MUJI 中性色盤相容。實作後可根據視覺審查微調。

### Decision: 徹底移除 Liquid Glass 規格

**選擇**：在新 spec 中 REMOVED 整份 `liquid-glass-ui`（4 個 requirement 全刪），同時 ADDED MUJI 規格 requirements。

**替代方案**：
- 保留舊 spec 作為歷史文件：會造成兩份 spec 衝突
- MODIFIED 方式：規則改太多，等同重寫，不如直接 remove + new

**理由**：兩種風格概念完全互斥，不是局部修改能表達的。

### Decision: CSS 變數重整而非局部修改

**選擇**：重寫 `:root` 變數區塊，沿用原變數名稱（`--bg`、`--text`、`--accent` 等）但換值；新增必要變數（`--text-meta` 為 `#a0a09b`、`--bg-secondary` 為 `#f6f6f3`）。

**替代方案**：
- 新增 MUJI 變數、舊變數不動：所有使用點都要改引用，波及面更大
- 全部刪除重建：風險高、容易漏

**理由**：變數名稱語義正確（`--bg` 就是背景色），換值比換名低風險。

### Decision: border-radius 值採用 0 而非刪除屬性

**選擇**：`--radius` 與 `--radius-sm` 改為 `0`；元件保留 `border-radius: var(--radius)` 寫法；頭像繼續用 `border-radius: 50%`。

**替代方案**：
- 刪除所有 `border-radius` 屬性：未來要恢復圓角成本高
- 用 `!important` 強制 0：沒必要

**理由**：變數集中管理，未來如有微調可從一處切換。

### Decision: emoji 審查採全面 grep 而非局部替換

**選擇**：以 regex 掃描所有 HTML / JS / CSS 中的 emoji 字元範圍，逐一審查——若屬 UI 視覺元素則移除或替換成文字；若屬 notes 內使用者資料則保留。

**替代方案**：
- 不審查，依樣保留：違反 MUJI「不使用 emoji」原則
- 全部無腦刪除：可能誤刪使用者輸入的交易 notes

**理由**：需要人工判斷「視覺 emoji」vs「內容 emoji」。

### Decision: 保留 glassmorphism fallback 的同時刪除

**選擇**：`liquid-glass-ui` 整份 REMOVED，包括原本的 fallback requirement，因為新設計根本不用 `backdrop-filter`，自然無需 fallback。

**替代方案**：
- 保留 fallback requirement 以防未來回退：不必要的技術債

**理由**：新方案 0 依賴 backdrop-filter，沒有降級問題。

## Risks / Trade-offs

- [**風險：降飽和的紅綠黃值可能實際看起來不協調**] → Mitigation：實作後先部署到本地預覽，由 Jesse 肉眼審查確認，必要時微調 2-3 次。
- [**風險：移除圓角後按鈕 / 輸入框顯得呆板**] → Mitigation：MUJI 原則本來就強調這種「質樸」感；如審視後覺得太硬，可考慮全域 1-2px 微圓角例外（非 MVP）。
- [**風險：8 個 HTML 檔 inline style 散落，改不完整**] → Mitigation：盡量把 inline style 收斂到 class，減少未來分散。grep 所有 `style=` 逐一審查。
- [**風險：JS 動態生成的 HTML 片段內的 class / style 遺漏**] → Mitigation：grep `innerHTML`、template string `\``、`className` 使用處，逐一檢查。
- [**權衡：語義色保留會被嚴格 MUJI 信徒視為妥協**] → 接受；財務工具實用性優先。設計系統文件中已註明此例外。
- [**風險：改完後視覺跳動可能干擾日常使用**] → Mitigation：`muji-redesign` 在 `tax-reserve-and-fund-payment` 完成並驗證後再實作，避免同一時段既改資料又改視覺。

## Migration Plan

1. 盤點 `css/style.css` 所有 CSS 變數與直接色碼使用
2. 先改 `:root` 變數值，驗證主要頁面視覺
3. 移除 `backdrop-filter`、`box-shadow`、`linear-gradient`、圓角
4. 更新語義色（紅綠黃）及其 light 版本
5. 審查 8 個 HTML 的 inline style 與 emoji
6. 審查 JS 中動態生成的 style / emoji
7. 刪除 `liquid-glass-ui` spec 歷史（歸檔後進入 archive）
8. 本地完整瀏覽 8 個頁面 + Jesse 視覺驗收

**Rollback**：git revert 該 change 的 commit 即可（純前端改動，無資料遷移）。

## Open Questions

- 降飽和三原色的實際 hex 值是否微調（實作時以肉眼為準）
- 是否需要為「印表 / 截圖」模式保留純白背景（目前背景已經是 `#fafaf8` 近白，預估無此需求）
