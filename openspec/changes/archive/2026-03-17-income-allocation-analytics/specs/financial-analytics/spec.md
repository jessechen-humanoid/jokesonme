## MODIFIED Requirements

### Requirement: Analytics always render reports

The Financial Analytics page SHALL always render all report sections with their full structure, regardless of whether transaction data exists. When no data exists, all numerical values SHALL display as 0 or NT$0. The system SHALL NOT display an empty state message in place of reports.

#### Scenario: View analytics with no transactions

- **WHEN** user navigates to the Financial Analytics page and no transactions exist
- **THEN** all report sections (yearly summary, per-show P&L, income breakdown, expense breakdown, advance tracking, monthly breakdown, per-member earnings) are displayed with zero values

#### Scenario: Per-show P&L with no transactions

- **WHEN** no transactions exist
- **THEN** the per-show P&L table renders with the table header but no show rows, and a totals row showing all zeros
