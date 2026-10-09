## 1. 速度

- [x] 1.1 Worker 改用 targeted placement `aws:ap-northeast-1`；驗證：正式站回應標頭 `cf-placement: remote-NRT`，`bench.sh` 9 次中位數 /todos 0.68→0.35 秒、/shows 0.52→0.37、/calendar 0.58→0.41、/finance/transactions 0.56→0.45（2026-10-09 實測，同方法 A/B）
- [x] 1.2 依 Instant loading skeleton 新增登入後頁面共用載入骨架；驗證：本機以節流延遲伺服器回應，點導覽後 200ms 內截圖可見骨架、導覽列仍在；`prefers-reduced-motion` 時無動畫

## 2. 指令

- [x] 2.1 依 Idea keyword aliases 讓 `/筆記`、`/note` 等同 `/靈感` 並更新小抄；驗證：`npm test` 逐列涵蓋 spec 範例表與回覆＋`/note` 存被回覆訊息

## 3. 上線

- [ ] 3.1 部署後量測並請 Jesse 在手機上試換頁與 `/note`；驗證：正式站中位數不劣於 1.1 的數字、Jesse 確認 [after: 1.2, 2.1]
