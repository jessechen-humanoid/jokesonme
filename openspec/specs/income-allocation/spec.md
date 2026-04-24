# income-allocation Specification

## Purpose

TBD - created by archiving change 'income-allocation-analytics'. Update Purpose after archive.

## Requirements

### Requirement: Income member allocation

The system SHALL allow users to select which members participate in the revenue split for each income transaction. The selection SHALL use checkboxes for all 8 members, with all members checked by default. Unchecked members SHALL be excluded from receiving a share of that income.

The system SHALL also allow users to select which members share the cost for each expense transaction, using the same checkbox grid. All 8 members SHALL be checked by default. Unchecked members SHALL be excluded from bearing a share of that expense.

#### Scenario: Add income with default allocation (all members)

- **WHEN** user adds an income transaction without modifying the member checkboxes
- **THEN** the transaction is saved with no excluded members, meaning all 8 members share the income equally

#### Scenario: Add income with partial allocation

- **WHEN** user adds an income transaction and unchecks 2 members
- **THEN** the transaction is saved with those 2 members recorded as excluded, and the income is split among the remaining 6 members

#### Scenario: Add expense with default allocation (all members)

- **WHEN** user adds an expense transaction without modifying the member checkboxes
- **THEN** the transaction is saved with no excluded members, meaning all 8 members share the expense equally

#### Scenario: Add expense with partial allocation

- **WHEN** user adds an expense transaction and unchecks 3 members
- **THEN** the transaction is saved with those 3 members recorded as excluded, and the expense is split among the remaining 5 members

#### Scenario: View allocation in transaction list

- **WHEN** user views the transaction list and a transaction has all members allocated
- **THEN** the allocation column displays "全員"

#### Scenario: View partial allocation in transaction list

- **WHEN** user views the transaction list and a transaction has excluded members
- **THEN** the allocation column displays "N/8 人" and hovering reveals the list of included members

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
### Requirement: paidByFund expenses excluded from member allocation

The system SHALL exclude any expense transaction with `paidByFund = true` from all per-member allocation calculations. Such transactions SHALL NOT contribute to any member's 年度分配淨利, regardless of their `excludedMembers` value.

#### Scenario: paidByFund expense does not reduce any member's share

- **WHEN** an expense of $13,000 is recorded with `paidByFund = true`
- **THEN** no member's 年度分配淨利 changes as a result of that transaction

#### Scenario: excludedMembers on paidByFund expense is ignored in allocation

- **WHEN** an expense transaction has `paidByFund = true` (regardless of its stored `excludedMembers` value)
- **THEN** the allocation engine treats the transaction as irrelevant and does not distribute any share to any member

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