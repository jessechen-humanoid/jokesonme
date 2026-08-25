## MODIFIED Requirements

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
