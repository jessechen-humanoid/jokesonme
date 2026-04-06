## Why

需要一個獨立的展示頁面，向團隊外部人員介紹這套表演團體財務管理工具的功能。展示頁面使用模糊化的假資料，並透過漂浮註解氣泡說明各項功能，讓訪客快速理解工具的價值。

## What Changes

- 新增獨立的 `demo.html`，不依賴現有 API / Google Sheets
- 包含三個 Tab：收支紀錄、財務分析、演出準備
- 所有資料為 hardcoded 假資料，財務數字經模糊化處理
- 純檢視模式，表單和按鈕不可操作
- 各功能區塊附有漂浮註解氣泡，說明功能用途
- 複用現有 CSS 視覺風格（liquid-glass UI）

## Capabilities

### New Capabilities

- `demo-showcase`: 獨立的展示頁面，含 tab 切換、假資料渲染、漂浮註解氣泡

### Modified Capabilities

（無）

## Impact

- 新增檔案：`demo.html`
- 不影響現有程式碼或功能
- 不需要 API 連線或 Google Sheets 存取
