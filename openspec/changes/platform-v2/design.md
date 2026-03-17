## Context

看我笑話工作室的財務與演出管理平台 v1 已上線（GitHub Pages + Google Apps Script + Google Sheets）。實際使用後回饋六大改進方向：功能面（非演出收支、編輯刪除、收支分類）、體驗面（Optimistic UI、收入支出切換）、視覺面（Liquid Glass）、排版面（Checklist 表格化）、報表面（完整財務分析）。

現有技術架構不變：純 HTML + CSS + vanilla JS，Google Apps Script 為 API，Google Sheets 為資料庫。

## Goals / Non-Goals

**Goals:**

- 讓收支紀錄操作更完整（CRUD）且更不容易出錯（固定分類 + 收支切換）
- 提升操作流暢度（Optimistic UI 避免不必要的 API 重新載入）
- 視覺升級為 Liquid Glass 靜態版，提高質感
- Checklist 改為清晰的表格排版
- 財務報表提供更完整的分析維度

**Non-Goals:**

- 不加入使用者驗證或權限管理
- 不引入前端框架（維持 vanilla JS）
- 不做 Liquid Glass 動態效果（hover 光澤流動等）
- 不做年度比較報表（等 Season 3 之後再說）

## Decisions

### 收支分類系統設計

使用固定的分類下拉選單取代原本的自由文字項目欄位。前端依收入/支出模式動態切換選項。分類清單硬編碼在前端 `shared.js`，不存 Google Sheets，因為分類很少變動且不需要跨裝置同步分類定義。

收入分類（6 項）：演出票房、付費會員、商演合作、周邊商品、品牌贊助、其他收入
支出分類（7 項）：場地租借、工作人員、設備道具、剪輯製作、行政雜支、平台手續、其他支出

Google Sheets「收支紀錄」表欄位從原本的 `item` 改為 `category` + `notes`。需對既有資料做相容處理：如果既有紀錄只有 item 沒有 category，讀取時歸類為「其他收入」或「其他支出」（依金額正負判斷）。

### 收入支出切換按鈕

表單頂部放置兩個互斥按鈕（支出/收入），預設選中「支出」。選中狀態用色彩區分：支出紅色調、收入綠色調。金額欄位只接受正數，送出時根據按鈕狀態決定正負號。

### 編輯刪除功能設計

每筆收支紀錄最右側新增操作欄「⋯」按鈕，點擊展開選單：
- 編輯：捲動至頁面上方表單，帶入該筆資料的所有欄位值（分類、備註、金額、墊款人、日期），表單按鈕文字改為「更新」，提交後呼叫 `updateTransaction` API
- 刪除：彈出 `confirm()` 確認對話框，確認後呼叫新增的 `deleteTransaction` API

Google Apps Script 需新增 `deleteTransaction` action，根據 row ID 刪除該列。

### Optimistic UI 策略

結清狀態切換和 Checklist 進度切換改為樂觀更新：
1. 使用者點擊後立即在 DOM 上更新樣式和文字
2. 背景非同步呼叫 API（不 await）
3. 如果 API 失敗，回滾 DOM 狀態並顯示錯誤提示

不需要整頁重新載入 `loadTransactions()` 或 `loadChecklist()`。

### Liquid Glass 靜態版視覺設計

純 CSS 實現，不依賴 JS 或外部函式庫。核心技法：
- 背景：`linear-gradient` 柔和漸層（淡紫到淡藍到淡粉）
- 卡片：`background: rgba(255,255,255,0.55)`、`backdrop-filter: blur(20px)`、`border: 1px solid rgba(255,255,255,0.3)`
- 導航列：同樣的毛玻璃效果，`position: sticky`
- 圓角統一加大到 `16px`
- 陰影改為更柔和的大範圍擴散：`0 8px 32px rgba(0,0,0,0.08)`
- 按鈕加微妙的 `backdrop-filter` 或半透明背景

`backdrop-filter` 是 GPU 加速的 CSS 屬性，所有現代瀏覽器（含行動裝置）均支援，不影響載入速度。

### Checklist 表格化佈局

每個類別用 `<table>` 呈現，表頭三欄：項目、負責人、進度。取代現有的 CSS Grid 鬆散排列。公關票備註維持在該項目下方展開，使用 `colspan` 佔滿整列。手機版保持表格但水平捲動。

### 財務報表欄位強化

在現有基礎上新增：
- 月度結算表：加合計列（最後一行顯示年度總計）
- 演出結算表：加合計列，「會員與其他收支」和「周邊商品收支」一併列入
- 代墊追蹤表：從只顯示未結清改為三欄（未結清金額、已結清金額、總計），讓團員清楚自己累積墊了多少
- 收入/支出佔比：改用 `category` 欄位聚合（取代原本的 `item` 自由文字）

### 預設演出清單擴充

在 Google Apps Script `setupSheets()` 的 `DEFAULT_SHOWS` 陣列新增「會員與其他收支」和「周邊商品收支」。對已初始化的 Google Sheets，透過前端 `addShow` API 補建（或在 Code.gs 的 setup 中檢查是否已存在再新增）。

## Risks / Trade-offs

- [既有資料相容] 收支紀錄表結構從 `item` 改為 `category` + `notes`，需要處理 v1 時期已輸入的資料 → 讀取時做 fallback：無 category 的紀錄根據金額正負歸入「其他收入」或「其他支出」，item 值映射到 notes
- [Optimistic UI 資料不一致] 如果 API 失敗但 UI 已更新，會出現短暫不一致 → 加入失敗回滾邏輯，並用 toast 或 alert 提示使用者
- [backdrop-filter 相容性] 極少數舊瀏覽器不支援 → 設定 fallback 為純白不透明背景，不影響功能
