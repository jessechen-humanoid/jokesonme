# transaction-categories Specification

## Purpose

TBD - created by archiving change 'platform-v2'. Update Purpose after archive.

## Requirements

### Requirement: Fixed transaction categories

The system SHALL provide a fixed set of transaction categories, separated into income and expense types.

Income categories (6):
1. 演出票房
2. 付費會員
3. 商演合作
4. 周邊商品
5. 品牌贊助
6. 其他收入

Expense categories (8):
1. 場地租借
2. 工作人員
3. 設備道具
4. 剪輯製作
5. 行政雜支
6. 平台手續
7. 稅務預留
8. 其他支出

#### Scenario: Income categories displayed when income mode selected

- **WHEN** user selects "收入" mode on the transaction form
- **THEN** the category dropdown displays exactly 6 income categories

#### Scenario: Expense categories displayed when expense mode selected

- **WHEN** user selects "支出" mode on the transaction form
- **THEN** the category dropdown displays exactly 8 expense categories

#### Scenario: 稅務預留 category available for manual selection

- **WHEN** user opens the expense category dropdown
- **THEN** "稅務預留" appears as one of the selectable options


<!-- @trace
source: tax-reserve-and-fund-payment
updated: 2026-04-24
code:
  - RAW DATA/20260410_看我笑話｜第 2 季 5 月號_活動報名狀態_142筆.xlsx
  - RAW DATA/20260412_應援訂單_85筆.csv
  - js/api.js
  - js/analytics.js
  - RAW DATA/20260410_看我笑話｜第 2 季 4 月號_活動報名狀態_148筆.xlsx
  - js/import.js
  - RAW DATA/20260410_2026 好竹弋漫才專場 《直球》_活動報名狀態_75筆.xlsx
  - js/transaction.js
  - .DS_Store
  - js/shared.js
  - gas/Code.gs
  - index.html
  - RAW DATA/20260410_2026 支薪好友喜劇專場 《向上管理》_活動報名狀態_273筆.xlsx
  - RAW DATA/20260412_應援撥款明細_444筆.xlsx
  - css/style.css
  - RAW DATA/20260412_應援票券訂單_515筆.csv
  - import.html
-->

---
### Requirement: Income and expense toggle

The system SHALL provide a toggle button to switch between income and expense modes. The default mode SHALL be expense (支出). The amount field SHALL accept only positive numbers; the system SHALL automatically apply the correct sign based on the selected mode.

#### Scenario: Default mode is expense

- **WHEN** user opens the transaction form
- **THEN** the expense button is selected by default

#### Scenario: Submit income entry with positive amount

- **WHEN** user selects income mode and enters amount 5000
- **THEN** the transaction is saved with amount +5000

#### Scenario: Submit expense entry with positive amount

- **WHEN** user selects expense mode and enters amount 8000
- **THEN** the transaction is saved with amount -8000


<!-- @trace
source: platform-v2
updated: 2026-03-17
code:
  - index.html
  - js/analytics.js
  - CLAUDE.md
  - js/checklist.js
  - .DS_Store
  - js/transaction.js
  - js/api.js
  - js/shared.js
  - gas/Code.gs
  - css/style.css
-->

---
### Requirement: Category replaces free-text item field

The transaction form SHALL use a category dropdown and a separate notes text field instead of the previous single free-text item field. The category field SHALL be required. The notes field SHALL be optional and allow free-text input for additional details.

#### Scenario: Submit transaction with category and notes

- **WHEN** user selects category "場地租借" and enters notes "三創場地4月"
- **THEN** the transaction is saved with category "場地租借" and notes "三創場地4月"

#### Scenario: Submit transaction with category only

- **WHEN** user selects category "演出票房" and leaves notes empty
- **THEN** the transaction is saved with category "演出票房" and empty notes


<!-- @trace
source: platform-v2
updated: 2026-03-17
code:
  - index.html
  - js/analytics.js
  - CLAUDE.md
  - js/checklist.js
  - .DS_Store
  - js/transaction.js
  - js/api.js
  - js/shared.js
  - gas/Code.gs
  - css/style.css
-->

---
### Requirement: Legacy data compatibility

The system SHALL handle transactions created before the category system was introduced. Transactions without a category field SHALL be assigned "其他收入" (for positive amounts) or "其他支出" (for negative amounts), and the original item value SHALL be mapped to the notes field.

#### Scenario: Display legacy transaction without category

- **WHEN** a transaction from v1 has item "場地費" but no category field
- **THEN** the system displays category as "其他支出" (negative amount) and notes as "場地費"

<!-- @trace
source: platform-v2
updated: 2026-03-17
code:
  - index.html
  - js/analytics.js
  - CLAUDE.md
  - js/checklist.js
  - .DS_Store
  - js/transaction.js
  - js/api.js
  - js/shared.js
  - gas/Code.gs
  - css/style.css
-->