## MODIFIED Requirements

### Requirement: Per-member projected net earnings

The system SHALL calculate and display the projected annual net earnings for each member. The calculation SHALL be: sum of all income shares allocated to that member, minus sum of all expense shares allocated to that member. Expense shares SHALL be calculated per-transaction based on excluded members (the same mechanism as income allocation). When a transaction has no excluded members, all 8 members share equally. When no transactions exist, all members SHALL display $0.

#### Scenario: View per-member earnings with equal allocation

- **WHEN** all income and expense transactions include all 8 members
- **THEN** each member's projected net equals total income divided by 8, minus total expenses divided by 8

#### Scenario: View per-member earnings with partial expense allocation

- **WHEN** an expense of $8,000 excludes 3 members
- **THEN** the 5 included members each bear $1,600 of that expense, and the 3 excluded members bear $0

#### Scenario: View per-member earnings with no data

- **WHEN** no transactions exist
- **THEN** all 8 members are listed with $0 projected net earnings
