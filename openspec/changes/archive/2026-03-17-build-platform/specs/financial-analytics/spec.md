## ADDED Requirements

### Requirement: Monthly net profit

The system SHALL calculate and display the net profit for each month by summing all income and expense transactions within that calendar month, across all shows.

#### Scenario: View monthly net profit

- **WHEN** user navigates to the Financial Analytics page
- **THEN** a monthly breakdown is displayed showing total income, total expenses, and net profit for each month

### Requirement: Yearly net profit

The system SHALL calculate and display the total net profit for the current year by summing all transactions across all months and shows.

#### Scenario: View yearly net profit

- **WHEN** user views the Financial Analytics page
- **THEN** the yearly total net profit is prominently displayed

### Requirement: Per-show profit and loss

The system SHALL calculate and display an independent profit and loss summary for each show, including total income, total expenses, and net profit.

#### Scenario: View per-show P&L

- **WHEN** user views the Financial Analytics page
- **THEN** each show is listed with its total income, total expenses, and net profit

### Requirement: Income breakdown by category

The system SHALL display the proportion of income from each item category, showing both amounts and percentages.

#### Scenario: View income breakdown

- **WHEN** user views the income breakdown section
- **THEN** income items are grouped and displayed with their amounts and percentage of total income

### Requirement: Expense breakdown by category

The system SHALL display the proportion of expenses from each item category, showing both amounts and percentages.

#### Scenario: View expense breakdown

- **WHEN** user views the expense breakdown section
- **THEN** expense items are grouped and displayed with their amounts and percentage of total expenses

### Requirement: Unsettled advance payments overview

The system SHALL display a summary of all unsettled advance payments, grouped by the person who advanced the money, showing the total unsettled amount per person.

#### Scenario: View unsettled advances

- **WHEN** user views the unsettled advances section
- **THEN** each member with unsettled advances is listed with their total outstanding amount

#### Scenario: No unsettled advances

- **WHEN** all advance payments have been settled
- **THEN** the section displays a message indicating no outstanding advances
