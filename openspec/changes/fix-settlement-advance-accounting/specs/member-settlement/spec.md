## MODIFIED Requirements

### Requirement: Add settlement record

The system SHALL provide a button in the member earnings section to add a new settlement record. Clicking the button SHALL open a modal form with fields: member (dropdown), total payment amount (number), date (date picker), notes (text).

When a member is selected and that member has unsettled advance transactions:
- The modal SHALL display the total unsettled advance amount for that member
- The modal SHALL show a checkbox "一起結清代墊" (clear advances together), checked by default
- The modal SHALL label the amount field as "總匯款金額" (total payment sent)
- The modal SHALL display a real-time breakdown: profit settlement = total amount − advance amount, advance reimbursement = advance amount

When submitting the form with "一起結清代墊" checked:
- The system SHALL store settlement amount = total payment amount − unsettled advance total
- The system SHALL mark all unsettled advance transactions for that member as settled
- The system SHALL refresh the member earnings table

When submitting the form with "一起結清代墊" unchecked (or member has no advances):
- The system SHALL store settlement amount = total payment amount (unchanged behavior)
- The system SHALL NOT mark any advance transactions as settled

#### Scenario: Settlement with advance clearing

- **WHEN** user selects member "兔子" who has $5,000 unsettled advances, enters total amount $20,000, leaves "一起結清代墊" checked, and submits
- **THEN** a settlement record of $15,000 is saved, all advance transactions for "兔子" are marked settled, and the member earnings table shows 已收款淨利 +$15,000 and 代墊未結清 $0

#### Scenario: Settlement without advance clearing

- **WHEN** user selects member "兔子" who has $5,000 unsettled advances, enters amount $20,000, unchecks "一起結清代墊", and submits
- **THEN** a settlement record of $20,000 is saved and advance transactions remain unsettled

#### Scenario: Settlement for member with no advances

- **WHEN** user selects a member with no unsettled advances
- **THEN** the modal does not show the advance section and behaves as before

## ADDED Requirements

### Requirement: Historical advance settlement correction

The system SHALL provide a `fixAdvanceSettlements()` function in GAS that corrects settlement records where advance reimbursements were incorrectly included in the profit settlement amount.

The function SHALL:
1. Scan all transactions where `advancedBy` is set AND status is "已結清"
2. Group by member to compute total cleared advance amount per member
3. For each affected member, reduce their largest settlement record by the cleared advance total
4. Skip members where no settlement records exist or total settlement ≤ cleared advance amount (log a warning)
5. Return a summary of corrections made

The system SHALL provide a UI button in the analytics page to preview and execute this correction.

#### Scenario: Run correction for member with incorrect settlement

- **WHEN** `fixAdvanceSettlements()` is called and member "兔子" has $5,000 cleared advances and a $20,000 settlement record
- **THEN** the $20,000 settlement record is updated to $15,000 and the function returns a correction summary

#### Scenario: No correction needed

- **WHEN** `fixAdvanceSettlements()` is called and no members have cleared advances without corresponding correction
- **THEN** the function returns an empty correction summary and makes no changes
