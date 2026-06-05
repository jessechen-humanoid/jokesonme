## MODIFIED Requirements

### Requirement: Per-member projected net earnings

The system SHALL calculate and display the projected annual distributed net earnings for each member. The column label SHALL be "年度分配淨利".

The calculation SHALL account for the common fund deduction:

- For the **common portion** (transactions where excludedMembers is empty): each member's share = (common net profit × 80%) ÷ 8
- For the **non-common portion** (transactions where excludedMembers is not empty): each member's share SHALL be calculated using the existing allocation logic (split among included members only)
- **年度分配淨利** = common portion share + non-common portion share

The member annual report (成員年度報表) SHALL display these columns in order: 成員, 已收款淨利, 未收款淨利, 代墊未結清, 代墊已結清, 年度分配淨利. The report SHALL NOT include a "需匯款金額" column.

Column derivations:

- **已收款淨利** = sum of all rows in the "成員結算" sheet for that member (profit only)
- **未收款淨利** = 年度分配淨利 − 已收款淨利
- **代墊已結清** = sum of all rows in the "代墊還款" ledger for that member
- **代墊總額** = sum of absolute amounts of all "收支紀錄" transactions whose 墊款人 equals that member, regardless of settle status
- **代墊未結清** = 代墊總額 − 代墊已結清

The report SHALL satisfy the invariant 代墊已結清 + 代墊未結清 = 代墊總額 for every member. When 代墊未結清 is negative (reimbursed more than total advanced), the value SHALL be displayed as-is with a warning style and SHALL NOT be clamped.

#### Scenario: View per-member earnings with equal allocation

- **WHEN** all income and expense transactions include all 8 members
- **THEN** each member's 年度分配淨利 = (total net profit × 80%) ÷ 8

#### Scenario: View per-member earnings with mixed transactions

- **WHEN** common net profit is $100,000 and a member has $5,000 from non-shared transactions
- **THEN** that member's 年度分配淨利 = ($100,000 × 80% ÷ 8) + $5,000 = $15,000

#### Scenario: View per-member earnings with no shared transactions

- **WHEN** all transactions have excluded members
- **THEN** common fund = $0, and each member's 年度分配淨利 equals only their non-shared portion

#### Scenario: Member report columns and advance invariant

- **WHEN** 柏文 has 成員結算 rows summing to 30,000, a 代墊還款 ledger sum of 7,665, and 代墊總額 of 15,745
- **THEN** the report shows 已收款淨利 30,000, 代墊已結清 7,665, 代墊未結清 8,080, and 代墊已結清 + 代墊未結清 = 15,745 = 代墊總額

##### Example: member report row values

- **GIVEN** post-migration data for these members
- **WHEN** the member annual report renders
- **THEN** rows show:

| 成員 | 已收款淨利 | 代墊已結清 | 代墊總額 | 代墊未結清 |
| ---- | --------- | --------- | ------- | --------- |
| 柏文 | 30,000 | 7,665 | 15,745 | 8,080 |
| 又又 | 30,000 | 8,380 | 14,380 | 6,000 |
| 芭樂 | 30,000 | 1,600 | 1,600 | 0 |
| 兔子 | 30,000 | 6,000 | 6,000 | 0 |
| 巧達 | 30,000 | 0 | 0 | 0 |
