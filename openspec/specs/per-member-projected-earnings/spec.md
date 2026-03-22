# per-member-projected-earnings Specification

## Purpose

TBD - created by archiving change 'income-allocation-analytics'. Update Purpose after archive.

## Requirements

### Requirement: Per-member projected net earnings

The system SHALL calculate and display the projected annual net earnings for each member. The calculation SHALL be: sum of all income shares allocated to that member, minus total expenses divided by 8 (equal expense split). When no transactions exist, all members SHALL display NT$0.

#### Scenario: View per-member earnings with equal allocation

- **WHEN** all income transactions include all 8 members
- **THEN** each member's projected income equals total income divided by 8, minus total expenses divided by 8

#### Scenario: View per-member earnings with partial allocation

- **WHEN** some income transactions exclude certain members
- **THEN** excluded members receive no share from those transactions, resulting in lower projected earnings compared to fully-included members

#### Scenario: View per-member earnings with no data

- **WHEN** no transactions exist
- **THEN** all 8 members are listed with NT$0 projected net earnings

<!-- @trace
source: income-allocation-analytics
updated: 2026-03-17
code:
  - analytics.html
  - js/shared.js
  - js/checklist.js
  - js/transaction.js
  - gas/Code.gs
  - .DS_Store
  - js/analytics.js
  - index.html
  - css/style.css
  - js/api.js
-->