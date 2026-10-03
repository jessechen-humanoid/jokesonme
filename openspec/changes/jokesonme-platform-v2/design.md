## Context

- 現況：前端是 repo 根目錄的靜態頁（`index.html`、`checklist.html`、`analytics.html`、`forecast.html`、`import.html`、`opentix*.html`＋`js/*.js`），由 GitHub Pages 從 `main` 根目錄部署；後端是 `gas/Code.gs`（Google Apps Script Web App）讀寫 Google Sheet `1sM-ST9lTjvCk7a0ppjSX48-zvhSOc16oYXEaVp3qisI`；登入是共用密碼（`password-gate`）。
- 結算與分配的計算目前散在前端渲染函式（例：`js/analytics.js` 的 `renderMemberEarnings`、`js/transaction.js` 的 `deriveSettleStatus`）與 GAS（代墊還款彙總）。
- 參考架構：`/Users/jessechen/Claude Projects/Jebby Dashboard`（Next.js 16＋`@opennextjs/cloudflare`＋Supabase secret key 只在伺服器端、RLS 開無 policy、自訂 `worker.ts` 承接 cron）。
- 使用者：8 位成員（手機為主）、Jesse（管理員，電腦）、1 位財務夥伴（不在 LINE 群組）。
- 期限：2026/10/7 前上線（Jesse 決定，目標是盡快換掉舊平台，無外部硬期限）。

## Goals / Non-Goals

**Goals:**

- LINE Bot 最先上線開始累積訊息。
- 待辦（`/` 指令＋網頁＋演出模板）、`#` 靈感庫、每場企劃頁、演出前推播、LINE 登入與三種身分、操作紀錄。
- 財務頁一比一搬到新平台並通過對帳後切換。
- 全站手機優先、新視覺。

**Non-Goals:**

- OpenTix 追蹤搬遷、宣傳圖工具併入（第二波）。
- GitHub 組織、repo 私有化、fork PR 流程（第二波）。現階段 repo 必須維持 public，因為舊站還靠 GitHub Pages。
- 刪除舊靜態頁、`gas/Code.gs` 與清理各財務規格中的 Sheet 字眼（切換穩定後另開 change）。
- 專場的待辦、瀏覽紀錄。
- **任何語言模型 API 呼叫**（Jesse 決定不付 API 費用）。從聊天內容自動判斷待辦不做；之後若要做，另開 change 重新評估。
- 節目表與文件產生（第二波，另開 change）：在平台填節目表（開演時間；段落的名稱、類型、時長、上場者、內容／規則、道具、音效、投影），可從上個月複製；用固定欄位程式產生 rundown（時間點由開演時間＋時長累加，複製成表格貼進 Google Doc，欄位比照現有 rundown：節目／時間／預計時間點／內容／道具／音效／投影）、簡報各頁文字大綱、問卷題目清單；每份附「複製給 Claude 的指令」按鈕，由 Jesse 自己貼到 Claude 處理。
- 財務功能重新設計（只換視覺）。
- 財務預估搬進平台：預估是 Google Sheet 公式驅動的試算表，2026-10-03 Jesse 決定留在 Sheet 直接編輯，平台只放連結。

## Decisions

### 新平台放在 repo 子目錄 platform/

新 Next.js app 放 `platform/`，獨立 `package.json`、`wrangler.toml`、`supabase/migrations/`。舊靜態站留在根目錄繼續由 Pages 提供，切換當天前兩邊並存。替代方案：開新 repo——會讓 spec 與歷史分家，且第二波本來就要搬進 GitHub 組織時再一起整理，不值得現在拆。

### 沿用 Cloudflare 帳號、Supabase 另開帳號

Worker 名稱 `jokesonme`，部署在現有 Cloudflare 帳號（Jebby Dashboard 同帳號，額度實測 9/29–10/2 每日 1.2–1.5 萬次請求，遠低於 10 萬）。Supabase 用 Jesse 個人 Gmail（非公司信箱）以 email 方式註冊的新帳號、Tokyo 區域；不得用 Jebby 使用的 GitHub 登入建立（會佔 Jebby 帳號的免費名額），建立前先登出或用無痕視窗。GitHub 組織（第二波）由 Jesse 現有的公司 GitHub 帳號建立。金鑰一律 `wrangler secret put`，本機放 `platform/.env.local`（先確認 `.gitignore` 已排除）。

### 伺服器端單一存取路徑與角色守門

比照 Jebby：瀏覽器不直接連 Supabase；所有讀寫經 Next.js server（route handlers／server actions）用 secret key 存取，資料表 RLS 開啟且不給 anon／authenticated 任何 policy。每個資料入口第一行呼叫同一個角色守門函式（`requireRole`），依 `line-login-access` 的權限表回 401／403。財務夥伴的限制在這一層強制，不靠隱藏選單。

### LINE Login 與 LIFF 共用自建 session

**Supersedes**: jokesonme-platform-v2 / LINE Login 用 Auth.js、LIFF 換 session

不用 Auth.js：LIFF 本來就要自己簽 session，兩條路共用同一套較單純。電腦版走 LINE Login OAuth（`/api/auth/login` → LINE → `/api/auth/callback/line`，帶 state cookie 防 CSRF、nonce），LINE 內走 LIFF（`/liff` 取 ID token → `POST /api/auth/liff`）。兩者都向 LINE `oauth2/v2.1/verify` 驗 ID token 取得 `sub`（LINE userId），再簽發同一種 session cookie：`jk_session` = payload（userId、到期時間，30 天）＋ HMAC-SHA256（`AUTH_SECRET`），HttpOnly、Secure、SameSite=Lax。每個請求都重新讀 `users` 的 status／role，撤銷立即生效。Messaging API 與 LINE Login 同一 Provider，`users.id` 即 LINE userId。

Bot 建立待辦或靈感時，若作者或被 @ 的人還不在 `users`，用 LINE 群組成員 profile API 取顯示名稱建一列 `pending`（`last_login_at` 為 null 表示尚未登入），讓待辦能顯示名字、管理員也能預先核准。

### LINE webhook 與推播額度策略

`/api/line/webhook` 驗簽、只收已登記群組、以 message id 冪等寫入 `line_messages` 後回 200；`/` 指令在同一請求內建立待辦並用 reply token 回覆（reply 不計額度）。推播只有演出前提醒；每次推播記錄於 `line_pushes`，用量 = 推播次數 × 群組人數（8），每月上限 200。演出前推播 Cron 為 UTC `0 2 * * *`（台北 10:00，agent 預設值，Jesse 可改）。

### 一般聊天只保留 14 天

`line_messages` 只為了兩件事存在：指令的出處、以及「回覆某則訊息打 `#`／`/`」時查原文（LINE 不提供以 ID 讀文字訊息的 API）。所以一般聊天每天 03:30（台北，UTC `30 19 * * *`）由資料庫函式 `purge_line_messages(keep_days)` 刪除超過 14 天、且未被 `todo_sources`／`ideas` 引用的列；`keep_days < 14` 一律 raise（下限寫死在函式內），函式只刪 `line_messages`。`line_messages` 不掛 audit trigger（原始聊天不是平台資料，且會讓儲存量翻倍）。實測一則訊息約 300 bytes、對應 audit 列約 550 bytes；全部永久保存在每天 1,000 則（估計）時一年約 440 MB，逼近免費版 500 MB。替代方案：只存指令——回覆功能做不到，Jesse 選 14 天。

### 指令解析不用語言模型

**Supersedes**: jokesonme-platform-v2 / 凌晨整理用 Claude API 結構化輸出

待辦與靈感只由明確指令產生：開頭 `/`／`／` 是待辦，`#`／`＃` 是靈感，以字串規則解析（去掉 mention 文字、mention 轉負責人）。用 LINE 回覆功能只打符號時，以 webhook 事件的 `quotedMessageId` 到 `line_messages` 查原文（LINE 是否在群組事件提供此欄位尚未驗證，任務 3.2 實測；拿不到就回用法說明，不建立）。替代方案：凌晨用 Claude 從對話自動判斷——Jesse 決定不使用 API，否決。

### 操作紀錄用資料庫觸發器

每張應用資料表掛同一個 trigger function 寫 `audit_log`（table、row_id、op、old、new、actor、at）。actor 來源：伺服器每次請求帶 `x-actor` header（PostgREST 會放進 `request.headers`），trigger 讀取；migration 腳本用 `set local app.actor = 'migration'`。兩者皆無則 raise exception。`audit_log` 撤銷所有角色的 update／delete，並加 `before update or delete` trigger 一律報錯。登入、核准、角色變更、匯出由伺服器寫 audit 事件列。替代方案：照 Jebby 在程式裡逐功能寫——會漏，否決。

### 財務一次搬遷與對帳閘門

1. Jesse 從 Google Sheet 下載 `.xlsx` 到 `RAW DATA/`（已 gitignore）。
2. `platform/scripts/migrate-from-sheet` 解析 xlsx，寫入 Supabase（拒絕在已有財務資料的目標執行）。
3. 計算規則搬成 `platform/lib/finance/` 的純函式（收入分配、稅務預留、共同基金、成員結算、代墊還款），以舊前端／GAS 的同名邏輯為準，單元測試用同一份 xlsx 的資料當 fixture。
4. 切換當天，用瀏覽器讀出舊平台分析頁與收支頁顯示的每位成員結算、代墊餘額、各專案收支，存成對帳基準；`reconcile` 腳本比對新平台數字，全部差額為 0 才切換。
5. 切換：舊頁面改為只顯示「已搬到新平台」連結，Sheet 改檢視權限、GAS 不再被呼叫。

### 視覺方向先選再套

先做 2–3 個待辦頁手機版 mockup（品牌橘為基礎、非暖白底、差異明顯），Jesse 選定後以 `/spectra-ingest` 寫入 `brand-design-system` delta，再套全站。選定前只做結構與功能，不做細部樣式。

## Implementation Contract

**行為（上線後可觀察）：**

- 群組任何訊息在數秒內出現在 `line_messages`；`/買膠帶` 立即建立待辦並在群組收到 Bot 回覆。
- `#讓觀眾投票` 立即出現在靈感庫並收到 Bot 回覆；回覆某則訊息打 `#` 會存下被回覆的那則。
- 每場演出的企劃頁看得到歸到該場的靈感、該場待辦與三份文件連結。
- 建立月號專案（附演出日）立即產生模板待辦，截止日為實際日期。
- 演出日前 3 天與前 1 天 10:00，群組收到一則列出未完成待辦的推播。
- 從 LINE 點連結直接進入已登入狀態；新人登入看到等待核准；財務夥伴只看得到財務頁。
- 任一資料變動都能在 `audit_log` 查到改前改後與操作者。

**資料形狀（Supabase）：** `users`（line_user_id PK、display_name、member_name、role、status）、`shows`（id、name、type、performance_date、status）、`todos`（id、title、show_id?、due_date?、done_at?、done_by?、source、created_by、deleted_at?）、`ideas`（id、text、author_user、show_id?、line_message_id?、archived_at?）、`show_links`（show_id、kind：rundown／presentation／survey、url）、`todo_assignees`、`todo_sources`（todo_id、line_message_id）、`line_messages`、`line_pushes`、`show_templates`／`show_template_items`（offset_days、default_assignee）、財務表（`transactions`、`settlements`、`advance_repayments`、`forecast`，含 `deleted_at`）、`audit_log`。

**錯誤處理：** webhook 失敗仍回 200 並記錄錯誤；推播失敗記錄，不自動重送（避免重複推播浪費額度）。

**驗收：** 各 spec 的 Scenario 皆有對應測試或手動檢查紀錄；對帳報告全數 pass；375px 下各頁無橫向捲動。

**範圍內：** `platform/` 全部、`.gitignore`、舊頁面切換導引。**範圍外：** 刪除舊檔、OpenTix、宣傳圖、GitHub 組織。

## Risks / Trade-offs

- [Workers 免費版程式大小上限（網路資料為壓縮後 3MB，未驗證）與每次請求 CPU 10ms] → 第一個 build 就用 `wrangler deploy --dry-run` 量大小；Jebby 同架構已在同帳號運作可作佐證。
- [4 天期限、工作量估 6–8 天] → 財務頁一比一照搬、分析與預估排最後；對帳不過就延後切換，舊平台照常使用。
- [沒人打指令的事不會變成待辦] → Jesse 接受；企劃頁與演出前推播讓遺漏較早被發現。
- [群組事件可能不帶 `quotedMessageId`] → 回覆指令功能降級為回用法說明，其他指令不受影響。
- [Supabase 免費版 7 天無請求暫停] → Bot 每天寫入即可避免；淡季加每日 cron 讀一次。
- [共用 Cloudflare 帳號，Jebby 的 API token 可覆蓋 jokesonme Worker] → 接受；在 Jebby 工作的 agent 不碰此 Worker。
- [`audit_log` 只能防應用程式層竄改；持有 `SUPABASE_DB_URL`（postgres 角色）的人仍可修改] → 定位為「防竄改」而非「不可竄改」；資料庫密碼只放 Jesse 本機與 wrangler secret
- [LINE reply token 有效期短] → 指令在 webhook 同一請求內同步處理並回覆。

## Migration Plan

1. Jesse 完成外部帳號設定（以個人 Gmail 註冊 Supabase、LINE Provider＋兩個 channel）。
2. Bot 收訊息先上線（就算其他功能未完成）。
3. 待辦、登入、推播、操作紀錄上線，8 人登入並核准。
4. 財務頁完成 → 下載 Sheet → 搬遷 → 對帳 → 全數 pass 才切換。
5. 回滾：切換前任何階段失敗，舊平台不受影響；切換後若發現問題，舊 Sheet 仍在（唯讀），可恢復 GAS 寫入權限回到舊平台。

## Open Questions

- 月號模板項目內容與截止天數：以舊 23 項為草稿，由 Jesse 刪改確認（任務內處理，不阻擋其他工作）。
- 財務夥伴的 LINE 帳號何時登入核准：Jesse 通知對方即可。
