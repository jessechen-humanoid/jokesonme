# financial-analytics Specification

## Purpose

TBD - created by archiving change 'build-platform'. Update Purpose after archive.

## Requirements

### Requirement: Monthly net profit

The system SHALL calculate and display the net profit for each month by summing all income and expense transactions within that calendar month, across all shows. The table SHALL include a totals row at the bottom showing the yearly aggregate for income, expense, and net profit.

#### Scenario: View monthly net profit with totals

- **WHEN** user navigates to the Financial Analytics page
- **THEN** a monthly breakdown is displayed showing total income, total expenses, and net profit for each month, with a final row showing the yearly totals


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
### Requirement: Yearly net profit

The system SHALL calculate and display the total net profit for the current year by summing all transactions across all months and shows.

#### Scenario: View yearly net profit

- **WHEN** user views the Financial Analytics page
- **THEN** the yearly total net profit is prominently displayed


<!-- @trace
source: build-platform
updated: 2026-03-17
code:
  - gas/Code.gs
  - .DS_Store
  - CLAUDE.md
-->

---
### Requirement: Per-show profit and loss

The system SHALL calculate and display an independent profit and loss summary for each show, including total income, total expenses, and net profit. The table SHALL include "會員與其他收支" and "周邊商品收支" entries alongside regular shows. The table SHALL include a totals row at the bottom.

#### Scenario: View per-show P&L with totals

- **WHEN** user views the Financial Analytics page
- **THEN** each show (including non-performance categories) is listed with its total income, total expenses, and net profit, with a final row showing the aggregate totals


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
### Requirement: Income breakdown by category

The system SHALL display the proportion of income from each fixed category (演出票房, 付費會員, 商演合作, 周邊商品, 品牌贊助, 其他收入), showing both amounts and percentages. Aggregation SHALL use the transaction's category field.

#### Scenario: View income breakdown by fixed categories

- **WHEN** user views the income breakdown section
- **THEN** income is grouped by fixed category names and displayed with amounts and percentage of total income


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
### Requirement: Expense breakdown by category

The system SHALL display the proportion of expenses from each fixed category (場地租借, 工作人員, 設備道具, 剪輯製作, 行政雜支, 平台手續, 其他支出), showing both amounts and percentages. Aggregation SHALL use the transaction's category field.

#### Scenario: View expense breakdown by fixed categories

- **WHEN** user views the expense breakdown section
- **THEN** expenses are grouped by fixed category names and displayed with amounts and percentage of total expenses


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
### Requirement: Unsettled advance payments overview

The system SHALL display a summary of advance payments grouped by person, showing three columns: unsettled amount (未結清金額), settled amount (已結清金額), and total amount (總計).

#### Scenario: View advance payment summary with all columns

- **WHEN** user views the advance payments section
- **THEN** each member is listed with their unsettled amount, settled amount, and total advanced amount

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