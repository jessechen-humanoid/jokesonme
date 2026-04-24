## ADDED Requirements

### Requirement: paidByFund flag on expense transactions

The system SHALL support a boolean field `paidByFund` on transactions. This field SHALL only be settable to true on expense transactions (amount < 0). When `paidByFund = true`, the system SHALL force `excludedMembers = ""` and SHALL hide the allocation checkbox grid in the transaction form.

#### Scenario: Creating an expense marked as paid by fund

- **WHEN** the user creates an expense with the "由共同基金支付" checkbox checked
- **THEN** the transaction is saved with `paidByFund = true` and `excludedMembers = ""`

#### Scenario: paidByFund cannot be set on income

- **WHEN** a transaction has `amount > 0`
- **THEN** the system SHALL persist `paidByFund = false` regardless of any input value

#### Scenario: Allocation grid hidden when paidByFund checked

- **WHEN** the "由共同基金支付" checkbox is checked on the expense form
- **THEN** the member allocation checkbox grid is hidden from the user interface

### Requirement: paidByFund expenses excluded from common expense aggregation

The system SHALL exclude any transaction with `paidByFund = true` from the calculation of "共同支出" (common expenses), regardless of its `excludedMembers` value. Consequently, paidByFund expenses SHALL NOT reduce "共同淨利" (common net profit), SHALL NOT affect fund allocation (共同淨利 × 20%), and SHALL NOT reduce any member's 年度分配淨利.

#### Scenario: paidByFund expense does not affect common net profit

- **WHEN** common income is $100,000, regular common expenses are $20,000, and a $13,000 expense with `paidByFund = true` exists
- **THEN** common net profit is calculated as $80,000 (not $67,000)

#### Scenario: paidByFund expense does not affect member distribution

- **WHEN** the same scenario above
- **THEN** each member's common-portion 年度分配淨利 = $80,000 × 80% ÷ 8 = $8,000 (not $6,700)

### Requirement: Common fund balance calculation

The system SHALL calculate and display the common fund balance as `累積提撥 − 已動用`, where:

- `累積提撥` = 共同淨利 × 20% (as currently specified in financial-analytics)
- `已動用` = absolute value of the sum of all transactions with `paidByFund = true`
- `基金餘額` = `累積提撥` − `已動用`

The balance SHALL be displayed in the "看我笑話共同基金" section of the Financial Analytics page.

#### Scenario: View fund balance with draws

- **WHEN** 累積提撥 is $20,000 and total paidByFund expenses sum to $13,000
- **THEN** the fund balance displays as $7,000

#### Scenario: View fund balance with no draws

- **WHEN** there are no paidByFund expenses
- **THEN** 已動用 displays as $0 and 基金餘額 equals 累積提撥

#### Scenario: Negative fund balance when draws exceed reserves

- **WHEN** 累積提撥 is $10,000 and paidByFund expenses sum to $13,000
- **THEN** 基金餘額 displays as −$3,000

### Requirement: "共同基金支出" virtual show defaults paidByFund to true

When a user creates an expense transaction where `show = "共同基金支出"`, the system SHALL default `paidByFund` to true (the checkbox SHALL render pre-checked). The user MAY uncheck it if they explicitly want otherwise.

#### Scenario: Selecting the virtual show auto-checks paidByFund

- **WHEN** the user selects show "共同基金支出" on the expense form
- **THEN** the "由共同基金支付" checkbox becomes checked by default

### Requirement: Annual accounting fee recorded from fund

The system SHALL, as part of the one-time migration, record one expense transaction with the following values: `amount = -13000`, `show = "共同基金支出"`, `category = "行政雜支"`, `paidByFund = true`, `notes = "年度會計費用"`.

#### Scenario: Accounting fee transaction exists after migration

- **WHEN** the one-time migration has been executed
- **THEN** exactly one transaction exists with `amount = -13000, show = "共同基金支出", category = "行政雜支", paidByFund = true, notes = "年度會計費用"`
