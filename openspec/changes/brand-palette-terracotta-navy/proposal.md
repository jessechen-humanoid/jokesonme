## Summary

把平台配色從「柿子紅＋米色紙＋橄欖灰」改成看我笑話的品牌三色：赤陶橘（主）、海軍藍（輔）、米白（底），並把灰階改成中性灰。

## Motivation

Jesse 2026-11-12 回饋現在的配色「有點老氣」，並指定看我笑話的基本配色是橘、藍、白，但不要太刺眼（參考 12 月號與 After Party 海報）。同一天的 code review 也量到三個可讀性問題：

- 最淡的文字色 `--ink-3` `#7A8074` 在白底對比 4.06、在米色底 3.64（已量測），13px 小字低於 4.5。
- 主要按鈕與下一場大卡是 `#E2673F` 底配白字，對比 3.36（已量測）。
- 選取狀態有多種樣子（白底、黑底、淡橘、實心橘），品牌橘也被用在圖表上，橘色到處都是。

Jesse 在三組橘藍搭配中選了 B 組「赤陶＋海軍藍」，並選定用法為「橘主、藍輔」。

## Proposed Solution

- 顏色 token 換成新的一組（完整色號見 design.md）：主色赤陶橘 `#C9562C`、輔色海軍藍 `#1F2F6E`（新增 `--accent` 系列 token）、底色米白 `#F5F1E6`、文字墨黑 `#17181C`，次要文字改成不帶綠的中性灰。
- 橘色只留給：下一場大卡、主要按鈕與右下角＋、目前導覽項、急件日期、未認領標籤、勾選框外框。
- 藍色負責：篩選與選項的選取狀態、行事曆選取的日期、圖表的主要系列、「看我笑話」系列標籤。
- 金額正負維持綠與紅，換成較乾淨的 `#1F7A4D` 與 `#C2382E`。
- 圖表不再使用品牌橘：收入組成與付費會員圖改用藍色系與中性灰。
- 瀏覽器與 LIFF 的 theme color 跟著改成新的主色。
- 介面改成「貼紙感」（Jesse 2026-11-12 選定）：最外層的卡片、主要按鈕、篩選膠囊加 2px 墨黑外框，大卡與主要按鈕加實心偏移陰影；卡片內部維持細線。
- 行事曆行程列拿掉「圓角卡片加左側色條」的樣式，改成前面一顆小圓點（Jesse 2026-11-12 回饋那種樣式太有 AI 感）。

## Non-Goals (optional)

## Alternatives Considered (optional)

- A 組「印刷油墨」（`#DD5A1C`＋`#2343B8`）與 C 組「柑橘＋鈷藍」（`#F07A2B`＋`#3360D6`）：Jesse 看過並排比較後選 B。
- 藍主橘輔、依演出輪替主色：Jesse 選了「橘主、藍輔」。
- 更早提出的紫色、黑黃方向：不符合品牌三色，已作廢。

## Impact

- Affected specs: brand-design-system
- Affected code:
  - Modified: platform/app/globals.css
  - Modified: platform/app/layout.tsx
  - Modified: platform/components/charts.tsx
  - New: none
  - Removed: none
- 不牽動 MCP／plugin：不動任何 API 端點或開發票操作函式。
