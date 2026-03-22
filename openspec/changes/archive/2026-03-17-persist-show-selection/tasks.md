## 1. 實作與部署 (D1: 使用 sessionStorage 儲存選擇, Persist show selection across page navigation)

- [x] 1.1 更新 `js/shared.js`：在 `renderShowSelector` 的 onChange 回呼中，將選中的演出名稱存入 `sessionStorage.setItem('selectedShow', showName)`；頁面載入渲染完 select 後，讀取 sessionStorage，若值存在且 option 中有對應項目，自動設定 select.value 並呼叫 onChange
- [x] 1.2 推送至 GitHub Pages 並驗證跨頁保持行為
