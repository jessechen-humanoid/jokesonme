# muji-design-system Specification

## Purpose

TBD - created by archiving change 'muji-redesign'. Update Purpose after archive.

## Requirements

### Requirement: MUJI colour palette

The system SHALL use the following fixed colour palette across all pages. No other decorative colours SHALL be introduced.

- Background: `#fafaf8`
- Primary text: `#1a1a1a`
- Secondary text: `#6b6b6b`
- Meta text: `#a0a09b`
- Border: `#e8e8e5`
- Border hover: `#c8c8c5`
- Gold accent: `#c9a96e`
- Secondary background (completed / inactive): `#f6f6f3`

#### Scenario: Page background uses MUJI background colour

- **WHEN** user opens any page
- **THEN** the page `body` background is `#fafaf8` (solid, no gradient)

#### Scenario: Primary text colour applied

- **WHEN** user views default text content
- **THEN** the text colour is `#1a1a1a`

#### Scenario: Accent usage is limited to emphasis

- **WHEN** user views a UI element intended for emphasis
- **THEN** the accent colour used is `#c9a96e`, and no other hue is used for emphasis


<!-- @trace
source: muji-redesign
updated: 2026-04-24
code:
  - js/import.js
  - RAW DATA/20260410_2026 支薪好友喜劇專場 《向上管理》_活動報名狀態_273筆.xlsx
  - .DS_Store
  - gas/Code.gs
  - RAW DATA/20260410_2026 好竹弋漫才專場 《直球》_活動報名狀態_75筆.xlsx
  - js/api.js
  - RAW DATA/20260410_看我笑話｜第 2 季 5 月號_活動報名狀態_142筆.xlsx
  - RAW DATA/20260412_應援撥款明細_444筆.xlsx
  - js/shared.js
  - demo.html
  - RAW DATA/20260410_看我笑話｜第 2 季 4 月號_活動報名狀態_148筆.xlsx
  - js/analytics.js
  - js/transaction.js
  - import.html
  - RAW DATA/20260412_應援票券訂單_515筆.csv
  - index.html
  - css/style.css
  - RAW DATA/20260412_應援訂單_85筆.csv
-->

---
### Requirement: Semantic colour exception for financial state

The system SHALL use desaturated semantic colours — and ONLY these — to indicate financial or state semantics:

- Negative / expense / unsettled / warning-negative: `#B04237`
- Positive / income / settled: `#4A7C59`
- Partial / warning: `#B89056`

Each semantic colour SHALL support a corresponding low-opacity background variant (alpha 0.1) for backgrounds of status badges or highlighted rows.

Semantic colours SHALL ONLY be applied to functional cues (amount signs, settlement status, warnings) and SHALL NOT be used for decorative purposes.

#### Scenario: Negative net profit is rendered in desaturated red

- **WHEN** a net profit value is negative
- **THEN** that value is rendered with colour `#B04237`

#### Scenario: Positive net profit is rendered in desaturated green

- **WHEN** a net profit value is positive
- **THEN** that value is rendered with colour `#4A7C59`

#### Scenario: Partial settlement state uses desaturated yellow

- **WHEN** an item is partially settled
- **THEN** the state indicator uses colour `#B89056`


<!-- @trace
source: muji-redesign
updated: 2026-04-24
code:
  - js/import.js
  - RAW DATA/20260410_2026 支薪好友喜劇專場 《向上管理》_活動報名狀態_273筆.xlsx
  - .DS_Store
  - gas/Code.gs
  - RAW DATA/20260410_2026 好竹弋漫才專場 《直球》_活動報名狀態_75筆.xlsx
  - js/api.js
  - RAW DATA/20260410_看我笑話｜第 2 季 5 月號_活動報名狀態_142筆.xlsx
  - RAW DATA/20260412_應援撥款明細_444筆.xlsx
  - js/shared.js
  - demo.html
  - RAW DATA/20260410_看我笑話｜第 2 季 4 月號_活動報名狀態_148筆.xlsx
  - js/analytics.js
  - js/transaction.js
  - import.html
  - RAW DATA/20260412_應援票券訂單_515筆.csv
  - index.html
  - css/style.css
  - RAW DATA/20260412_應援訂單_85筆.csv
-->

---
### Requirement: No decorative effects

The system SHALL NOT apply any of the following decorative effects to any element:

- `backdrop-filter` / `-webkit-backdrop-filter`
- `box-shadow`
- `text-shadow`
- `linear-gradient` / `radial-gradient` backgrounds
- `border-radius` greater than 0 (except circular avatars which SHALL use `border-radius: 50%`)

#### Scenario: Cards render without glass or shadow

- **WHEN** user views any card element
- **THEN** the card has a solid background, a 1px solid border, and no blur, shadow, or rounded corners

#### Scenario: Navigation bar renders flat

- **WHEN** user views the sticky navigation bar
- **THEN** the bar has a solid background and no backdrop blur

#### Scenario: Avatar is the only rounded element

- **WHEN** user views an avatar component
- **THEN** the avatar uses `border-radius: 50%` and all other elements use `border-radius: 0`


<!-- @trace
source: muji-redesign
updated: 2026-04-24
code:
  - js/import.js
  - RAW DATA/20260410_2026 支薪好友喜劇專場 《向上管理》_活動報名狀態_273筆.xlsx
  - .DS_Store
  - gas/Code.gs
  - RAW DATA/20260410_2026 好竹弋漫才專場 《直球》_活動報名狀態_75筆.xlsx
  - js/api.js
  - RAW DATA/20260410_看我笑話｜第 2 季 5 月號_活動報名狀態_142筆.xlsx
  - RAW DATA/20260412_應援撥款明細_444筆.xlsx
  - js/shared.js
  - demo.html
  - RAW DATA/20260410_看我笑話｜第 2 季 4 月號_活動報名狀態_148筆.xlsx
  - js/analytics.js
  - js/transaction.js
  - import.html
  - RAW DATA/20260412_應援票券訂單_515筆.csv
  - index.html
  - css/style.css
  - RAW DATA/20260412_應援訂單_85筆.csv
-->

---
### Requirement: Border styling

All bordered elements (cards, inputs, buttons, tables) SHALL use `1px solid #e8e8e5` as their default border. On hover (where interactive), the border colour SHALL change to `#c8c8c5`. Borders SHALL NOT be semi-transparent.

#### Scenario: Card uses solid border

- **WHEN** user views a card
- **THEN** the card border is `1px solid #e8e8e5`

#### Scenario: Interactive element border darkens on hover

- **WHEN** user hovers over an interactive bordered element
- **THEN** the border colour transitions to `#c8c8c5`


<!-- @trace
source: muji-redesign
updated: 2026-04-24
code:
  - js/import.js
  - RAW DATA/20260410_2026 支薪好友喜劇專場 《向上管理》_活動報名狀態_273筆.xlsx
  - .DS_Store
  - gas/Code.gs
  - RAW DATA/20260410_2026 好竹弋漫才專場 《直球》_活動報名狀態_75筆.xlsx
  - js/api.js
  - RAW DATA/20260410_看我笑話｜第 2 季 5 月號_活動報名狀態_142筆.xlsx
  - RAW DATA/20260412_應援撥款明細_444筆.xlsx
  - js/shared.js
  - demo.html
  - RAW DATA/20260410_看我笑話｜第 2 季 4 月號_活動報名狀態_148筆.xlsx
  - js/analytics.js
  - js/transaction.js
  - import.html
  - RAW DATA/20260412_應援票券訂單_515筆.csv
  - index.html
  - css/style.css
  - RAW DATA/20260412_應援訂單_85筆.csv
-->

---
### Requirement: Typography

The system SHALL use the font stack `-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans TC", sans-serif`. No custom weights beyond the regular 400 and semi-bold 600 SHALL be introduced.

#### Scenario: Default text renders in the MUJI font stack

- **WHEN** user views any page text
- **THEN** the text renders using the declared system font stack with Noto Sans TC fallback


<!-- @trace
source: muji-redesign
updated: 2026-04-24
code:
  - js/import.js
  - RAW DATA/20260410_2026 支薪好友喜劇專場 《向上管理》_活動報名狀態_273筆.xlsx
  - .DS_Store
  - gas/Code.gs
  - RAW DATA/20260410_2026 好竹弋漫才專場 《直球》_活動報名狀態_75筆.xlsx
  - js/api.js
  - RAW DATA/20260410_看我笑話｜第 2 季 5 月號_活動報名狀態_142筆.xlsx
  - RAW DATA/20260412_應援撥款明細_444筆.xlsx
  - js/shared.js
  - demo.html
  - RAW DATA/20260410_看我笑話｜第 2 季 4 月號_活動報名狀態_148筆.xlsx
  - js/analytics.js
  - js/transaction.js
  - import.html
  - RAW DATA/20260412_應援票券訂單_515筆.csv
  - index.html
  - css/style.css
  - RAW DATA/20260412_應援訂單_85筆.csv
-->

---
### Requirement: No emoji in UI chrome

The system SHALL NOT render emoji characters in UI chrome (navigation, buttons, labels, headings, static copy). Emoji present in user-entered content (such as transaction notes) SHALL be preserved.

#### Scenario: UI labels contain no emoji

- **WHEN** user views navigation labels, buttons, headings, form labels, and other static UI strings
- **THEN** no emoji characters appear in those strings

#### Scenario: User-entered notes preserve emoji

- **WHEN** a user has entered an emoji into a transaction's notes field
- **THEN** that emoji is displayed as entered when the transaction is rendered in lists

<!-- @trace
source: muji-redesign
updated: 2026-04-24
code:
  - js/import.js
  - RAW DATA/20260410_2026 支薪好友喜劇專場 《向上管理》_活動報名狀態_273筆.xlsx
  - .DS_Store
  - gas/Code.gs
  - RAW DATA/20260410_2026 好竹弋漫才專場 《直球》_活動報名狀態_75筆.xlsx
  - js/api.js
  - RAW DATA/20260410_看我笑話｜第 2 季 5 月號_活動報名狀態_142筆.xlsx
  - RAW DATA/20260412_應援撥款明細_444筆.xlsx
  - js/shared.js
  - demo.html
  - RAW DATA/20260410_看我笑話｜第 2 季 4 月號_活動報名狀態_148筆.xlsx
  - js/analytics.js
  - js/transaction.js
  - import.html
  - RAW DATA/20260412_應援票券訂單_515筆.csv
  - index.html
  - css/style.css
  - RAW DATA/20260412_應援訂單_85筆.csv
-->