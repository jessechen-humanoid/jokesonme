## ADDED Requirements

### Requirement: Record transaction by show

The system SHALL allow users to record income and expense entries associated with a specific show. Each transaction SHALL include: show name, item description, amount (positive for income, negative for expense), date, and the person who recorded it.

#### Scenario: Add an income entry

- **WHEN** user selects a show, enters an item description, enters a positive amount, and submits
- **THEN** the transaction is saved to the "收支紀錄" sheet with the amount stored as a positive number

#### Scenario: Add an expense entry

- **WHEN** user selects a show, enters an item description, enters a negative amount, and submits
- **THEN** the transaction is saved to the "收支紀錄" sheet with the amount stored as a negative number

### Requirement: Track advance payments

The system SHALL allow users to record which member advanced money for an expense. The "墊款人" (who paid) field SHALL be optional — when left empty, the expense is treated as paid directly from the group fund.

#### Scenario: Record an expense with advance payment

- **WHEN** user enters an expense and selects a member in the "墊款人" field
- **THEN** the transaction is saved with the selected member recorded as the person who advanced the money

#### Scenario: Record an expense from group fund

- **WHEN** user enters an expense and leaves the "墊款人" field empty
- **THEN** the transaction is saved without an advance payment record

### Requirement: Track settlement status

The system SHALL track whether each transaction has been settled (結清). Users SHALL be able to mark a transaction as settled or unsettled. The default status for new transactions SHALL be unsettled.

#### Scenario: Mark a transaction as settled

- **WHEN** user clicks the settle button on an unsettled transaction
- **THEN** the transaction status changes to "已結清" and is persisted to the sheet

#### Scenario: View unsettled transactions

- **WHEN** user views the transaction list
- **THEN** unsettled transactions are visually distinguishable from settled ones

### Requirement: View transactions by show

The system SHALL allow users to filter and view all transactions for a selected show, displaying both income and expense items with their details.

#### Scenario: Select a show to view transactions

- **WHEN** user selects a show from the dropdown
- **THEN** all transactions for that show are displayed, showing item description, amount, advance payment person, and settlement status

### Requirement: Transaction persistence

All transactions SHALL be persisted to the "收支紀錄" sheet in Google Sheets. Data SHALL be retained across browser sessions and accessible from any device.

#### Scenario: Data persists after page reload

- **WHEN** user records a transaction and reloads the page
- **THEN** the previously recorded transaction is still visible
