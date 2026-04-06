# transaction-management Specification

## Purpose

TBD - created by archiving change 'build-platform'. Update Purpose after archive.

## Requirements

### Requirement: Record transaction by show

The system SHALL allow users to record income and expense entries associated with a specific show. Each transaction SHALL include: show name, category, notes (optional), amount (positive for income, negative for expense), date, and the person who recorded it. For expense transactions, an optional advance payment person (墊款人) field AND a member allocation checkbox grid SHALL both be available. For income transactions, only the member allocation checkbox grid SHALL be displayed.

#### Scenario: Add an expense entry

- **WHEN** user selects "支出" mode, selects a show, chooses a category, enters an amount, and submits
- **THEN** the transaction is saved with a negative amount, optional advance payment person, and the member allocation (excluded members stored as comma-separated names)

#### Scenario: Add an income entry

- **WHEN** user selects "收入" mode, selects a show, chooses a category, enters an amount, and submits
- **THEN** the transaction is saved with a positive amount and the member allocation (excluded members stored as comma-separated names)


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
### Requirement: Track advance payments

The system SHALL allow users to record which member advanced money for an expense. The "墊款人" (who paid) field SHALL be optional — when left empty, the expense is treated as paid directly from the group fund.

#### Scenario: Record an expense with advance payment

- **WHEN** user enters an expense and selects a member in the "墊款人" field
- **THEN** the transaction is saved with the selected member recorded as the person who advanced the money

#### Scenario: Record an expense from group fund

- **WHEN** user enters an expense and leaves the "墊款人" field empty
- **THEN** the transaction is saved without an advance payment record


<!-- @trace
source: build-platform
updated: 2026-03-17
code:
  - gas/Code.gs
  - .DS_Store
  - CLAUDE.md
-->

---
### Requirement: Track settlement status

The system SHALL track whether each transaction has been settled (結清). Users SHALL be able to mark a transaction as settled or unsettled. The default status for new transactions SHALL be unsettled. Status toggle SHALL use optimistic UI — the button state SHALL update immediately without reloading the transaction list, with background API persistence.

#### Scenario: Mark a transaction as settled

- **WHEN** user clicks the settle button on an unsettled transaction
- **THEN** the button immediately changes to "已結清" style, and the API is called in the background

#### Scenario: Settlement API failure rollback

- **WHEN** user clicks the settle button but the API call fails
- **THEN** the button reverts to its previous state and an error message is shown


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
### Requirement: View transactions by show

The system SHALL allow users to filter and view all transactions for a selected show. The transaction list SHALL display category, notes, amount, date, settlement status, and a combined allocation/advance column. For income transactions, the column SHALL show "全員" or "N/8 人" (with hover tooltip for included members). For expense transactions, the column SHALL show the allocation info ("全員" or "N/8 人") and the advance payment person if present.

#### Scenario: Select a show to view transactions

- **WHEN** user selects a show from the dropdown
- **THEN** all transactions for that show are displayed with the combined allocation/advance column

#### Scenario: View expense with partial allocation and advance payment

- **WHEN** user views a transaction list containing an expense with 5 members sharing and a specific advance payment person
- **THEN** the column displays both the allocation "5/8 人" and the advance payment person name


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
### Requirement: Transaction persistence

All transactions SHALL be persisted to the "收支紀錄" sheet in Google Sheets. Data SHALL be retained across browser sessions and accessible from any device.

#### Scenario: Data persists after page reload

- **WHEN** user records a transaction and reloads the page
- **THEN** the previously recorded transaction is still visible

<!-- @trace
source: build-platform
updated: 2026-03-17
code:
  - gas/Code.gs
  - .DS_Store
  - CLAUDE.md
-->