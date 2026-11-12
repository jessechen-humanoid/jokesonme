## 1. 樣式

- [x] 1.1 Brand colour tokens 與「顏色 token」：platform/app/globals.css 的 `:root` 換成規格的值，新增 `--mist`、`--raise`、`--raise-sm`、`--press`，刪除 `--accent` 四階、`--sticker`、`--pop`；檔頭註解改寫。驗證：在 platform 的 app、components、lib 不分大小寫搜尋 `--accent`、`--sticker`、`--pop`、`C9562C`、`1F2F6E`，結果為零；對比計算腳本從改好的 CSS 讀色號重算，除白字在 `--brand` 外全部至少 4.5。
- [x] 1.2 [after: 1.1] Soft surface styling、Corner radius and surface styling，對應「浮起與內凹的分配」「貼紙感的移除方式」「導覽列」「白字在亮橘上的對比」：刪掉檔尾的貼紙感覆寫，改成 Soft UI 規則（卡片浮起無邊框、按鈕膠囊、輸入類內凹、卡片內小卡為平的、導覽列浮起且保留圖示、大卡內小格用疊深的底）。驗證：假資料預覽頁在 375px 與 390px 寬讀取計算後樣式，符合 design.md Implementation Contract 的驗收值，且沒有橫向捲動。
- [x] 1.3 [after: 1.1] Brand orange usage restriction 與「選取狀態改回橘色並移除海軍藍」：篩選膠囊、表單選項、行事曆選取日、分段切換、系列標籤改用橘色或霧灰 token。驗證：預覽頁上選取中的篩選膠囊背景是 `rgb(221, 90, 28)`、選取的表單選項背景是 `rgb(252, 236, 225)`，頁面上找不到 `rgb(31, 47, 110)`。

## 2. 圖表與 theme color

- [x] 2.1 [after: 1.1] Chart colour palette 與「圖表顏色」：platform/components/charts.tsx 的 `PART_COLORS` 與付費會員圖改用 `--brand`、`--brand-2`、`--ink-2`、`--ink-3`、`--mist`，檔頭註解更新；platform/app/layout.tsx 的 `themeColor` 改成 `#DD5A1C`。驗證：charts.tsx 與 layout.tsx 搜尋不到 `--accent` 與 `#C9562C`；本機 `/login` 的 `theme-color` 是 `#DD5A1C`。

## 3. 驗收

- [x] 3.1 [after: 1.2] [after: 1.3] [after: 2.1] 在 platform 跑 `npm run test`、`npm run test:db`、`npm run typecheck`、`npm run lint`，輸出導到檔案並印出退出碼。驗證：四個退出碼都是 0。
- [x] 3.2 [after: 3.1] 把分支的樣式檔套到正式站的真實頁面上逐頁檢查（只在自己的瀏覽器裡、只瀏覽不送出表單），並找一個沒看過製作過程的 agent 獨立審查 diff；審查找到的「會壞」「會醜」項目修完。驗證：十頁的截圖與審查結論寫進 PR。
- [ ] 3.3 [after: 3.2] 開 PR，說明寫「不牽動 MCP」，並附上封存 brand-palette-terracotta-navy 的說明。驗證：PR 內文含四項自檢結果、審查結論與未驗證事項。
