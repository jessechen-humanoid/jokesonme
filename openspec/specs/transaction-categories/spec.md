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

Expense categories (7):
1. 場地租借
2. 工作人員
3. 設備道具
4. 剪輯製作
5. 行政雜支
6. 平台手續
7. 其他支出

#### Scenario: Income categories displayed when income mode selected

- **WHEN** user selects "收入" mode on the transaction form
- **THEN** the category dropdown displays exactly 6 income categories

#### Scenario: Expense categories displayed when expense mode selected

- **WHEN** user selects "支出" mode on the transaction form
- **THEN** the category dropdown displays exactly 7 expense categories


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