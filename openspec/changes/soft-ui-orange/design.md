## Context

顏色與外觀全部定義在 platform/app/globals.css。2026-11-12 的 PR #13 上線了「赤陶橘主、海軍藍輔」與貼紙感：`:root` 有 `--accent` 四階與 `--sticker`、`--pop` 兩個 token，檔尾有一段標註「貼紙感」的覆寫規則；選取狀態的規則引用 `--accent`。圖表（platform/components/charts.tsx）的 `PART_COLORS` 與付費會員圖引用 `--accent` 系列。底部導覽元件 platform/components/bottom-nav.tsx 每個項目本來就同時有圖示與文字，這次不改元件。

## Design Source

- 來源：Jesse 2026-11-12 在對話中提供的參考圖「SOFT / SYSTEM — UI Component Study」（單張圖片，不是 .dc.html），指示「參考圖的藍色改橘色」；之後看過假資料預覽頁（對話中的截圖）同意照做，並指定底部導覽列要有圖示。
- 快取：沒有可快取的原始檔；以下數值是做預覽時定下、Jesse 看過的值。

| 項目 | 值 |
| ---- | --- |
| 頁面底色 `--ground` | `#F2EFE8` |
| 浮起的表面 `--surface` | `#F8F6F1` |
| 內凹的表面 `--surface-2` | `#EFECE5` |
| 主色 `--brand` | `#DD5A1C` |
| 文字 `--ink` | `#2A2C33` |
| 區塊卡片圓角 | 26px |
| 獨立卡片圓角 | 22px |
| 按鈕、輸入框、膠囊、分段切換圓角 | 999px |
| 浮起陰影 `--raise` | `-6px -6px 14px rgba(255,255,255,.95), 8px 10px 20px rgba(160,148,126,.26)` |
| 小浮起陰影 `--raise-sm` | `-3px -3px 8px rgba(255,255,255,.95), 4px 5px 10px rgba(160,148,126,.24)` |
| 內凹陰影 `--press` | `inset 2px 2px 5px rgba(160,148,126,.30), inset -2px -2px 5px rgba(255,255,255,.95)` |
| 底部導覽 | 左右各留 12px、離底 12px、圓角 28px，圖示在上、文字在下 |

## Goals / Non-Goals

**Goals:**

- 畫面上沒有黑框與實心偏移陰影；卡片浮起、輸入類元件內凹、按鈕為膠囊形。
- 只有橘色一個強調色；程式裡不再有 `--accent`、`--sticker`、`--pop`。
- 底部導覽浮起、保留圖示。
- 文字對比：除白字在 `--brand` 上以外全部至少 4.5。

**Non-Goals:**

- 不改版面結構、字級、任何元件的 props 或資料。
- 不改 code review 提到的手機表格、財務總覽長度（另案）。
- 不做深色模式。

## Decisions

### 顏色 token

採用規格「Brand colour tokens」列出的值。已量測的對比（WCAG 相對亮度，2026-11-12 用 node 計算）：`--ink-3` 在 `--surface-2` 4.86、`--ground-2` 4.56、`--ground` 5.00、`--surface` 5.31；`--ink-2` 在 `--ground-2` 5.65、在 `--mist` 5.01；`--brand-deep` 在 `--brand-4` 5.35、`--brand-3` 4.66、`--surface-2` 5.23；`--success` 在 `--surface` 4.92、`--surface-2` 4.51；`--danger-fin` 在 `--surface` 4.99、`--surface-2` 4.57；`--warning` 在 `--warning-bg` 4.76。

語意色（`--success`、`--danger-fin`、`--warning` 與各自的底色）維持 PR #13 的值。

### 白字在亮橘上的對比

白字在 `#DD5A1C` 是 3.78，低於 4.5，也低於赤陶橘時的 4.33。Jesse 要的是參考圖那種明亮的強調色，所以接受；補救是橘底上的文字一律 700 粗體，下一場大卡內的小格用疊深的底（`rgba(120,40,0,.32)` 疊在主色上，白字對比見任務 1.2 的量測）。替代方案是把橘色加深到 4.5 以上，會回到偏沉的磚色，不採用。

### 浮起與內凹的分配

- 浮起（`--raise`）：區塊卡片、表格外框、導覽列。
- 小浮起（`--raise-sm`）：獨立卡片、筆記輸入框、時程膠囊、未選取的篩選膠囊、次要按鈕、頭像、圖示按鈕、表單選項。
- 內凹（`--press`）：輸入框、下拉、文字區、分段切換的軌道、進度條軌道、未勾選的勾選框（外圈用 `--brand`，才看得出可以點）、日期徽章；被選取的表單選項也用內凹加淡橘底。多行的輸入（textarea）圓角 20px，不用膠囊形。聚焦外框用 `--brand`。
- 平的：卡片內的成員小卡、行事曆行程列、摘要格（`--surface-2`、無陰影），避免浮起的東西疊在浮起的卡片上。

### 選取狀態改回橘色並移除海軍藍

篩選膠囊選取：`--brand` 底白字。表單選項選取：`--brand-4` 底、`--brand-deep` 字。行事曆選到的日期：格子 `--brand-4`、日期數字 `--brand` 底白字；今天維持橘色外圈。分段切換選到的那格：浮起、`--brand-deep` 字。「看我笑話」系列標籤：`--mist` 底、`--ink-2` 字。`--accent` 四個 token 與所有引用一併刪除。

### 圖表顏色

`PART_COLORS`：票房 `var(--brand)`、會員 `var(--brand-2)`、周邊 `var(--ink-2)`、贊助 `var(--ink-3)`、其他 `var(--mist)`。付費會員圖：月訂閱 `var(--brand)`、年訂閱有效 `var(--ink-3)`。每月收支圖不動。色塊改成圓點、堆疊條改成膠囊形；堆疊條每段留一圈很淡的內線，淺色的類別才看得出邊界。

### 導覽列

手機：`.nav` 改成 `left/right: 12px`、`bottom: 12px + 安全區`、圓角 28px、`--surface` 底、`--raise` 陰影、無邊框；`.fab` 往上移讓出空間。電腦（≥900px）：側欄同樣浮起、四周留 16px，`.page` 的左邊距跟著加大。圖示沿用 bottom-nav.tsx 既有的，不改元件。

### 貼紙感的移除方式

刪掉檔尾整段「貼紙感」覆寫與 `--sticker`、`--pop`，改成一段標註「Soft UI」的規則；`:root` 的值直接改掉，不留舊值。

## Implementation Contract

- 行為：每頁底色 `#F2EFE8`；卡片無邊框、有 `--raise` 陰影；主要按鈕是 `#DD5A1C` 的膠囊；輸入框內凹；底部導覽是浮起的圓角長條且每項有圖示；畫面上沒有海軍藍、沒有 2px 黑框。
- 介面：`:root` 新增 `--mist`、`--raise`、`--raise-sm`、`--press`；刪除 `--accent`、`--accent-2`、`--accent-3`、`--accent-4`、`--sticker`、`--pop`。不新增元件、不改 props。
- 失敗情況：沒有執行期失敗路徑；若有規則仍引用已刪除的 token，該屬性會失效（變回預設樣式），由驗收的搜尋抓出。
- 驗收：
  - 在 platform 的 app、components、lib 搜尋 `--accent`、`--sticker`、`--pop`、`C9562C`、`1F2F6E`（不分大小寫），結果為零。
  - 假資料預覽頁（套正式的 globals.css）在 375px 與 390px 寬讀取計算後樣式：`body` 背景 `rgb(242, 239, 232)`；區塊卡片 `border-top-width` 為 `0px` 且 `box-shadow` 不是 `none`；`.btn-primary` 背景 `rgb(221, 90, 28)`、圓角 `999px`；`.input` 的 `box-shadow` 含 `inset`；`.nav` 的 `left` 為 `12px`、圓角 `28px`；`scrollWidth` 等於 `innerWidth`。
  - 真實頁面：合併前把分支的樣式檔套到正式站的頁面上（只在審查者自己的瀏覽器裡），逐頁看首頁、演出、財務總覽、演出收支、待確認、行事曆、筆記、場地檔期、待辦、開發，確認導覽列圖示都在、沒有版面破掉。
  - 找一個沒看過製作過程的 agent 獨立審查 diff。
  - `npm run test`、`npm run test:db`、`npm run typecheck`、`npm run lint` 退出碼都是 0。
- 範圍：只動 platform/app/globals.css、platform/app/layout.tsx、platform/components/charts.tsx（另有 platform/components/ticket-board.tsx 一行註解），以及封存上一份 change 產生的 openspec 檔案。

## Risks / Trade-offs

- 白字在橘底對比 3.78（見上方決定）。
- 柔和陰影在低階手機或陽光下，卡片邊界會比黑框難分辨；浮起與底色的明度差很小是這個風格的本質。
- 浮起的導覽列下方會露出捲動中的內容，頁面底部的留白要夠，最後一個元素才不會被擋住。
- 這是同一天內第二次換外觀，成員會看到兩次變動。
