## Context

現有 rundown 是 Google Doc 表格（範例：RAW DATA/202605 看我笑話第 2 季 9 月號 Rundown.docx），欄位為節目順序／時間／預計時間點／內容／道具／音效／投影；第一列「觀眾進場 30 min 19:00 - 19:30」，之後開場、Talking、各組漫才、企劃 1–3、結尾，時間點逐段累加。簡報（RAW DATA/2026 看我笑話 9 月號 簡報.pptx）大致是每段的投影頁＋宣傳與問卷頁。平台已有演出頁（`/shows/[id]`）、audit trigger、軟刪除慣例；不使用任何 LLM API。

## Goals / Non-Goals

**Goals:**

- 平台上有一份可編輯的節目表，時間點自動算。
- 一鍵複製成 Google Doc 可直接貼上的 rundown 表格。
- 一鍵複製「給 Claude 的指令」，讓 Jesse 自己做簡報文字等客製。
- 下個月能從上一場整份複製再改。

**Non-Goals:**

- 問卷產生、Google Docs／Slides API、上場者結構化欄位（見 proposal Non-Goals）。

## Decisions

### 段落一張表、開始時間放在 shows

`program_items`（id、show_id、position、name、kind、minutes、content、props、sound、projection、軟刪除欄位）＋ `shows.program_start_time time not null default '19:00'`。開始時間是「第一段開始」的時間（範例第一段是觀眾進場 19:00），不另設「開演時間」，避免兩個時間互相換算。替代方案：整份節目表存成一個 JSON 欄位——編輯單段時會整份覆寫、audit 難讀，不採用。

### 順序用整數 position，上下移動交換兩段

手機上拖曳難用，改用「上移／下移」按鈕，伺服器端交換相鄰兩段的 position。新增段落 position = 目前最大值＋1。

### 時間點與輸出都是純函式

`program-render.ts` 的 `withTimes(start, items)` 回傳每段的 `from`／`to`（HH:MM，跨午夜照 24 小時制往上加不換日）；`rundownHtml`／`rundownText`／`claudePrompt` 都吃同一份結果。內容欄每一行轉成表格內的條列（`•`），空行略過。

### 複製到剪貼簿同時放 HTML 與純文字

瀏覽器用 `navigator.clipboard.write([new ClipboardItem({"text/html", "text/plain"})])`；Google Doc 吃 HTML 變成表格，LINE／記事本拿到 tab 分隔文字。不支援 ClipboardItem 時退回 `writeText` 純文字並提示。

### 從上一場複製

列出「其他有節目表的演出」（依演出日期新到舊）讓使用者選一場；只有本場還沒有任何段落時才允許複製，避免覆蓋。複製內容含開始時間與所有段落。

## Implementation Contract

**行為：** 演出頁有「節目表」入口（顯示段落數與總長度）；節目表頁可設開始時間、新增／編輯／刪除段落、上移下移、從上一場複製；「複製 Rundown」把表格放進剪貼簿；「複製給 Claude」把節目表文字＋指令放進剪貼簿；兩個按鈕成功後顯示「已複製」。

**資料形狀：** `program_items(show_id uuid fk shows, position int, name text not null 非空白, kind text default '', minutes int not null check 0..600, content/props/sound/projection text default '', created_at, deleted_at, deleted_by)`；RLS 開、只給 service_role select/insert/update、無 DELETE/TRUNCATE、掛 `attach_audit`。純函式：`withTimes(start: "HH:MM", items: {minutes:number}[]) → {from,to}[]`、`rundownHtml(rows)`、`rundownText(rows)`、`claudePrompt(show, rows)`。

**失敗處理：** 名稱空白或時長不是 0–600 的整數 → 表單顯示錯誤、不寫入；本場已有段落時「從上一場複製」按鈕不出現，伺服器端也拒絕；剪貼簿失敗顯示「複製失敗，請長按選取」。

**驗收：** `npm test` 涵蓋 spec 範例（時間點累加、表格欄位、條列轉換、Claude 文字包含所有段落）；`npm run test:db` 涵蓋無 actor 被拒、不能硬刪、anon 讀不到；本機以測試帳號實際操作新增／移動／複製並貼上檢查，測完清除。

**範圍：** 只做節目表與兩個複製按鈕；不動待辦、靈感、財務、LINE。

## Risks / Trade-offs

- [Google Doc 貼上樣式] 貼上的表格沿用 Doc 預設字型，不會跟原 rundown 樣式一模一樣 → 基本版接受，必要時之後加 inline style。
- [iOS Safari 剪貼簿] 需在使用者點擊的同一事件內呼叫 clipboard API → 按鈕直接在 onClick 內產生內容，不先 await 伺服器。
