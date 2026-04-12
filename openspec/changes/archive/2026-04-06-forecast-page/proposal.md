# forecast-page

## Why

目前財務預估只能在 Google Sheet 上查看和調整，成員需要開 Sheet 才能看到預估數字。新增網頁版「財務預估」頁面，讓成員可以直接在後勤平台上查看預估結果、調整參數，並即時連動 Google Sheet。

## What Changes

1. 新增 `forecast.html` 頁面，放在導覽列「財務分析」和「應援匯入」之間
2. 頁面顯示六個區塊：分潤規劃、基礎參數（可編輯）、版本參數（可編輯）、損益彙總、收入計算、支出計算
3. 基礎參數和版本參數支援直接編輯，按「儲存」批次寫回 Google Sheet
4. 儲存後自動重新讀取計算結果（Sheet 公式重算後的唯讀區塊）
5. GAS 新增 `getForecast` 和 `updateForecast` API

## Capabilities

### New Capabilities

- `forecast-page`: 財務預估頁面，讀取並顯示 Google Sheet「財務預估」工作表的六個區塊，支援參數編輯與批次儲存

### Modified Capabilities

- `google-sheets-api`: 新增 `getForecast` 讀取工作表、`updateForecast` 寫回參數

## Impact

- Affected specs: `forecast-page` (new), `google-sheets-api` (modified)
- Affected code: `forecast.html` (new), `js/forecast.js` (new), `js/shared.js` (nav update), `gas/Code.gs`
