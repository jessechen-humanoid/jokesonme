## 1. 安全前置與外部帳號

- [x] 1.1 `.gitignore` 排除 `.env*`、`platform/.env*`、`platform/.dev.vars`、`platform/.open-next/`、`platform/node_modules/`；驗證：建立假檔 `platform/.env.local` 後 `git status --porcelain` 不出現它，`git check-ignore -v platform/.env.local` 有命中規則，驗完刪除假檔
- [x] 1.2 Jesse 完成外部設定（依設計「沿用 Cloudflare 帳號、Supabase 另開帳號」與「Same-provider user identity」）：以 Jesse 個人 Gmail 註冊 Supabase（不用 GitHub 登入）並建 Tokyo 專案、LINE Provider 底下的 Messaging API channel＋LINE Login channel（含 LIFF app）、官方帳號後台「回應設定」允許加入群組、關閉自動回應、**Webhook 開啟**（與 Developers Console 的 Use webhook 是兩個開關，都要開），且 Provider 一旦建立 channel 就不能搬移，務必確認兩個 channel 在同一 Provider；驗證：Jesse 回報完成，agent 用 `wrangler secret list` 與讀取 `platform/.env.local` 的變數「名稱」（不讀值）確認齊全 [after: 1.1]

## 2. 平台骨架與資料庫基礎

- [x] 2.1 依「新平台放在 repo 子目錄 platform/」建立 Next.js＋`@opennextjs/cloudflare` 專案（Worker 名 `jokesonme`，自訂 `worker.ts` 承接 scheduled 事件），首頁回 200；驗證：`npm run cf:build > build.log 2>&1; echo 退出碼=$?` 為 0，`wrangler deploy --dry-run` 輸出的 bundle 大小記錄在任務備註，並部署後 `curl -s -o /dev/null -w "%{http_code}"` 首頁為 200（備註：2026-10-03 實測 `wrangler deploy --dry-run` 為 4560 KiB／gzip 957.57 KiB；部署後首頁 200）[after: 1.2]
- [x] 2.2 依「操作紀錄用資料庫觸發器」建立 migration：`audit_log` 表、共用 trigger function（讀 `request.headers` 的 `x-actor` 或 `app.actor`，皆無則 raise）、撤銷 update/delete 並加阻擋 trigger，滿足 Automatic data change logging、Actor attribution、Append-only audit log；驗證：測試對任一表 insert 無 actor 會失敗、有 actor 會產生 audit 列、`delete from audit_log` 以 service role 執行會報錯 [after: 2.1]
- [x] 2.3 建立核心資料表 migration（`users`、`shows`、`todos`、`todo_assignees`、`todo_sources`、`line_messages`、`line_pushes`、`ideas`、`show_links`、`show_templates`、`show_template_items`），每張都掛 audit trigger、RLS 開無 policy；驗證：`supabase db push` 成功，查 `pg_trigger` 每張應用表都有 audit trigger，anon key 讀任一表回 0 列或權限錯誤 [after: 2.2]
- [x] 2.4 伺服器端資料存取層：所有 Supabase 呼叫帶 `x-actor` header，提供 `requireRole` 角色守門（依「伺服器端單一存取路徑與角色守門」）；驗證：單元測試涵蓋 admin／member／finance_partner／pending／未登入五種情況的允許與拒絕 [after: 2.3]

## 3. LINE 收訊息（最先上線）

- [x] 3.1 依「LINE webhook 與推播額度策略」實作 `/api/line/webhook`：驗簽、只收登記群組、以 message id 冪等寫入 `line_messages`（含 mention 清單），滿足 Group message capture；驗證：測試涵蓋正常訊息、重送同一事件只留一列、錯誤簽章回 401、其他群組被忽略 [after: 2.3]
- [x] 3.2 部署並把 Bot 邀進 8 人群組，在 LINE Developers 設定 webhook URL，並實測群組事件是否帶 `quotedMessageId`（用 LINE 回覆功能發一則測試訊息）；驗證：群組發一則測試訊息後 `line_messages` 查得到該列，`audit_log` actor 為 `line-bot`；`quotedMessageId` 有無記錄在任務備註（2026-10-03 實測：群組回覆事件**有**帶 `quotedMessageId`；Bot 已進 8 人群組並自動登記，測試訊息存入、actor 為 `line-bot`）[after: 3.1]
- [x] 3.3 依「一般聊天只保留 14 天」實作 Ordinary chat retention：migration 拿掉 `line_messages` 的 audit trigger、新增 `purge_line_messages(keep_days)`（下限 14 天寫死、只刪未被引用的一般聊天），加每日 03:30 cron route；驗證：本機 DB 測試涵蓋 spec 範例表四列與「3 天被拒」，正式庫套用後手動呼叫一次回傳刪除筆數 [after: 3.1]

## 4. 登入與權限

- [x] 4.1 依「LINE Login 與 LIFF 共用自建 session」實作 LINE Login sign-in（電腦）與 30 天 session；驗證：單元測試 session 簽章（正確、竄改、過期）與 OAuth state 檢查；部署後 Jesse 用電腦實際登入一次、重開瀏覽器不需再登入（手動檢查紀錄）（2026-10-03 Jesse 電腦登入成功，`auth.login via=web` 有紀錄） [after: 2.4]
- [x] 4.2 實作 Automatic sign-in from LINE links：`/api/auth/liff` 驗證 LIFF ID token 後簽發同一種 session；驗證：單元測試偽造／過期 token 被拒；Jesse 在手機 LINE 點 LIFF 連結直接進入已登入頁（手動檢查紀錄） [after: 4.1]
- [x] 4.3 實作 Pending approval allowlist 與管理員核准頁（選角色、撤銷），並滿足 Same-provider user identity（users 以 line_user_id 為主鍵，Bot 訊息作者可對應到同一 user）；驗證：測試新登入者為 pending 且看不到任何資料、核准後可進入、撤銷後下一次請求被拒；群組訊息作者與網站登入者對應到同一列 [after: 4.1, 3.1]
- [x] 4.4 套用 Role-based page access 到所有頁面與資料入口；驗證：測試 finance_partner 直接呼叫待辦與訊息 API 回 403、member 呼叫核准 API 回 403 [after: 4.3]
- [x] 4.5 登入、核准、角色變更寫入 audit 事件（Login and export events 的登入部分）；驗證：測試一次登入與一次核准各產生一筆 audit 事件 [after: 4.3]

## 5. 視覺與手機版

- [x] 5.1 依「視覺方向先選再套」做 2–3 個待辦頁手機 mockup（Visual direction selection：品牌橘為基礎、非暖白底、彼此差異明顯），交給 Jesse 挑選；驗證：Jesse 選定一個方向（記錄選擇）（2026-10-03 Jesse 選 C「橘色品牌感」，mockup 在 `.spectra/design-cache/jokesonme-platform-v2/directions.html`）
- [x] 5.2 以 `/spectra-ingest` 把選定方向寫成本 change 的 `brand-design-system` delta spec，建立 design tokens 與全站版型，滿足 Mobile-first layout；驗證：`spectra validate jokesonme-platform-v2` 通過，375×812 下 `document.documentElement.scrollWidth` 等於視窗寬度 [after: 5.1, 2.1]
- [x] 5.3 依 Jesse 2026-10-03 回饋改版為 B1「柿子紅品牌版」（Jebby 版面、主色 `#E2673F`，取代方向 C），更新 `brand-design-system` delta，電腦版改左側欄；驗證：`spectra validate` 通過，手機 375px 與電腦 1280px 實際截圖檢查（手機底部分頁、電腦左側欄），375px 無橫向捲動 [after: 5.2]

## 6. 專案與待辦

- [x] 6.1 專案功能滿足 Show list shared across pages 與 Add new show（類型 monthly／special／other、月號必填演出日期）；驗證：測試月號缺日期被拒、新增後所有頁面下拉都出現 [after: 2.4]
- [x] 6.2 待辦頁滿足 Single todo list、Two-state completion、Todo assignment（未認領、認領、我的待辦）、Todo ordering；驗證：測試四種來源同列、完成記錄人與時間、排序 10/5→10/9→無日期、完成項預設隱藏 [after: 6.1, 4.4, 5.2]
- [x] 6.3 共用日期格式函式滿足 Absolute date display（`M/D（週）`），全站不得出現 `D-` 寫法；驗證：單元測試 2026-10-21→`10/21（三）`、2026-10-07→`10/7（三）`，並 grep 產出頁面無 `D-` 字樣 [after: 2.1]
- [x] 6.4 待辦詳情滿足 Todo source traceability（指令待辦顯示並連回原始群組訊息、回覆指令連到被回覆訊息、模板待辦顯示來源模板）；驗證：測試 `/買膠帶` 建立的待辦詳情顯示原文、作者、時間 [after: 6.2]

## 7. 群組指令

- [x] 7.1 webhook 加上 Slash command todo creation 與 Command usage reply（半形／全形、mention 當負責人、reply 回覆確認、只有符號且非回覆時回用法說明）；驗證：測試覆蓋 spec 範例表五種輸入，reply API 被呼叫、push API 未被呼叫 [after: 3.1, 6.2]
- [x] 7.2 依「指令解析不用語言模型」實作 Hash command idea capture（`#`／`＃` 開頭存成靈感、Bot 回「已存進靈感庫」）；驗證：測試覆蓋 spec 範例表四種輸入，並 grep `platform/` 確認沒有任何 LLM SDK 或 API 呼叫 [after: 7.1, 2.3]
- [x] 7.3 實作 Quote-reply commands（回覆某則訊息只打 `/` 或 `#` 時以被回覆訊息建立待辦或靈感，靈感作者記為原訊息作者；查不到被回覆訊息時回用法說明）；驗證：測試涵蓋查得到與查不到兩種情況；若 3.2 實測 LINE 不提供 `quotedMessageId`，此任務改為只實作「回用法說明」並在備註記錄 [after: 7.2, 3.2]

> 取消紀錄（非任務）：原 7.2「凌晨整理 Nightly extraction run」、7.3「Extraction run is idempotent and recorded」、7.4「真實環境試跑凌晨整理」已取消，取代決策為 design.md「指令解析不用語言模型」（Jesse 決定不使用 API）。

## 8. 靈感庫與企劃頁

- [x] 8.1 實作 Idea library page 與 Assign idea to a show（列出未歸類靈感、指派／移動／退回、封存與還原、網頁新增編輯）；驗證：測試指派後靈感離開靈感庫、封存後不出現、finance_partner 讀取回 403 [after: 7.2, 4.4, 5.2]
- [x] 8.2 實作 Monthly planning page 與 Show document links（演出名稱與日期、歸到該場的靈感、該場待辦、rundown／簡報／問卷三個連結欄位）；驗證：Playwright 在 375px 開啟企劃頁，看得到指派過來的靈感與待辦，貼上連結後點擊開新分頁 [after: 8.1, 6.2]

## 9. 演出模板與推播

- [x] 9.1 Jesse 與 agent 以舊 23 項 Checklist 為草稿定出月號模板（項目、預設負責人、相對天數），並滿足 Monthly show template（只有管理員可編輯）；驗證：Jesse 核准模板內容，member 呼叫模板編輯 API 回 403（2026-10-03 Jesse 逐項核對：21 項，刪除「簡報放所有成員的演出宣傳」「標記所有音樂／音效 cue 點」；模板頁只有 admin 可進，requirePage('admin')） [after: 4.4]
- [x] 9.2 實作 Template-generated due dates 與 No templates for special shows（改演出日會平移未完成模板待辦）；驗證：測試 spec 範例表三列、改日期後截止日平移、special 不產生待辦 [after: 9.1, 6.1]
- [x] 9.3 實作 Pre-show reminder schedule（UTC `0 2 * * *` = 台北 10:00、前 3 天與前 1 天、無未完成不推）與 Reminder content with actual dates（含 LIFF 連結、無 `D-`）；驗證：以固定「今天」測 spec 範例表三列，訊息含 `10/24（六）` 且不含 `D-` [after: 9.2, 6.3]
- [x] 9.4 落實 Push only for reminders：`line_pushes` 記錄每次推播，管理頁顯示本月用量（次數×8／200）；驗證：測試兩次推播顯示 16／200，並 grep 程式碼確認 push API 只在提醒模組被呼叫 [after: 9.3]
- [x] 9.5 依「LINE webhook 與推播額度策略」實作 Mention summary reply 與 No push messages：tag 傑瓜（mentionee isSelf）時以 reply 回覆待辦一覽，另 tag 他人時只列那些人；移除推播程式、演出前推播排程與推播頁；驗證：單元測試 spec 範例表兩列與「只列被 tag 的人」，grep 確認程式碼沒有 push／multicast／broadcast API，LINE quota consumption 維持 0 [after: 9.4]

> 取消紀錄（非任務）：原 9.3「Pre-show reminder schedule／Reminder content with actual dates」、9.4「Push only for reminders 用量頁」已被取代為 9.5（Jesse 2026-10-03：不做演出前推播，改 tag 傑瓜詢問）。這兩項曾實作並測試（預覽模式，未發出任何推播）；9.5 負責移除其程式碼（補償任務）。

## 10. 財務搬遷

- [x] 10.1 依「財務一次搬遷與對帳閘門」把計算規則抽成 `platform/lib/finance/` 純函式（收入分配、稅務預留、共同基金、成員結算、代墊還款），對照 `js/analytics.js`、`js/transaction.js`、`gas/Code.gs` 現行邏輯；驗證：以 Sheet 匯出 xlsx 當 fixture 的單元測試，結果與舊平台畫面數字一致 [after: 2.3]
- [x] 10.2 建立財務資料表 migration（`transactions`、`settlements`、`advance_repayments`、`forecast`，含 `deleted_at`）並實作 Financial soft delete；驗證：測試刪除後列表與總額排除、資料列仍在且標記刪除者 [after: 10.1]
- [x] 10.3 收支紀錄頁與應援 xlsx 匯入一比一搬到新平台（新視覺、手機版），滿足 Supabase as the single data store；驗證：Playwright 測新增／編輯／刪除交易與匯入範例檔，Sheet 不被寫入 [after: 10.2, 5.2, 4.4]
- [x] 10.4 成員結算、代墊還款、財務分析頁一比一搬遷（分析排最後），財務預估改為連到 Google Sheet 的「財務預估」分頁；匯出功能寫 audit 事件完成 Login and export events 的匯出部分；驗證：Playwright 逐頁開啟無錯誤、匯出一次產生 audit 事件 [after: 10.3]
- [x] 10.5 實作 One-time finance migration 腳本（讀 `RAW DATA/` 下的 Sheet xlsx、actor `migration`、目標已有財務資料即拒絕、不搬 Checklist 與財務預估、保留各表列順序）；驗證：對空的測試資料庫跑成功、再跑一次報錯且資料不變 [after: 10.2]
- [x] 10.6 實作 Reconciliation gate 對帳腳本：以舊平台畫面讀出的成員結算、代墊餘額、各專案收支與筆數為基準，比對新平台，差額全為 0 才輸出 pass；驗證：故意改一筆測試資料使報告出現 fail 並列出差異，還原後 pass [after: 10.4, 10.5]

## 11. 切換

- [x] 11.1 正式搬遷與對帳：Jesse 下載 Sheet xlsx → 跑搬遷 → 跑對帳；驗證：對帳報告全數 pass，Jesse 確認（2026-10-03 正式搬家：專案 29、收支 186、結算 32、代墊還款 13；對帳 102/102 一致；24 個專案稅務預留一致；Jesse 授權直接切換）[after: 10.6, 4.3]
- [x] 11.2 完成 Legacy archive after cutover：舊靜態頁改為只顯示新平台連結（取代 Password gate for all pages 與舊 Checklist 頁的入口；show-checklist 的 Initialize checklist from template 等需求一併移除），Sheet 改檢視權限、GAS 不再被呼叫；驗證：開舊 Pages 網址看到導引連結，瀏覽器網路紀錄無 `script.google.com` 請求 [after: 11.1]
- [x] 11.3 上線驗收（Jesse 2026-10-03 改為由他一人驗收，其他成員登入屬日常使用）：Jesse 電腦與 LINE 內登入、群組用 `/` 建立待辦、用 `#` 存靈感、tag 傑瓜收到待辦一覽，`audit_log` 有對應紀錄；更新 auto-memory 的部署檢查清單；驗證：Jesse 確認（2026-10-03：登入 web／liff 兩筆 auth.login、「整理 10 月財務」待辦與「看我募資」靈感已建立、tag 傑瓜有收到回覆；memory 已更新）[after: 11.2]
