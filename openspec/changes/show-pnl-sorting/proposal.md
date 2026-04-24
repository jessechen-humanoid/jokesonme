## Why

「各專案損益」表格目前只依 transactions 寫入順序顯示，使用者要找「哪個演出最賺」或「哪個演出最花錢」必須肉眼掃全表，表一旦變長就不實用。加入欄位排序能直接回答這些財務分析的高頻問題。

## What Changes

- 表格四個欄位（專案、收入、支出、淨利）的 `<th>` 改為可點擊
- 欄標旁顯示 `▲` / `▼` 指示當前排序欄與方向；當前排序欄加粗
- 點擊同一欄切換升 / 降；點擊另一欄切換到該欄的預設方向
- 支出欄照「絕對值」排序（降序 = 花最多在前），不是照負數實際值
- 專案欄使用 `localeCompare` 支援中文排序
- 表格初始狀態改為「淨利降序」（最賺的在前），取代目前的自然出現順序
- 合計列永遠釘在表格最底，不參與排序
- 不做狀態記憶：頁面重載回到初始狀態

## Non-Goals

- 不做多欄排序（shift-click 二級排序）——單一欄排序足夠
- 不做狀態記憶（localStorage / URL query）——重載回初始狀態，避免 state 管理複雜度
- 不新增「時間」欄或改變欄位結構——純加排序行為
- 不做 virtualization / 分頁——資料量不大

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `financial-analytics`: 新增「各專案損益」表格的欄位排序行為（互動需求），不改變資料計算邏輯

## Impact

- Affected specs: `financial-analytics`
- Affected code: `js/analytics.js`（`renderShowPnl()` 函式、加 `sortState` 與排序函數、rerender 機制）
- Affected styles: `css/style.css` 可能需加排序指示器樣式（若現有 MUJI table class 不足）
- 無後端 / GAS 改動，無資料結構變更，無 migration
