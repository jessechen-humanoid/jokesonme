## ADDED Requirements

### Requirement: Income member allocation

The system SHALL allow users to select which members participate in the revenue split for each income transaction. The selection SHALL use checkboxes for all 8 members, with all members checked by default. Unchecked members SHALL be excluded from receiving a share of that income.

#### Scenario: Add income with default allocation (all members)

- **WHEN** user adds an income transaction without modifying the member checkboxes
- **THEN** the transaction is saved with no excluded members, meaning all 8 members share the income equally

#### Scenario: Add income with partial allocation

- **WHEN** user adds an income transaction and unchecks 2 members
- **THEN** the transaction is saved with those 2 members recorded as excluded, and the income is split among the remaining 6 members

#### Scenario: View allocation in transaction list

- **WHEN** user views the transaction list and a transaction has all members allocated
- **THEN** the allocation column displays "全員"

#### Scenario: View partial allocation in transaction list

- **WHEN** user views the transaction list and a transaction has excluded members
- **THEN** the allocation column displays "N/8 人" and hovering reveals the list of included members
