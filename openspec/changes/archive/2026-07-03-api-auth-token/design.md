## Context

GAS Web App URL 公開於前端且後端零驗證，任何人可讀寫刪全部資料；前端 `joke0321` 硬編碼於 shared.js，僅為畫面遮罩。8 人團隊、資料非高度機密但含財務與粉絲個資，威脅模型是「阻擋隨手拿到 URL 的外人」，不是「防禦針對性攻擊」。因此採共用密碼 + 伺服器端 token，而非 Google OAuth（後者需每位成員 Google 登入、設定成本高、對此規模過度）。

GAS Web App 部署特性：前端與後端各自獨立部署，兩者間有版本空窗；GAS 冷啟動慢。這決定了部署順序與相容策略。

## Goals / Non-Goals

**Goals:**
- 未帶有效 token 的任何 mutating／reading action 一律被後端拒絕。
- 前端不再存在明文密碼；密碼比對只發生在伺服器端。
- 下架 5 個已執行完的一次性 migration action，縮小攻擊面。
- 部署過程可平滑切換，不造成全站中斷。

**Non-Goals:**
- 不引入 Google OAuth 或個人化帳號（維持單一共用密碼 UX）。
- 不做逐使用者權限分級（8 人皆同權）。
- 不加密傳輸內容（HTTPS 已由 GAS 提供，足夠）。
- 不處理 rate limiting／brute-force 鎖定（規模小，列為未來選配）。
- 不觸碰其他 OPTIMIZATION_PLAN 階段（交易 UUID、錯誤處理等）。

## Decisions

### token 以 Script Property 儲存的固定字串，而非簽章式 session token

API_TOKEN 存於 GAS Script Properties，verifyPassword 成功後原樣回傳，前端存 sessionStorage 並隨每次請求附帶。選固定共享 token 而非 JWT／HMAC 簽章：實作最簡、無需在 GAS 管理密鑰輪替邏輯，符合威脅模型（目的是擋外人，非防中間人）。代價是 token 外洩等同密碼外洩——可接受，因兩者本就等價於「知道就能進」。輪替方式：Jesse 手動改 Script Property 的 API_TOKEN 值，全體重新輸入密碼即可。

### 密碼與 token 分離為兩個 property

APP_PASSWORD（使用者輸入的密碼）與 API_TOKEN（請求授權用字串）分開存放，而非直接用密碼當 token。好處：日後要輪替授權而不改使用者密碼、或反之，各自獨立；前端 sessionStorage 只存 token 不存密碼，降低密碼在 client 停留的面積。

### 過渡期以「API_TOKEN 未設定則放行」達成零停機切換

handleRequest 的 token 檢查邏輯：若 Script Property 未設定 API_TOKEN，則跳過驗證（相容舊前端）；一旦設定，即對所有 action（除 verifyPassword）強制驗證。部署順序因此為：(1) 部署含此邏輯的 GAS（此時 property 未設，舊前端仍可用）→ (2) 推前端新版（會呼叫 verifyPassword 並附 token）→ (3) Jesse 設定 APP_PASSWORD 與 API_TOKEN 兩個 property，強制驗證即刻生效。此順序避免「後端已強制、前端還沒帶 token」的全站鎖死空窗。

### migration 函式本體保留、僅移除路由

B2 只從 handleRequest 的 action switch 移除 5 個 case，函式本體留在 Code.gs 並加註「已執行完畢、路由已下架」。保留本體供未來查閱歷史邏輯，同時確保無法再經 API 觸發（尤其 migrateAnalyticsCleanup 無冪等保護）。

### 前端移除 4 個未使用的 API wrapper

js/api.js 的 migrateAdvanceLedger、migrateTaxAndFundSetup、setup、getCommonFund 皆為前端從未呼叫的死碼（getCommonFund 對應後端端點亦僅寫回 sheet、無前端消費者），一併移除以保持前後端 action 面一致。

## Implementation Contract

**可觀察行為：**
- 未帶 token 或帶錯誤 token 呼叫任一 action（getShows、addTransaction、deleteTransaction 等，除 verifyPassword），後端回傳 `{ success: false, error: "unauthorized" }`，且不執行任何讀寫。
- 以正確 token 呼叫時，行為與現況完全一致。
- verifyPassword 帶正確密碼回傳 `{ success: true, token: <API_TOKEN> }`；帶錯誤密碼回傳 `{ success: false, error: <訊息> }` 且不回傳 token。
- 前端首次進站顯示密碼框；輸入正確密碼後存 token 並進入；token 失效（unauthorized）時自動清除並重新顯示密碼框。
- 呼叫已下架的 migration action（如 migrateAnalyticsCleanup）回傳「未知的 action」錯誤。

**介面／資料形狀：**
- 新增 GAS action `verifyPassword`（POST，payload `{ password }`）。
- 所有既有 action 的請求新增可帶 `token`（GET 為 query param、POST 為 payload 欄位皆需支援，與現有 get/post 封裝一致）。
- Script Properties 兩個 key：`APP_PASSWORD`、`API_TOKEN`。

**失敗模式：**
- API_TOKEN property 未設定 → 後端放行（過渡相容），此為刻意設計而非漏洞，僅存在於前端上線前的過渡窗。
- token 不符 → unauthorized，前端據此清 sessionStorage 並要求重新輸入密碼。
- 網路／逾時錯誤 → 沿用前端既有錯誤處理（本 change 不改動該層）。

**驗收方式：**
- 手動：部署後以 curl 不帶 token 呼叫 getShows/addTransaction，確認回 unauthorized；帶正確 token 確認正常。
- 手動：前端輸入正確／錯誤密碼各一次，確認進入／報錯行為。
- 指令：`grep -rn "joke0321" js/` 無結果；curl migrateAnalyticsCleanup 回未知 action。

**範圍邊界：**
- In scope：gas/Code.gs 的 verifyPassword、token 檢查、migration 路由移除；js/api.js 的 token 附帶／錯誤重導／死 wrapper 移除；js/shared.js 的密碼閘門改寫。
- Out of scope：其他頁面邏輯、交易資料結構、其餘 OPTIMIZATION_PLAN 階段。

## Risks / Trade-offs

- [部署順序錯誤導致全站鎖死（後端已強制但前端未帶 token）] → 以「property 未設則放行」的過渡設計消除；嚴格照 (1)GAS→(2)前端→(3)設 property 順序，property 設定為最後一步。
- [token 存 sessionStorage 可被同源 XSS 竊取] → 現有程式已全面 escapeHtml，XSS 面小；且 token 外洩等價於密碼外洩，屬可接受風險；未來如需再強化可加短效期。
- [Jesse 忘記設定 property，強制驗證從未啟用] → 完成部署後於任務中明確驗證「未設 property 時放行、設了之後 curl 無 token 被擋」兩種狀態，並在收尾提醒 Jesse 確認 property 已設。
- [硬編碼密碼移除後，若 verifyPassword 部署失敗則無法登入] → 過渡期舊 token 邏輯放行可先確保前端能載入；部署 GAS 後先以 curl 測 verifyPassword 再推前端。
