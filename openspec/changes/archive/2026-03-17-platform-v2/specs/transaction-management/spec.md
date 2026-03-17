## MODIFIED Requirements

### Requirement: Record transaction by show

The system SHALL allow users to record income and expense entries associated with a specific show. Each transaction SHALL include: show name, category (from fixed category list), optional notes, amount (always stored as positive for income, negative for expense), date, and the person who recorded it. The previous free-text item field is replaced by category and notes fields.

#### Scenario: Add an income entry

- **WHEN** user selects income mode, selects a category, optionally enters notes, enters a positive amount, and submits
- **THEN** the transaction is saved to the "收支紀錄" sheet with the category, notes, and amount as a positive number

#### Scenario: Add an expense entry

- **WHEN** user selects expense mode, selects a category, optionally enters notes, enters a positive amount, and submits
- **THEN** the transaction is saved to the "收支紀錄" sheet with the category, notes, and amount as a negative number

### Requirement: Track settlement status

The system SHALL track whether each transaction has been settled (結清). Users SHALL be able to mark a transaction as settled or unsettled. The default status for new transactions SHALL be unsettled. Status toggle SHALL use optimistic UI — the button state SHALL update immediately without reloading the transaction list, with background API persistence.

#### Scenario: Mark a transaction as settled

- **WHEN** user clicks the settle button on an unsettled transaction
- **THEN** the button immediately changes to "已結清" style, and the API is called in the background

#### Scenario: Settlement API failure rollback

- **WHEN** user clicks the settle button but the API call fails
- **THEN** the button reverts to its previous state and an error message is shown

### Requirement: View transactions by show

The system SHALL allow users to filter and view all transactions for a selected show, displaying category, notes, amount, advance payment person, date, settlement status, and an action menu for each row.

#### Scenario: Select a show to view transactions

- **WHEN** user selects a show from the dropdown
- **THEN** all transactions for that show are displayed with category, notes, amount, advance payment person, date, settlement status, and action button
