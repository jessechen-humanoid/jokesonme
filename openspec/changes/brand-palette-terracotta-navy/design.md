## Context

平台的顏色全部定義在 platform/app/globals.css 的 `:root`（約 25 個 token），元件透過 class 取用；2026-11-12 的檢查只在 platform/app/layout.tsx 的 `themeColor` 找到一個寫死的色碼。圖表（platform/components/charts.tsx）用 `var(--…)` 取色，其中收入組成的 `PART_COLORS` 把「票房」設成 `var(--brand)`，付費會員圖的月訂閱也用 `var(--brand)`。

現行規格 `brand-design-system` 的色號已經和程式不同步（例如規格寫 `--ink-2` 是 `#585E52`，程式是 `#4F554A`），這次以新色號一併對齊。

Jesse 2026-11-12 的決定：品牌三色是橘、藍、白，不要太刺眼；用法是橘主藍輔；色號選 B 組（赤陶 `#C9562C`＋海軍藍 `#1F2F6E`）。

## Goals / Non-Goals

**Goals:**

- 換上新的顏色 token，畫面上不再出現舊的柿子紅與橄欖灰。
- 所有文字與底色的組合對比至少 4.5（白字在赤陶橘上 4.33，用粗體補足，見下方決定）。
- 選取狀態只剩兩種樣子：分段切換的白色膠囊，以及海軍藍。
- 圖表不使用品牌橘。

**Non-Goals:**

- 版面調整（手機上的演出收支表、財務總覽長度、右下角＋蓋住數字）另案處理。
- 字級、間距不動；圓角維持現值；場地檔期頁用到規格外字級的問題另案處理。
- 不做深色模式。
- 根目錄舊站（css/style.css）不改。

## Decisions

### 新的顏色 token 與對比

| Token | 新值 | 取代 |
| ----- | ---- | ---- |
| `--ground` / `--ground-2` | `#F5F1E6` / `#EDE7D9` | `#F6F2E8` / `#ECE5D4` |
| `--surface` / `--surface-2` | `#FFFFFF` / `#FAF8F2` | `#FFFFFF` / `#FAF8F1` |
| `--ink` / `--ink-2` / `--ink-3` | `#17181C` / `#4D4F57` / `#65676F` | `#1E211B` / `#4F554A` / `#7A8074` |
| `--line` / `--line-2` / `--border-hover` | `#E1DBCB` / `#EEE9DC` / `#CCC5B2` | `#E2DBC9` / `#EFE9DB` / `#CFC7B3` |
| `--brand` / `--brand-deep` | `#C9562C` / `#9E3F1C` | `#E2673F` / `#B84D2A` |
| `--brand-2` / `--brand-3` / `--brand-4` | `#EBB8A3` / `#F6DDD1` / `#FBEEE8` | `#F2B9A2` / `#FBE3D8` / `#FDF1EB` |
| `--accent` / `--accent-2` / `--accent-3` / `--accent-4`（新增） | `#1F2F6E` / `#A9B3D6` / `#DDE1F1` / `#EEF0F8` | 無 |
| `--success` / `--success-bg` | `#1F7A4D` / `#E6F2EB` | `#3F6139` / `#E3ECDF` |
| `--danger-fin` / `--danger-bg` | `#C2382E` / `#FBE9E6` | `#A23B2A` / `#F8E1DB` |
| `--warning` / `--warning-bg` | `#8A6410` / `#FAF1D6` | `#8F6A16` / `#FAF1D6` |

已量測的對比（WCAG 相對亮度公式，2026-11-12 用 node 計算）：`--ink-3` 在 `--ground` 5.00；`--ink-2` 在 `--ground` 7.24；白字在 `--brand` 4.33；`--brand-deep` 在 `--brand-4` 5.81、在 `--brand-3` 5.09；`--accent` 在 `--accent-3` 9.54、在 `--accent-4` 10.92；`--ground` 字在 `--accent` 11.01；`--success` 在白底 5.32；`--danger-fin` 在白底 5.39；`--warning` 在 `--warning-bg` 4.76。

同樣已量測：`--success` 在 `--success-bg` `#E6F2EB` 4.62；`--danger-fin` 在 `--danger-bg` `#FBE9E6` 4.59；`--ink-3` 在 `--surface-2` 5.31、在 `--surface` 5.64。`--ink-3` 在 `--ground-2` `#EDE7D9` 4.58（原訂 `#EBE5D6` 量到 4.49，實作時調淺）。

替代方案：赤陶橘上改用墨黑字（對比 4.10）比白字更低，所以用白字。

### 白字在赤陶橘上用粗體

白字在 `#C9562C` 的對比是 4.33，略低於 4.5。主要按鈕（`.btn-primary`）已經是 700；下一場大卡（`.hero`）裡 13px、字重 500 的小字改成 700，大卡內不再用 `opacity` 降低文字濃度。替代方案是把主色加深到對比 4.5 以上（約 `#C2502A`），但會偏離 Jesse 選定的色號，所以不採用。

### 選取狀態只用海軍藍

- 篩選類的膠囊（`.filter-chips > .on`、`.quick-entry .filter-chips button.on`、`.tk-filter.on`、`.vc-months button[aria-pressed="true"]`）：`--accent` 底、`--ground` 字。
- 表單裡的選項（`.pick input:checked + span`、`.pick-chip.on`、`.pick-row.on`）：`--accent-4` 底、`--accent-2` 框、`--accent` 字。
- 行事曆選取的日期（`.cal-day.on`）：格子 `--accent-4`、日期數字 `--accent` 底白字；今天（`.cal-day.today`）維持赤陶橘外圈。
- 分段切換（`.seg-tabs`、`.seg`）維持白色膠囊，不改。
- 導覽的目前項目維持橘色（`--brand-deep` 字，電腦版側欄 `--brand-4` 底）。

替代方案：全部選取狀態都用淡藍底。篩選膠囊用實心藍比較容易一眼看出目前的篩選條件，所以分兩種。

### 圖表改用藍色系與中性灰

- `PART_COLORS`：票房 `var(--accent)`、會員 `var(--accent-2)`、周邊 `var(--ink-2)`、贊助 `var(--ink-3)`、其他 `var(--accent-3)`。
- 付費會員圖：月訂閱 `var(--accent)`、年訂閱有效 `var(--ink-3)`。
- 每月收支圖維持收入 `var(--success)`、支出 `var(--danger-fin)`、淨利折線 `var(--ink)`。
- charts.tsx 檔頭說明顏色的註解一併更新。

替代方案：收入組成用綠色階（舊規格的寫法）。綠色已經代表「正數金額」，拿來分類別會混淆，所以改用藍色系。

### 系列標籤與 theme color

- `.badge.s-main`（看我笑話）改成 `--accent-3` 底、`--accent` 字；`.badge.s-special`（專場）維持橘色淡底；`.badge.s-mpr` 維持中性。
- platform/app/layout.tsx 的 `themeColor` 改成 `#C9562C`。

### 貼紙感的外框與陰影

Jesse 2026-11-12 看過三個方向（圓滾滾、貼紙感、海報網點）後選「貼紙感」，條件是不要複雜。做法：

- 新增兩個 token：`--sticker: 2px solid var(--ink)`、`--pop: 3px 3px 0 var(--ink)`。
- 只有外框、沒有陰影：區塊卡片、獨立卡片、表格外框、筆記輸入框、時程膠囊、篩選膠囊、次要按鈕、底部導覽的上緣。
- 外框加實心偏移陰影：下一場大卡、主要按鈕、右下角＋。主要按鈕按下時往陰影方向位移 2px。
- 篩選膠囊交錯微傾（−1.5 度與 1 度），靜態、不做動畫。
- 卡片裡面的東西（清單列、成員小卡、輸入框、選項）維持細線，不加粗框，避免財務頁框中有框。
- 原本的模糊陰影 `--shadow-sm` 不再用在上述元件。

替代方案：每個元件都加粗框與陰影，資訊多的財務頁會太吵，所以只給最外層。「圓滾滾」「海報網點」Jesse 沒有選。

## Implementation Contract

- 行為：部署後每一頁的底色是 `#F5F1E6`；主要按鈕、右下角＋、下一場大卡是 `#C9562C` 底白字；被選取的篩選膠囊是 `#1F2F6E`；金額正數 `#1F7A4D`、負數 `#C2382E`；財務總覽的收入組成與付費會員圖沒有任何橘色。
- 介面：`:root` 新增四個 token `--accent`、`--accent-2`、`--accent-3`、`--accent-4`；既有 token 名稱不變、只換值。不新增元件、不改任何元件的 props。
- 失敗情況：沒有執行期的失敗路徑；若某個 class 仍引用舊的寫死色碼，畫面會留下舊色，由驗收時的搜尋抓出。
- 驗收：
  - 在 platform 目錄搜尋 `E2673F`、`B84D2A`、`4F554A`、`7A8074`、`3F6139`、`A23B2A`（不分大小寫），app、components、lib 內結果為零。
  - 在 platform/components/charts.tsx 搜尋 `var(--brand`，結果為零。
  - 用對比計算腳本對 Decisions 表中每一組文字與底色重算，除白字在 `--brand`（4.33，粗體）外全部至少 4.5。
  - `npm run typecheck`、`npm run lint`、`npm test` 全過（指令輸出導到檔案並印出退出碼）。
  - 本機或預覽環境在 375px 寬逐頁看 `/home`、`/shows`、`/finance`、`/finance/shows`、`/finance/inbox`、`/calendar`、`/ideas`、`/todos`、`/tickets`，並截圖給 Jesse 確認後才部署。
- 貼紙感驗收：預覽頁上區塊卡片的 `border-top-width` 是 `2px`、`box-shadow` 是 `none`；主要按鈕的 `box-shadow` 是 `rgb(23, 24, 28) 3px 3px 0px 0px`；成員小卡的邊框是 `1px`；375px 寬時 `document.documentElement.scrollWidth` 等於 `innerWidth`。
- 範圍：只動 platform/app/globals.css、platform/app/layout.tsx、platform/components/charts.tsx。不動版面、字級、任何資料或 API。

## Risks / Trade-offs

- 赤陶橘比現在的柿子紅深，Jesse 要的「更活潑」主要靠海軍藍與乾淨的灰階帶出來；若上線後仍覺得悶，可只調 `--brand` 一個 token（A 組 `#DD5A1C` 是備案），不用重做。
- 白字在主色上對比 4.33，靠粗體補足，嚴格來說仍低於一般文字的 4.5 門檻。
- globals.css 內場地檔期頁（`.vc-*`）有自己的一組選取與標示樣式，換 token 後要實際開頁確認沒有顏色撞在一起。
- 換色後 LINE LIFF 內的網頁快取可能讓成員短時間看到新舊混合，重新整理即可。
