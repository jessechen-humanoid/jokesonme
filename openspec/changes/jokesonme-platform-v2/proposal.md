## Why

看我笑話平台目前是 GitHub Pages 靜態頁＋Google Apps Script＋Google Sheet，靠一組共用密碼擋人，看不出誰做了什麼；待辦只有一個沒人用的演出 Checklist，大家真正討論事情的 LINE 群組完全沒接進來。Jesse 希望盡快（目標 2026/10/7）換成一個能用 LINE 帳號登入、手機好用、會自動從群組抓待辦、並集中管理財務的平台。LINE Messaging API 沒有歷史訊息 API，Bot 越晚進群組，漏掉的對話越多，所以要現在做。

## What Changes

- 新平台：Next.js 部署在 Cloudflare Workers（沿用現有 Cloudflare 帳號），資料放在以 Jesse 個人 Gmail 申請、與 Jebby 分開的新 Supabase 帳號（Tokyo）。新程式碼放在 repo 子目錄 `platform/`，舊靜態站在切換前繼續由 GitHub Pages 提供。
- LINE Bot 加入 8 人群組，每則訊息即時存進 Supabase。
- 訊息開頭是 `/` 或 `／` 時立即建立待辦，用 LINE @mention 指定負責人，Bot 以 reply（不計推播額度）回覆確認。
- 訊息開頭是 `#` 或 `＃` 時存成一則靈感；用 LINE「回覆」某則訊息並只打 `/` 或 `#`，會把被回覆的訊息存成待辦或靈感。全程不呼叫任何語言模型 API。
- 靈感庫頁（未歸類靈感，可指派到某場演出、可封存）；每場演出一頁企劃頁，集中該場的靈感、待辦，以及 rundown／簡報／問卷三個連結。
- 單一待辦清單：只有「完成／未完成」，可掛在某個專案底下；手機優先介面。
- 專案新增演出日期；月號專案建立時依模板自動產生有實際截止日的固定待辦。
- 演出前 3 天與前 1 天各推播一次未完成待辦到群組，畫面與推播一律顯示實際日期。
- **BREAKING** 用 LINE Login＋LIFF 登入取代共用密碼；新登入者需管理員核准，身分分成管理員／成員／財務夥伴（財務夥伴只看得到財務頁）。
- 資料庫層自動記錄所有資料變動，加上登入與匯出事件；紀錄只能新增。財務資料改為軟刪除。
- **BREAKING** 財務資料（專案清單、收支紀錄、成員結算、代墊還款、財務預估）一次從 Google Sheet 搬到 Supabase，財務頁面一比一照搬只換視覺；成員結算與代墊還款金額新舊完全一致才切換，切換後 Sheet 改唯讀封存、GAS 停止使用。
- **BREAKING** 廢除舊演出 Checklist 與 Checklist 模板，由待辦與演出模板取代。
- 視覺重新設計：以品牌橘為基礎、捨棄暖白底；Jesse 已選定方向 C「橘色品牌感」，規格見 `brand-design-system` delta。

## Non-Goals (optional)

（見 design.md 的 Goals / Non-Goals。）

## Capabilities

### New Capabilities

- `line-login-access`: LINE Login／LIFF 登入、等待核准白名單、三種身分與頁面權限
- `line-group-capture`: 群組訊息即時存檔、`/` 待辦與 `#` 靈感指令、回覆訊息指令、reply 確認
- `todo-board`: 單一待辦清單、完成／未完成、負責人、掛專案、手機介面
- `idea-library`: `#` 指令存下的靈感庫、指派到演出、封存
- `show-planning-page`: 每場演出的企劃頁（靈感＋待辦＋三份文件連結）
- `show-todo-templates`: 演出日期與月號模板自動產生有截止日的固定待辦
- `pre-show-reminders`: 演出前 3 天／前 1 天推播未完成待辦，顯示實際日期
- `audit-log`: 資料庫層自動記錄資料變動、登入、匯出，紀錄只能新增
- `supabase-data-store`: 財務資料搬到 Supabase、對帳閘門、切換與封存
- `mobile-first-ui`: 所有頁面以手機寬度為主要設計目標

### Modified Capabilities

- `show-management`: 專案新增演出日期，資料改存 Supabase
- `password-gate`: 移除，由 `line-login-access` 取代
- `show-checklist`: 移除，由 `todo-board` 與 `show-todo-templates` 取代
- `brand-design-system`: 改用視覺方向 C「橘色品牌感」：中性淺灰底、頂部橘色區塊、無框圓角卡片（Jesse 2026-10-03 選定）

## Impact

- 新增：`platform/`（Next.js app、Worker 設定 `platform/wrangler.toml`、Supabase migrations `platform/supabase/migrations/`）
- 修改：`.gitignore`（排除 `.env*` 與 `platform/.env*`）
- 外部服務：新 Supabase 專案、LINE Official Account＋Messaging API channel＋LINE Login channel（同一 Provider）、現有 Cloudflare 帳號的新 Worker 與 Cron Trigger
- 切換後停用：`gas/Code.gs` 的 Web App 與 Google Sheet 寫入、舊靜態頁（`index.html`、`checklist.html` 等）；實際刪除舊檔與 `google-sheets-api` 規格清理留給後續 change
- 不在本 change：OpenTix 追蹤搬遷、宣傳圖工具併入、GitHub 組織與私有化、節目表與 rundown／簡報／問卷產生（第二波）；不使用任何語言模型 API
