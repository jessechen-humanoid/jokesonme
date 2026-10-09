## Why

Jesse 2026-10-09 要求：(1) 平台讀取速度優化；(2) `/靈感` 之外，`/筆記`、`/note` 也要能存靈感。

量測（2026-10-09，台灣、同一條連線 9 次取中位數）：各頁 TTFB 0.52–0.68 秒，靜態檔基準 0.15 秒。原因：台灣請求被免費方案送到美國機房（cf-ray SJC/SEA），Smart Placement 又把 Worker 放在西雅圖（`cf-placement: remote-SEA`），而 Supabase 在東京，每次查詢都跨太平洋；Supabase 本身處理只需約 4ms（`x-envoy-upstream-service-time`）。另外所有頁面都沒有載入畫面，點分頁後畫面不動直到伺服器回應。

## What Changes

- Worker 改用 targeted placement 指定 `aws:ap-northeast-1`（東京），已實測生效（`cf-placement: remote-NRT`），中位數降到 0.35–0.45 秒。
- 新增登入後頁面共用的載入骨架（loading），點分頁立即出現頁面框架，資料到了再替換。
- 群組指令 `/筆記`、`/note`（不分大小寫）與 `/靈感` 效果相同；小抄同步說明。

## Non-Goals

- 不改資料存取方式（不換 Hyperdrive／直連 Postgres）；免費方案台灣→美國的網路路由無法調整。

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `line-group-capture`: 靈感指令別名
- `mobile-first-ui`: 換頁時立即顯示載入骨架

## Impact

- platform/wrangler.toml（placement）
- 新增 platform/app/(app)/loading.tsx；platform/app/globals.css（骨架樣式）
- platform/lib/line/commands.ts、platform/lib/line/commands.test.ts、platform/lib/line/webhook.test.ts
