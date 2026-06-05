## MODIFIED Requirements

### Requirement: Add settlement record

The system SHALL provide a button in the member earnings section to add a new settlement record. A settlement record represents profit distribution only and MUST NOT include any advance reimbursement amount.

Clicking the button SHALL open a modal form with fields: member (dropdown), amount (number, the profit amount), date (date picker), notes (text). The modal SHALL NOT display any advance section and SHALL NOT show a "一起結清代墊" checkbox. Submitting the form SHALL append one row to the "成員結算" sheet with the entered amount and SHALL refresh the member earnings table. Submitting SHALL NOT read, modify, or mark any advance transactions.

Advance reimbursements are recorded separately via the advance reimbursement ledger (see capability `advance-reimbursement-ledger`), not through this settlement form.

#### Scenario: Add a profit settlement

- **WHEN** user clicks "新增結算", selects member "兔子", enters amount 10000, date "2026-06-05", and submits
- **THEN** a new row [兔子, 10000, 2026-06-05, ...] is appended to the "成員結算" sheet, the member earnings table updates, and no advance transactions are modified

#### Scenario: Settlement modal has no advance section

- **WHEN** user opens the "新增結算" modal and selects any member, regardless of whether that member has advance transactions
- **THEN** the modal shows only member, amount, date, and notes fields, with no advance breakdown and no "一起結清代墊" checkbox

## REMOVED Requirements

### Requirement: Historical advance settlement correction

**Reason**: The automated correction (`fixAdvanceSettlements()`) deduces "advance reimbursement bundled into settlements" from cleared-advance status, but cleared status cannot distinguish advances reimbursed through a settlement from advances reimbursed separately or not yet reimbursed. In production it over-deducted for members with partially-reimbursed advances (柏文, 又又), understating their profit and hiding amounts still owed.

**Migration**: Advance reimbursement is now tracked in a dedicated append-only ledger (capability `advance-reimbursement-ledger`). Settlements record profit only. Historical production data is corrected once via `migrateAdvanceLedger`. The `fixAdvanceSettlements()` and `previewAdvanceFix()` functions, their HTTP action routes, their `js/api.js` wrappers, and the "修正代墊帳" UI button and `showFixAdvanceModal()` flow are removed.

### Requirement: Append-only historical advance settlement correction

**Reason**: This requirement was introduced by the superseded change `append-only-advance-settlement-fix`, which was deployed, found to be systematically wrong (it deducted the full cleared-advance total instead of only the bundled portion, over-correcting 柏文 and 又又), and replaced by the advance reimbursement ledger approach. The `fixAdvanceSettlements()` append-only correction function it specified no longer exists.

**Migration**: Profit settlement contamination is corrected once via `migrateAdvanceLedger`, and advance reimbursement is tracked in the `代墊還款` ledger (capability `advance-reimbursement-ledger`). No automated cleared-advance detection remains.

### Requirement: Advance settlement correction preview

**Reason**: This requirement (the `previewAdvanceFix()` dry-run preview) was introduced by the superseded change `append-only-advance-settlement-fix`. The automated correction it previewed has been removed, so the preview has no subject.

**Migration**: No preview is needed. Advance reimbursements are entered explicitly through the "新增代墊還款" form, and historical correction is a one-time `migrateAdvanceLedger` run whose result is verified directly against the member annual report.

### Requirement: Advance fix preview must precede execution in UI

**Reason**: This requirement (the "修正代墊帳" preview-then-confirm modal) was introduced by the superseded change `append-only-advance-settlement-fix`. The "修正代墊帳" button, `showFixAdvanceModal()`, and the underlying automated correction have all been removed.

**Migration**: The analytics page replaces the "修正代墊帳" button with a "新增代墊還款" action that records reimbursements into the ledger. Historical data is corrected once via `migrateAdvanceLedger`.
