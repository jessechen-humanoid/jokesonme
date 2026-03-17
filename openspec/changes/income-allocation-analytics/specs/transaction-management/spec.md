## MODIFIED Requirements

### Requirement: Record transaction by show

The system SHALL allow users to record income and expense entries associated with a specific show. Each transaction SHALL include: show name, category, notes (optional), amount (positive for income, negative for expense), date, and the person who recorded it. For expense transactions, an optional advance payment person (墊款人) field SHALL be available. For income transactions, a member allocation checkbox grid SHALL be displayed instead of the advance payment field.

#### Scenario: Add an expense entry

- **WHEN** user selects "支出" mode, selects a show, chooses a category, enters an amount, and submits
- **THEN** the transaction is saved with a negative amount and optional advance payment person

#### Scenario: Add an income entry

- **WHEN** user selects "收入" mode, selects a show, chooses a category, enters an amount, and submits
- **THEN** the transaction is saved with a positive amount and the member allocation (excluded members stored as comma-separated names)

### Requirement: View transactions by show

The system SHALL allow users to filter and view all transactions for a selected show. The transaction list SHALL display category, notes, amount, date, settlement status, and a combined allocation/advance column. For income transactions, the column SHALL show "全員" or "N/8 人" (with hover tooltip for included members). For expense transactions, the column SHALL show the advance payment person or "—".

#### Scenario: Select a show to view transactions

- **WHEN** user selects a show from the dropdown
- **THEN** all transactions for that show are displayed with the combined allocation/advance column
