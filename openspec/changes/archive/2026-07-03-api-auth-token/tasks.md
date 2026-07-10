## 1. GAS 後端：驗證與授權

- [x] 1.1 依決策「密碼與 token 分離為兩個 property」與「token 以 Script Property 儲存的固定字串，而非簽章式 session token」，在 gas/Code.gs 加入從 Script Properties 讀取 APP_PASSWORD 與 API_TOKEN 的存取邏輯；驗證方式：新增的讀取函式在 property 未設時回傳空值不拋錯（可於 GAS 編輯器手動執行測試函式確認）
- [x] 1.2 實作 spec 需求 Password verification action：新增 verifyPassword action，POST payload { password } 比對 APP_PASSWORD，相符回 { success: true, token: <API_TOKEN> }、不符回 { success: false } 且無 token 欄位；驗證方式：部署後 curl 帶正確密碼得到 token、帶錯誤密碼無 token
- [x] 1.3 實作 spec 需求 Token authorization for all actions，依決策「過渡期以「API_TOKEN 未設定則放行」達成零停機切換」，在 handleRequest 對除 verifyPassword 外所有 action 加入 token 檢查：API_TOKEN 未設時放行、已設時 token 不符回 { success: false, error: "unauthorized" } 且不執行任何讀寫；驗證方式：未設 property 時 curl 無 token 的 getShows 正常、設定後 curl 無 token 的 getShows 回 unauthorized

## 2. GAS 後端：下架 migration 路由

- [x] 2.1 依決策「migration 函式本體保留、僅移除路由」，落實 spec 移除 Data migration action 與 Analytics cleanup migration 兩項需求：從 handleRequest 的 action switch 移除 migrateRenameShowToProject（Data migration action）、migrateAnalyticsCleanup（Analytics cleanup migration）、migrateTaxAndFundSetup、migrateAdvanceLedger、setup 五個 case，函式本體保留並加註「已執行完畢、路由已下架」；驗證方式：部署後 curl 這五個 action 皆回「未知的 action」錯誤

## 3. 前端：密碼閘門與 API token

- [x] 3.1 實作 spec 需求 Password gate for all pages（伺服器端驗證版）：改寫 js/shared.js 的密碼閘門，輸入密碼改呼叫後端 verifyPassword，成功後將回傳 token 存入 sessionStorage、移除遮罩，失敗顯示錯誤且不存 token；移除硬編碼密碼字面值；驗證方式：grep -rn "joke0321" js/ 無結果，且前端輸入正確密碼可進入、錯誤密碼顯示錯誤
- [x] 3.2 修改 js/api.js 的 get/post：每次請求自動附帶 sessionStorage 中的 token（GET 放 query、POST 放 payload），收到 unauthorized 回應時清除 sessionStorage token 並重新顯示密碼閘門；驗證方式：手動使 sessionStorage token 失效後發任一請求，畫面回到密碼框
- [x] 3.3 依決策「前端移除 4 個未使用的 API wrapper」，從 js/api.js 移除 migrateAdvanceLedger、migrateTaxAndFundSetup、setup、getCommonFund 四個未被呼叫的 wrapper；驗證方式：grep 確認四者於 js/ 內已無定義與呼叫，且全站頁面功能正常

## 4. 部署與端到端驗證（需 Jesse 配合）

- [x] 4.1 依決策的部署順序步驟一：Jesse 於 Apps Script 部署含 token 邏輯的 GAS 相容版（此時尚未設定 API_TOKEN，舊前端仍可用）；驗證方式：curl verifyPassword 與既有 action 皆正常運作
- [x] 4.2 部署順序步驟二：commit + push 前端（api.js、shared.js）至 main 觸發 GitHub Pages 部署；驗證方式：https://jessechen-humanoid.github.io/jokesonme/ 可正常載入並顯示密碼框
- [x] 4.3 部署順序步驟三：Jesse 於 GAS Script Properties 設定 APP_PASSWORD 與 API_TOKEN 兩個值以正式啟用強制驗證；驗證方式：curl 無 token 的 getShows 回 unauthorized、前端輸入正確密碼後全站功能正常
- [x] 4.4 端到端回歸：登入後逐頁（收支、演出準備、財務分析、財務預估、應援匯入）操作一輪確認帶 token 請求全部正常；驗證方式：各頁讀取與一筆寫入操作皆成功、無 unauthorized 誤擋
