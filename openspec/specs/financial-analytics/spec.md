# financial-analytics Specification

## Purpose

TBD - created by archiving change 'build-platform'. Update Purpose after archive.

## Requirements

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
source: expense-allocation
updated: 2026-03-24
code:
  - RAW DATA/20260322_應援撥款明細_1筆.xlsx
  - .DS_Store
  - RAW DATA/.DS_Store
  - js/analytics.js
  - RAW DATA/20260322_應援撥款明細_220筆.xlsx
  - RAW DATA/20260322_看我笑話｜第 2 季 4 月號_活動報名狀態_142筆.xlsx
  - RAW DATA/20260322_2026 年度會議｜看我畫大餅_活動報名狀態_47筆.xlsx
  - js/transaction.js
  - index.html
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

---
### Requirement: Common fund display

The system SHALL display a "看我笑話共同基金" section on the Financial Analytics page. This section SHALL show:
- Common income (共同收入): sum of all income transactions where excludedMembers is empty
- Common expenses (共同支出): sum of all expense transactions where excludedMembers is empty
- Common net profit (共同淨利): common income + common expenses
- Fund allocation (提撥金額): common net profit × 20%

#### Scenario: View common fund with mixed transactions

- **WHEN** there are transactions with and without excluded members
- **THEN** only transactions with no excluded members are included in the common fund calculation

#### Scenario: View common fund with no shared transactions

- **WHEN** all transactions have excluded members
- **THEN** all common fund values display as $0

#### Scenario: View common fund with negative net profit

- **WHEN** common expenses exceed common income
- **THEN** common net profit is negative and fund allocation is also negative (20% of negative value)

<!-- @trace
source: common-fund
updated: 2026-04-06
code:
  - RAW DATA/20260322_應援撥款明細_1筆.xlsx
  - RAW DATA/20260322_2026 年度會議｜看我畫大餅_活動報名狀態_47筆.xlsx
  - .spectra.yaml
  - RAW DATA/.DS_Store
  - gas/Code.gs
  - analytics.html
  - RAW DATA/20260322_應援撥款明細_220筆.xlsx
  - js/analytics.js
  - RAW DATA/20260322_看我笑話｜第 2 季 4 月號_活動報名狀態_142筆.xlsx
  - .DS_Store
-->