## ADDED Requirements

### Requirement: Common fund display

The system SHALL display a "看我笑話共同基金" section on the Financial Analytics page. This section SHALL show:
- Common income (共同收入): sum of all income transactions where excludedMembers is empty
- Common expenses (共同支出): sum of all expense transactions where excludedMembers is empty
- Common net profit (共同淨利): common income + common expenses
- Fund allocation (提撥金額): common net profit × 20%

#### Scenario: View common fund with mixed transactions

- **WHEN** there are transactions with and without excluded members
- **THEN** only transactions with no excluded members are included in the common fund calculation

#### Scenario: View common fund with no shared transactions

- **WHEN** all transactions have excluded members
- **THEN** all common fund values display as $0

#### Scenario: View common fund with negative net profit

- **WHEN** common expenses exceed common income
- **THEN** common net profit is negative and fund allocation is also negative (20% of negative value)
