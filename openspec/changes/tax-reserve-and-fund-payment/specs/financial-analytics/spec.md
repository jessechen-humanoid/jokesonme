## MODIFIED Requirements

### Requirement: Common fund display

The system SHALL display a "看我笑話共同基金" section on the Financial Analytics page. This section SHALL show:

- Common income (共同收入): sum of all income transactions where `excludedMembers` is empty AND `paidByFund` is false
- Common expenses (共同支出): sum of all expense transactions where `excludedMembers` is empty AND `paidByFund` is false
- Common net profit (共同淨利): common income + common expenses
- Fund allocation (累積提撥): common net profit × 20%
- Fund draws (已動用): absolute value of the sum of all transactions where `paidByFund` is true
- Fund balance (基金餘額): 累積提撥 − 已動用

#### Scenario: View common fund with mixed transactions

- **WHEN** there are transactions with and without excluded members, and no paidByFund expenses
- **THEN** only transactions with no excluded members are included in 共同收入 / 共同支出, and 已動用 displays as $0

#### Scenario: View common fund with fund-paid expenses

- **WHEN** common income is $100,000, common expenses (non-paidByFund) are $20,000, and there is $13,000 of paidByFund expenses
- **THEN** 共同淨利 displays as $80,000, 累積提撥 displays as $16,000, 已動用 displays as $13,000, 基金餘額 displays as $3,000

#### Scenario: View common fund with no shared transactions

- **WHEN** all transactions have excluded members and there are no paidByFund expenses
- **THEN** 共同收入, 共同支出, 共同淨利, 累積提撥, 已動用, 基金餘額 all display as $0

#### Scenario: View common fund with negative net profit

- **WHEN** common expenses exceed common income
- **THEN** 共同淨利 is negative and 累積提撥 is also negative (20% of negative value)

#### Scenario: Fund balance can be negative when draws exceed reserves

- **WHEN** 累積提撥 is $10,000 and 已動用 is $13,000
- **THEN** 基金餘額 displays as −$3,000

### Requirement: Expense breakdown by category

The system SHALL display the proportion of expenses from each fixed category (場地租借, 工作人員, 設備道具, 剪輯製作, 行政雜支, 平台手續, 稅務預留, 其他支出), showing both amounts and percentages. Aggregation SHALL use the transaction's category field.

#### Scenario: View expense breakdown by fixed categories

- **WHEN** user views the expense breakdown section
- **THEN** expenses are grouped by the 8 fixed category names and displayed with amounts and percentage of total expenses

#### Scenario: 稅務預留 appears as its own category

- **WHEN** auto-generated tax reserve expenses exist
- **THEN** their aggregate amount is displayed under the "稅務預留" category row, separate from "其他支出"
