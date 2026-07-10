## MODIFIED Requirements

### Requirement: Unsettled advance payments overview

The system SHALL display a summary of advance payments grouped by person, showing three columns: unsettled amount (未結清金額), settled amount (已結清金額), and total amount (總計).

The values SHALL be derived as follows:

- **總計** (total amount) = sum of absolute amounts of all "收支紀錄" transactions whose 墊款人 equals that member, regardless of settle status
- **已結清金額** (settled amount) = sum of all rows in the "代墊還款" ledger for that member
- **未結清金額** (unsettled amount) = 總計 − 已結清金額

The settled amount SHALL be sourced from the advance reimbursement ledger (capability `advance-reimbursement-ledger`), NOT from the per-transaction settle status.

#### Scenario: View advance payment summary with all columns

- **WHEN** user views the advance payments section
- **THEN** each member is listed with their unsettled amount, settled amount, and total advanced amount, where settled is the reimbursement ledger sum and unsettled is total minus settled

#### Scenario: Partially reimbursed member

- **WHEN** 柏文 has advanced 15,745 in total and the 代墊還款 ledger shows 7,665 reimbursed
- **THEN** the overview shows 柏文 with 總計 15,745, 已結清金額 7,665, 未結清金額 8,080
