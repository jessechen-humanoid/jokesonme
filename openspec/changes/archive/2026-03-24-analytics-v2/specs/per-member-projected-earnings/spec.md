## MODIFIED Requirements

### Requirement: Per-member annual earnings report

The system SHALL display a per-member annual earnings table with the following columns from left to right:

1. **成員**: Member name
2. **已收款淨利**: Total settlement payments received by the member (sum of all settlement records)
3. **未收款淨利**: Annual net profit minus settlements received (年度淨利 - 已收款淨利)
4. **代墊未結清**: Total unsettled advance payments by the member
5. **需匯款金額**: Amount to be paid to the member (未收款淨利 + 代墊未結清)
6. **年度淨利**: Full year projected net income (member's allocated income share minus equal expense split)

#### Scenario: Member with no settlements

- **WHEN** a member has 年度淨利 $13,465, no settlements, and no advances
- **THEN** the row shows: 已收款=$0, 未收款=$13,465, 代墊=$0, 需匯款=$13,465, 年度淨利=$13,465

#### Scenario: Member with partial settlement

- **WHEN** a member has 年度淨利 $13,465, settlements totaling $5,000, and unsettled advances of $6,000
- **THEN** the row shows: 已收款=$5,000, 未收款=$8,465, 代墊=$6,000, 需匯款=$14,465, 年度淨利=$13,465

#### Scenario: Annual net profit unchanged after settlement

- **WHEN** a settlement is recorded for a member
- **THEN** the 年度淨利 column remains unchanged (it always shows the full year projection)
