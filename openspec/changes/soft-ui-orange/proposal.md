## Summary

把介面從剛上線的「貼紙感」改成柔和立體的 Soft UI：沒有黑框、卡片微微浮起、按鈕是膠囊形，強調色只用橘色。

## Motivation

Jesse 2026-11-12 提供一張「Soft / System」參考圖，指定視覺要改成那個風格，只把參考圖的藍色換成橘色；看過假資料預覽後同意照做，並指定底部導覽列要保留圖示。這會取代同一天稍早上線的貼紙感（PR #13）與「橘主藍輔」的用色。

## Proposed Solution

- 卡片：拿掉 2px 墨黑外框，改成米白底上的雙向柔和陰影（左上亮、右下暗），圓角加大。
- 按鈕：全部膠囊形。主要按鈕橘色加橘色柔影；次要按鈕是浮起的米白。
- 輸入框、分段切換、進度條：往內凹；被選中的那一格浮起。
- 底部導覽（手機）：改成浮在畫面下方的圓角長條，圖示與文字都保留；電腦版側欄同樣是浮起的圓角面板。
- 強調色只有橘色：主色換成較亮的 `#DD5A1C`；篩選、選項、行事曆選到的日期都用橘色。海軍藍 `--accent` 系列移除。
- 圖表：分類系列改用橘色階、中性灰與一個霧灰 `--mist`。
- theme color 改成 `#DD5A1C`。
- 一併封存已上線的 change brand-palette-terracotta-navy，讓這次的規格修改接在它之後。

## Non-Goals (optional)

## Alternatives Considered (optional)

- 保留海軍藍當選取色：參考圖只有一個強調色，Jesse 指定「藍色改橘色」，所以不留。
- 沿用赤陶橘 `#C9562C`：在柔和風格的大面積上偏沉，改用較亮的橘；代價是白字對比由 4.33 降到 3.78（見 design.md）。

## Impact

- Affected specs: brand-design-system
- Affected code:
  - Modified: platform/app/globals.css
  - Modified: platform/app/layout.tsx
  - Modified: platform/components/charts.tsx
  - New: none
  - Removed: none
- 不牽動 MCP／plugin：不動任何端點或開發票操作函式。
