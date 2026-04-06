## Summary

全站將「演出」改為「專案」，並將會員費匯入目標從「會員與其他收支」改為「看我笑話會員」，含既有資料修正。

## Motivation

平台不只管理演出，也包含會員訂閱、週邊商品、頻道等獨立收支項目。使用「演出」一詞會造成語義不符，改為「專案」更通用。同時，會員費收入應歸入「看我笑話會員」專案而非「會員與其他收支」。

## Proposed Solution

1. **UI 文字改名**：所有使用者可見的「演出」改為「專案」。保留不改的：「演出準備」（checklist 頁面名稱）、「演出票房」（收入分類）、「演出內容」（checklist 分類）
2. **GAS 後端**：Sheet tab 名稱「演出清單」→「專案清單」、error messages 中的「演出」→「專案」
3. **會員費匯入目標**：`import.js` 中硬編碼的「會員與其他收支」改為「看我笑話會員」
4. **既有資料修正**：在 GAS 新增一次性 migration action，將 Google Sheets 中「會員與其他收支」的會員費紀錄搬到「看我笑話會員」、rename sheet tab

## Impact

- Affected specs: `show-management`、`transaction-management`、`google-sheets-api`、`oen-cashflow-import`
- Affected code: `js/shared.js`、`js/analytics.js`、`js/import.js`、`js/transaction.js`、`js/checklist.js`、`import.html`、`index.html`、`analytics.html`、`checklist.html`、`gas/Code.gs`
