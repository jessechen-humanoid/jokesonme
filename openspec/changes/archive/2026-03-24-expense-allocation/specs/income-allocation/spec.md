## MODIFIED Requirements

### Requirement: Income member allocation

The system SHALL allow users to select which members participate in the revenue split for each income transaction. The selection SHALL use checkboxes for all 8 members, with all members checked by default. Unchecked members SHALL be excluded from receiving a share of that income.

The system SHALL also allow users to select which members share the cost for each expense transaction, using the same checkbox grid. All 8 members SHALL be checked by default. Unchecked members SHALL be excluded from bearing a share of that expense.

#### Scenario: Add income with default allocation (all members)

- **WHEN** user adds an income transaction without modifying the member checkboxes
- **THEN** the transaction is saved with no excluded members, meaning all 8 members share the income equally

#### Scenario: Add income with partial allocation

- **WHEN** user adds an income transaction and unchecks 2 members
- **THEN** the transaction is saved with those 2 members recorded as excluded, and the income is split among the remaining 6 members

#### Scenario: Add expense with default allocation (all members)

- **WHEN** user adds an expense transaction without modifying the member checkboxes
- **THEN** the transaction is saved with no excluded members, meaning all 8 members share the expense equally

#### Scenario: Add expense with partial allocation

- **WHEN** user adds an expense transaction and unchecks 3 members
- **THEN** the transaction is saved with those 3 members recorded as excluded, and the expense is split among the remaining 5 members

#### Scenario: View allocation in transaction list

- **WHEN** user views the transaction list and a transaction has all members allocated
- **THEN** the allocation column displays "全員"

#### Scenario: View partial allocation in transaction list

- **WHEN** user views the transaction list and a transaction has excluded members
- **THEN** the allocation column displays "N/8 人" and hovering reveals the list of included members
