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

The system SHALL display a read-only settlement status for each transaction that has an advance payer (墊款人). The status SHALL be derived on the client from the advance reimbursement ledger (capability `advance-reimbursement-ledger`), NOT from the per-transaction settle column in the transactions sheet. Transactions without an advance payer SHALL display "—" in the settlement column.

Derivation SHALL be performed per member using FIFO offsetting: all transactions across all shows whose advance payer is the member are ordered by date ascending (ties broken by the original sheet row order as returned by the read API), and the member's reimbursement pool (the sum of that member's rows in the "代墊還款" ledger) is consumed in that order. For each transaction with advanced amount `A` (the absolute value of the transaction amount) and remaining pool `P`:

- `P >= A` → status is 已結清 (settled) and the pool decreases by `A`
- `0 < P < A` → status is 部分結清 (partially settled), the badge SHALL show the reimbursed amount, and the pool becomes 0
- `P = 0` → status is 未結清 (unsettled)

The settlement badge SHALL NOT be interactive: clicking it SHALL NOT change any state and SHALL NOT trigger any API request. The transaction list page SHALL load the full transaction set (no show filter) together with the reimbursement ledger to perform the derivation, and SHALL filter by the currently selected show only for rendering. The row-level unsettled highlight SHALL apply to transactions whose derived status is not 已結清.

If loading the reimbursement ledger fails, the transaction list SHALL still render, the settlement column SHALL display "—", and the existing error notification mechanism SHALL surface the load failure.

#### Scenario: Status reflects the reimbursement ledger without manual action

- **WHEN** a reimbursement covering a member's oldest advance transaction is recorded in the "代墊還款" ledger and the transaction list page is reloaded
- **THEN** that transaction's badge shows 已結清 with no manual interaction on the transaction list

#### Scenario: FIFO derivation across shows with partial settlement

- **WHEN** the transaction list derives settlement statuses for a member
- **THEN** the member's advance transactions across all shows are offset oldest-first against the member's reimbursement total, producing 已結清 / 部分結清 / 未結清 per transaction

##### Example: member with three advances and a partial pool

- **GIVEN** 柏文 advanced: 2026-04-01 $10,000 (show A), 2026-05-01 $12,933 (show B), 2026-06-01 $188 (show B), and 柏文's reimbursement ledger sums to $22,933
- **WHEN** the transaction list derives statuses
- **THEN** the 4/1 and 5/1 transactions show 已結清, the 6/1 transaction shows 未結清, and the sums match analytics: 已結清 $22,933, 未結清 $188

##### Example: partial settlement boundary

| Pool before | Advance amount | Status | Pool after | Badge annotation |
| ----------- | -------------- | ------ | ---------- | ---------------- |
| 15,352      | 15,028         | 已結清 | 324        | none             |
| 324         | 500            | 部分結清 | 0        | 已還 $324        |
| 0           | 324            | 未結清 | 0          | none             |

#### Scenario: Badge is not interactive

- **WHEN** user clicks the settlement badge on any transaction
- **THEN** no state changes and no API request is sent

#### Scenario: Reimbursement ledger load failure

- **WHEN** the transaction list loads and the reimbursement ledger request fails
- **THEN** the transaction list still renders, every settlement cell shows "—", and an error notification reports the failure


<!-- @trace
source: fix-advance-settle-badge
updated: 2026-08-25
code:
  - .agents/skills/spectra-drift/SKILL.md
  - .agents/skills/spectra-ingest/SKILL.md
  - .agents/skills/spectra-propose/SKILL.md
  - .agents/skills/spectra-commit/SKILL.md
  - CLAUDE.md
  - .agents/skills/spectra-ask/SKILL.md
  - AGENTS.md
  - .agents/skills/spectra-audit/SKILL.md
  - .agents/skills/spectra-apply/SKILL.md
  - .agents/skills/spectra-discuss/SKILL.md
  - .agents/skills/spectra-debug/SKILL.md
  - .agents/skills/spectra-archive/SKILL.md
-->

---
### Requirement: View transactions by show

The system SHALL provide a read API that returns transactions, optionally filtered by project name. Each returned transaction SHALL include its stable UUID `id`, category, notes, amount, advance payer, excluded members, settled status, date, recorder, paidByFund, and autoGenerated fields. The read SHALL include the ID column when reading sheet values.

#### Scenario: Read returns UUID ids

- **WHEN** the transaction read API is called
- **THEN** each returned transaction has a UUID string `id` (not a numeric row number)


<!-- @trace
source: transaction-data-integrity
updated: 2026-07-03
code:
  - CLAUDE.md
  - OPTIMIZATION_PLAN.md
-->

---
### Requirement: Transaction persistence

The system SHALL persist transactions as rows in the "收支紀錄" Google Sheet. Each transaction row SHALL carry a stable unique identifier (UUID) stored in a dedicated ID column, generated with `Utilities.getUuid()` at the time the row is appended. Every code path that appends a transaction row — manual add, batch import, and the auto-generated tax-reserve rows — SHALL populate this ID column. The read API SHALL return this UUID as the transaction's `id`. The identifier SHALL remain stable for the life of the transaction and SHALL NOT be derived from the sheet row number, so that row shifts caused by tax-reserve recalculation do not change any transaction's identity.

#### Scenario: New transaction gets a UUID

- **WHEN** a transaction is appended (manual add, batch import, or auto-generated tax reserve)
- **THEN** its ID column is filled with a freshly generated UUID and the read API returns that UUID as the transaction's `id`

#### Scenario: Identity survives row shifts

- **WHEN** a tax-reserve recalculation deletes and re-appends auto-generated rows, shifting other rows' positions
- **THEN** each existing transaction keeps the same UUID it had before the shift

#### Scenario: Existing rows backfilled with UUIDs

- **WHEN** the one-time backfill routine runs over rows whose ID column is empty
- **THEN** each such row receives a unique UUID, and rows that already have a UUID are left unchanged


<!-- @trace
source: transaction-data-integrity
updated: 2026-07-03
code:
  - CLAUDE.md
  - OPTIMIZATION_PLAN.md
-->

---
### Requirement: paidByFund field on transactions

The system SHALL persist a boolean field `paidByFund` on every transaction. For income transactions the value SHALL always be false. For expense transactions the value MAY be true or false.

#### Scenario: Field persists across sessions

- **WHEN** user saves an expense with `paidByFund = true` and reloads the page
- **THEN** the transaction still has `paidByFund = true`

#### Scenario: Income transactions always have paidByFund false

- **WHEN** any income transaction is saved
- **THEN** its `paidByFund` value is false regardless of any client-side input


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
### Requirement: autoGenerated field on transactions

The system SHALL persist a boolean field `autoGenerated` on every transaction. This field SHALL be true only for transactions produced by automated mechanisms (e.g., tax reserve auto-calculation) and SHALL NOT be settable by users through the normal transaction form.

#### Scenario: Manually created transaction is not auto-generated

- **WHEN** user creates a transaction via the transaction form
- **THEN** the saved transaction has `autoGenerated = false`

#### Scenario: System-created tax reserve is auto-generated

- **WHEN** the tax reserve recalculation creates a 稅務預留 expense
- **THEN** that transaction is saved with `autoGenerated = true`


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
### Requirement: "由共同基金支付" checkbox on expense form

The transaction form SHALL display a "由共同基金支付" checkbox ONLY when the expense mode is selected. When checked, the system SHALL hide the member allocation checkbox grid and force `excludedMembers = ""` on save.

#### Scenario: Checkbox appears only in expense mode

- **WHEN** user switches between income and expense modes on the form
- **THEN** the "由共同基金支付" checkbox is visible only in expense mode

#### Scenario: Checking the checkbox hides allocation grid

- **WHEN** user checks the "由共同基金支付" checkbox
- **THEN** the member allocation checkbox grid is hidden from the form


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
### Requirement: Auto-generated transaction write protection

The backend SHALL reject any `updateTransaction` request that attempts to change the `amount`, `category`, `excludedMembers`, or `paidByFund` of a transaction with `autoGenerated = true`. The backend SHALL reject any `deleteTransaction` request for a transaction with `autoGenerated = true` that is not part of an internal recalculation flow.

#### Scenario: Update attempt on auto-generated transaction rejected

- **WHEN** an `updateTransaction` request targets a row with `autoGenerated = true` and changes its amount
- **THEN** the backend responds with an error and the stored row is unchanged

#### Scenario: Delete attempt on auto-generated transaction rejected

- **WHEN** a user-initiated `deleteTransaction` request targets a row with `autoGenerated = true`
- **THEN** the backend responds with an error and the row is not removed


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
### Requirement: Auto-generated transaction visual tag in list

The transaction list SHALL display a visible "自動" tag on any row where `autoGenerated = true`, and SHALL render the edit and delete controls for that row in a disabled state.

#### Scenario: Auto tag rendered on auto-generated rows

- **WHEN** the transaction list renders a row with `autoGenerated = true`
- **THEN** a "自動" tag is visible on that row

#### Scenario: Edit and delete disabled on auto-generated rows

- **WHEN** the transaction list renders a row with `autoGenerated = true`
- **THEN** the edit and delete buttons on that row are visually disabled and non-interactive

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
### Requirement: Concurrency-safe writes

All write actions (add, update, delete, batch import, and any action that mutates the "收支紀錄" sheet including tax-reserve recalculation) SHALL acquire a script-level lock before mutating and release it afterward, so that concurrent writes are serialized. Read-only actions SHALL NOT acquire the lock. If the lock cannot be acquired within the wait timeout, the write SHALL fail with an error response rather than proceeding, leaving no partial write.

#### Scenario: Concurrent writes are serialized

- **WHEN** two write requests that both trigger tax-reserve recalculation arrive at the same time
- **THEN** they are processed one at a time and the resulting tax-reserve rows are correct with no duplicates

#### Scenario: Lock timeout fails cleanly

- **WHEN** a write action cannot obtain the script lock within the wait timeout
- **THEN** the action returns a failure response and makes no partial change to the sheet

<!-- @trace
source: transaction-data-integrity
updated: 2026-07-03
code:
  - CLAUDE.md
  - OPTIMIZATION_PLAN.md
-->