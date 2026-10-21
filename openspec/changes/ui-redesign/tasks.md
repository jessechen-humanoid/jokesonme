## 1. 外框與視覺系統

- [x] 1.1 依 Four-step type scale 與 Brand orange usage restriction 重寫 `platform/app/globals.css` 的 token：字級 24／17／15／13、次要文字用 `--ink-2`、金額不斷行、頁首不再有柿子紅底；驗證：375px 量測 /todos、/calendar、/finance/analytics 所有文字的 computed font-size 只有 13、15、16（輸入框）、17、24，且 /finance/analytics 的年度總收入只佔一行
- [x] 1.2 依 Page header economy 新增精簡頂列 `platform/components/top-bar.tsx` 並套到每一頁（子頁有返回、不重複品牌名、分段按鈕在 375px 不被擠出）；驗證：375px 截圖 /finance/transactions 看得到 收支、逐筆、分析、匯入、預估 五個分頁
- [x] 1.3 依 Icon navigation 讓底部導覽與電腦側欄每項都有線條圖示、目前分頁為柿子紅、「靈感」改叫「筆記」；驗證：375px 與 1280px 截圖 /shows 的導覽列
- [x] 1.4 更新 `platform/app/(app)/loading.tsx` 骨架對齊新頂列；驗證：骨架頁頂端沒有柿子紅卡片

## 2. 演出與筆記

- [x] 2.1 依 Monthly planning page 改演出頁：筆記在前並有頁面上直接輸入的筆記框、待辦收成摘要卡（未完成件數＋最近截止日）點開才展開並可新增待辦、依 Desktop two-column pages 在 ≥ 900px 左筆記右待辦；驗證：375px 與 1280px 截圖 11 月號演出頁，點開待辦卡確認清單出現
- [x] 2.2 依 REMOVED「Show document links」拿掉演出文件畫面、`saveShowLink` 動作與 `show_links` 查詢；驗證：`grep -rn "show_links\|saveShowLink" platform/app platform/components` 沒有結果，typecheck 通過
- [x] 2.3 依 Shows page emphasises only the next show 把下一場做成柿子紅大卡（日期、倒數、筆記數、未完成待辦數），其他場用日期徽章列；驗證：375px 截圖 /shows
- [x] 2.4 依 Idea library page 與 Assign idea to a show 改筆記頁：預設「全部」、分段為 全部／未分演出／已封存、頁首直接輸入、卡片拿掉「→ 下一場」「其他…」改成點演出標籤換場、編輯面板可換演出；驗證：375px 截圖 /ideas，`document.body.innerText` 不含「其他…」

## 3. 待辦、行事曆、財務

- [x] 3.1 依 Todo page header without duplicate numbers 改待辦頁頁首（頂列＋分段按鈕＋下一場列），並依 Due date urgency colouring 給截止日上色；驗證：`lib/dates` 新增 `dueUrgency` 單元測試（放 dates 是因為待辦清單在瀏覽器端用，todos.ts 會載入資料庫程式）（過期／三天內／之後／已完成四種）通過，375px 截圖 /todos
- [x] 3.2 行事曆在 ≥ 900px 依 Desktop two-column pages 改左月曆右當日清單；驗證：1280px 截圖 /calendar
- [x] 3.3 財務頁：分頁縮短、收支列表長備註收成兩行（點開面板看全文）、財務分析統計卡不斷行、成員年度報表手機改每人一張卡（五個欄位都在）、電腦維持表格；驗證：375px 截圖 /finance/transactions 與 /finance/analytics，逐一對照成員報表五個欄位都有出現

## 4. 驗收與上線

- [x] 4.1 對照改版前每頁顯示的資訊清單（見 design.md「資訊保留清單」），確認每一項改版後仍看得到；驗證：逐頁截圖對照清單人工核對（2026-10-22 已做；只拿掉演出文件）
- [x] 4.2 `npm test`、`npm run typecheck`、`npm run lint`、`npm run cf:build` 全部退出碼 0；375px 與 1280px 逐頁截圖、`scrollWidth` 等於視窗寬
- [ ] 4.3 截圖給 Jesse 看過、同意後部署；驗證：Jesse 確認 [after: 4.1, 4.2]
