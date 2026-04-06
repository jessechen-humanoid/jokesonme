## MODIFIED Requirements

### Requirement: Income and expense category breakdown

The system SHALL display income and expense category breakdowns as two pie charts rendered side by side using Canvas API. Each pie chart SHALL show category labels with percentages. Categories SHALL be sorted from largest to smallest percentage. The income pie chart SHALL appear on the left and the expense pie chart on the right.

#### Scenario: Pie charts displayed side by side

- **WHEN** the analytics page loads with transaction data
- **THEN** two pie charts are rendered: income breakdown on the left and expense breakdown on the right

#### Scenario: Categories sorted by percentage

- **WHEN** income has categories "演出票房" (60%) and "付費會員" (40%)
- **THEN** the pie chart displays "演出票房" first, then "付費會員"

## REMOVED Requirements

### Requirement: Advance payment overview
**Reason**: Advance payment information is now integrated into the member earnings table as the "代墊未結清金額" column.
**Migration**: No data migration needed; the data source (transaction records with advancedBy field) remains the same.
