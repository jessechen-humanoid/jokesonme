## MODIFIED Requirements

### Requirement: Automatic tax reserve expense per show and allocation group

The system SHALL automatically maintain "稅務預留" expense transactions for each show. For every show, the system SHALL group the transactions that count toward the reserve base by their excluded-members value and by the Taipei calendar year of their date, and for each distinct group with a positive reserve SHALL maintain exactly one auto-generated tax reserve expense transaction. Transactions that count toward the base are every positive-amount transaction and every refund (a transaction in the 退款 category, or a negative-amount transaction in an income category); platform fees and other expenses SHALL NOT reduce the base, and auto-generated tax reserve transactions SHALL NOT count. The base of a group SHALL be the sum of its counted amounts with a minimum of 0. The amount of the reserve SHALL equal the base × `TAX_RESERVE_RATE` (default 0.03) rounded to the nearest integer, stored as a negative number. The reserve SHALL have category 稅務預留, the auto-generated flag set, the group's excluded-members value, and a date equal to the latest date among the group's counted transactions, so that the reserve always falls in the same calendar year as the transactions it is computed from. A group whose reserve rounds to 0 SHALL have no reserve transaction. The show named 共同基金支出 SHALL have no reserve transactions. A reserve for one calendar year SHALL NOT change when transactions dated in a different calendar year are added, edited, or deleted.

#### Scenario: Show with only common income

- **WHEN** a show has three income transactions dated in 2026 with no excluded members totalling $30,000
- **THEN** the system maintains exactly one auto-generated expense with category 稅務預留, amount −900, no excluded members, and a date in 2026

#### Scenario: Show with mixed allocation groups

- **WHEN** a show has $10,000 of 2026 income with no excluded members and $8,000 of 2026 income excluding 芭樂
- **THEN** the system maintains two auto-generated tax reserve expenses: one of −300 with no excluded members and one of −240 excluding 芭樂

#### Scenario: Show with no income

- **WHEN** a show has no income transactions
- **THEN** the system maintains zero auto-generated tax reserve expenses for that show

#### Scenario: Refund reduces the base of its own year

- **WHEN** a show has $10,000 of 2026 income and a $2,000 refund dated in 2026 in the same allocation group
- **THEN** the 2026 reserve for that group is −240

#### Scenario: Income in a new year does not change the previous year

- **WHEN** a show has a 2026 reserve of −3,000 dated 2026-12-20 and a new $10,000 income dated 2027-01-05 is saved in the same allocation group
- **THEN** the 2026 reserve remains −3,000 dated 2026-12-20, and a second reserve of −300 dated 2027-01-05 is created

##### Example: one show across two years

| Counted transactions (date, amount) | Reserves maintained (date, amount) |
| ----------------------------------- | ---------------------------------- |
| 2026-12-20 +100,000 | 2026-12-20 −3,000 |
| 2026-12-20 +100,000; 2027-01-05 +10,000 | 2026-12-20 −3,000; 2027-01-05 −300 |
| 2026-12-20 +100,000; 2027-01-05 +10,000; 2027-02-01 −4,000 (refund) | 2026-12-20 −3,000; 2027-02-01 −180 |
| 2026-12-20 +100,000; 2027-01-05 −4,000 (refund) | 2026-12-20 −3,000 (the 2027 base is floored at 0, so no 2027 reserve) |

#### Scenario: Moving a transaction to another year recalculates both years

- **WHEN** an income of $10,000 dated 2026-12-28 is edited to be dated 2027-01-03, and it was the only 2026 income of its group
- **THEN** the 2026 reserve of that group is removed and a 2027 reserve of −300 dated 2027-01-03 exists
