## 1. 顏色 token

- [x] 1.1 Brand colour tokens 與 Semantic colour tokens for financial state：platform/app/globals.css 的 `:root` 換成 design.md「新的顏色 token 與對比」表中的值，並新增 `--accent`、`--accent-2`、`--accent-3`、`--accent-4`；檔頭說明配色的註解改寫成赤陶橘主、海軍藍輔。完成後每頁底色為 `#F5F1E6`、正數金額 `#1F7A4D`、負數 `#C2382E`。驗證：在 platform 的 app、components、lib 內不分大小寫搜尋 `E2673F`、`B84D2A`、`4F554A`、`7A8074`、`3F6139`、`A23B2A`，結果為零（platform/app/layout.tsx 的 `themeColor` 由 3.2 處理）。
- [x] 1.2 [after: 1.1] 用對比計算腳本（WCAG 相對亮度）重算 design.md「新的顏色 token 與對比」列出的每一組文字與底色，確認除白字在 `--brand`（4.33）外全部至少 4.5；任何一組不到就調整該 token 並同步改 design.md 與規格變更裡的色號。驗證：把計算輸出貼進回報，逐組列出數值。

## 2. 橘色與藍色的用法

- [x] 2.1 [after: 1.1] Brand orange usage restriction 與「白字在赤陶橘上用粗體」：下一場大卡（`.hero`）內的小字字重改為 700、移除大卡文字的 `opacity`；globals.css 內非選取用途的 `.fab` 與 `.hero` 陰影色改用新主色的 rgba。完成後橘色只出現在大卡、主要按鈕、右下角＋、目前導覽項、急件日期、未認領標籤、勾選框外框、行事曆今天的外圈。驗證：在 375px 寬開 `/shows` 與 `/home`，大卡文字全部為白色粗體；檢視 globals.css 中所有 `var(--brand)` 的使用處，逐一對照上述清單。
- [x] 2.2 [after: 1.1] Navy accent usage 與「選取狀態只用海軍藍」：篩選膠囊（`.filter-chips > .on`、`.quick-entry .filter-chips button.on`、`.tk-filter.on`、`.vc-months button[aria-pressed="true"]`）改為 `--accent` 底、`--ground` 字；表單選項（`.pick input:checked + span`、`.pick-chip.on` 與其內文字、`.pick-row.on`）改為 `--accent-4` 底、`--accent-2` 框、`--accent` 字；行事曆 `.cal-day.on` 改為 `--accent-4` 格子與 `--accent` 底白字的日期數字，`.cal-day.today` 維持橘色外圈；`.seg-tabs` 與 `.seg` 不動。驗證：在預覽環境點選 `/finance/shows` 的系列篩選、`/finance/inbox` 的快捷、`/tickets` 的篩選、收支面板的參與成員、選演出面板、`/calendar` 的任一天，用瀏覽器檢查工具讀取計算後的背景色，分別是 `rgb(31, 47, 110)` 或 `rgb(238, 240, 248)`。
- [x] 2.3 [after: 1.1] 「系列標籤與 theme color」之系列標籤：`.badge.s-main` 改為 `--accent-3` 底、`--accent` 字，`.badge.s-special` 與 `.badge.s-mpr` 維持。驗證：開 `/finance/shows`，「看我笑話」標籤計算後背景為 `rgb(221, 225, 241)`、文字為 `rgb(31, 47, 110)`。

## 3. 圖表與 theme color

- [x] 3.1 [after: 1.1] Chart colour palette 與「圖表改用藍色系與中性灰」：platform/components/charts.tsx 的 `PART_COLORS` 改為票房 `var(--accent)`、會員 `var(--accent-2)`、周邊 `var(--ink-2)`、贊助 `var(--ink-3)`、其他 `var(--accent-3)`；付費會員圖的月訂閱改 `var(--accent)`、年訂閱有效改 `var(--ink-3)`（圖例與長條一致）；每月收支圖不動；檔頭顏色註解更新。驗證：在 charts.tsx 搜尋 `var(--brand`，結果為零；開 `/finance` 看收入組成與付費會員圖沒有橘色，圖例顏色與長條一致。
- [x] 3.2 「系列標籤與 theme color」之 theme color：platform/app/layout.tsx 的 `themeColor` 改為 `#C9562C`。驗證：開任一頁檢視原始碼，`<meta name="theme-color">` 的值是 `#C9562C`。

## 4. 驗收

- [x] 4.1 [after: 2.1] [after: 2.2] [after: 2.3] [after: 3.1] [after: 3.2] 在 platform 目錄跑 `npm run typecheck`、`npm run lint`、`npm test`，各自把輸出導到檔案並印出退出碼（不接管線）。驗證：三個退出碼都是 0。
- [ ] 4.2 [after: 4.1] 在本機或預覽環境以 375px 寬逐頁檢查 `/home`、`/shows`、`/finance`、`/finance/shows`、`/finance/inbox`、`/calendar`、`/ideas`、`/ideas/venue-availability`、`/todos`、`/tickets`、`/me`：沒有舊的柿子紅或橄欖灰、沒有文字撞色、場地檔期頁的標示仍可分辨。只瀏覽，不送出任何表單。驗證：每頁一張截圖交給 Jesse 確認。
- [ ] 4.3 [after: 4.2] Jesse 看過截圖並同意後才部署（`npm run cf:build`、`npm run cf:deploy`）。開 PR 時在說明寫明「不牽動 MCP」。驗證：正式站 `/finance` 的 body 計算後背景色為 `rgb(245, 241, 230)`。

## 5. 貼紙感

- [x] 5.1 行事曆行程列（`.cal-item.show`、`.cal-item.event`）拿掉左側色條與色底，改成前面一顆圓點（演出橘色實心、內部行程空心圈）。驗證：預覽頁上 `.cal-item.show` 的 `border-left-width` 是 `1px`、`::before` 背景是 `rgb(201, 86, 44)`（2026-11-12 已讀出）。
- [x] 5.2 Sticker surface styling 與 Corner radius and surface styling，對應 design.md「貼紙感的外框與陰影」：新增 `--sticker`、`--pop` 兩個 token；最外層卡片類元件只有 2px 墨黑外框、沒有陰影；下一場大卡、主要按鈕、右下角＋有外框加實心偏移陰影，主要按鈕按下位移 2px；篩選膠囊交錯微傾；卡片內的列、小卡、輸入框維持細線。驗證：在假資料預覽頁以 390px 與 375px 寬讀取計算後樣式，符合 design.md Implementation Contract 的「貼紙感驗收」四項，並截圖。
- [x] 5.3 [after: 5.2] 改完後重跑 `npm run typecheck`、`npm run lint`、`npm test`，輸出導到檔案並印出退出碼。驗證：三個退出碼都是 0。
