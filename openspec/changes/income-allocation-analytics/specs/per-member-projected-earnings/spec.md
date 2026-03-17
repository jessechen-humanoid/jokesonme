## ADDED Requirements

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
