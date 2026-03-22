## Context

目前 `renderShowSelector()` 每次頁面載入時渲染空的 `<select>`，使用者必須每次重新選擇演出。收支紀錄、演出準備、財務分析三個頁面都使用相同的 `renderShowSelector` 函式。

## Goals / Non-Goals

**Goals:**

1. 切換頁面後自動還原上次選擇的演出
2. 使用 sessionStorage，與密碼門機制一致

**Non-Goals:**

- 跨瀏覽器 / 跨裝置同步選擇

## Decisions

### D1: 使用 sessionStorage 儲存選擇

在 `renderShowSelector` 的 `onChange` 回呼時存入 `sessionStorage.setItem('selectedShow', showName)`。頁面載入後，若 sessionStorage 有值且該演出存在於 select options 中，自動設定 `select.value` 並觸發 `onChange`。

理由：與密碼門使用相同機制，關閉分頁自動清除，不需額外清理邏輯。

## Risks / Trade-offs

- 若演出被刪除，sessionStorage 中的值會找不到對應 option，需做防禦性檢查（值不存在就忽略）
