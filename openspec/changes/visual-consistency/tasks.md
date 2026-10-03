## 1. 樣式

- [x] 1.1 依 Four-step type scale 改 `globals.css` 字級 token 與各 class，並移除元件內寫死的字級；驗證：在 375px 以 iframe 量測 /todos、/ideas、/shows、演出頁、/calendar、/finance/transactions、/finance/analytics、/admin/users、/admin/template、/me 的所有文字元素，字級只出現 12、14、16、22（輸入框與 option 為 16、純符號按鈕除外）
- [x] 1.2 依 Consistent padding and alignment 統一卡片內距、區塊標題、巢狀清單與選演出晶片；驗證：開選演出面板截圖，量測「不掛演出」「收起」文字垂直置中、清單列文字 x 座標等於晶片文字 x 座標
- [x] 1.3 依 Styled select controls 統一所有下拉選單外觀；驗證：量測每個 `select` 的 computed `appearance` 為 none、高度 ≥ 44、圓角 12px，並截圖收支紀錄頁

## 2. 上線

- [ ] 2.1 手機 375px 與電腦 1280px 逐頁截圖比對、`scrollWidth` 等於視窗寬，部署後請 Jesse 看過；驗證：Jesse 確認 [after: 1.1, 1.2, 1.3]
