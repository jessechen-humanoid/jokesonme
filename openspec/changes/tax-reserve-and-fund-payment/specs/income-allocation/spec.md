## ADDED Requirements

### Requirement: paidByFund expenses excluded from member allocation

The system SHALL exclude any expense transaction with `paidByFund = true` from all per-member allocation calculations. Such transactions SHALL NOT contribute to any member's 年度分配淨利, regardless of their `excludedMembers` value.

#### Scenario: paidByFund expense does not reduce any member's share

- **WHEN** an expense of $13,000 is recorded with `paidByFund = true`
- **THEN** no member's 年度分配淨利 changes as a result of that transaction

#### Scenario: excludedMembers on paidByFund expense is ignored in allocation

- **WHEN** an expense transaction has `paidByFund = true` (regardless of its stored `excludedMembers` value)
- **THEN** the allocation engine treats the transaction as irrelevant and does not distribute any share to any member
