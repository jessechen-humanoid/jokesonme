# forecast-page Tasks

- [x] 在 `gas/Code.gs` 新增 `getForecast` API（Get forecast data）：讀取「財務預估」工作表的基礎參數（row 4-19）、版本參數（row 22-31）、收入計算、支出計算、損益彙總、分潤規劃，回傳結構化 JSON
- [x] 在 `gas/Code.gs` 新增 `updateForecast` API（Update forecast parameters）：接收 baseParams 和 versionParams，寫回工作表對應 cell
- [x] 新增 `forecast.html` 頁面（Forecast page display）：包含六個區塊的 DOM 結構
- [x] 新增 `js/forecast.js`：呼叫 getForecast 載入資料，渲染 Forecast read-only sections（分潤規劃、損益彙總、收入計算、支出計算）
- [x] 在 `js/forecast.js` 實作 Forecast editable parameters：基礎參數和版本參數的可編輯 input 欄位
- [x] 在 `js/forecast.js` 實作 Forecast batch save：「儲存參數」按鈕批次呼叫 updateForecast，完成後重新 getForecast 更新唯讀區塊
- [x] 修改 `js/shared.js` 導覽列：在「財務分析」和「應援匯入」之間加入「財務預估」連結
