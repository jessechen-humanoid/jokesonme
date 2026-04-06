# per-member-projected-earnings Specification Changes

## Modified Requirement: Per-member projected net earnings

The column label SHALL change from "年度淨利" to "年度分配淨利".

The calculation SHALL change to account for the common fund deduction:

- For the **common portion** (transactions where excludedMembers is empty): each member's share = (common net profit × 80%) ÷ 8
- For the **non-common portion** (transactions where excludedMembers is not empty): each member's share is calculated using the existing allocation logic (split among included members only)
- **年度分配淨利** = common portion share + non-common portion share

The "需匯款金額" (amount to transfer) calculation SHALL use the updated 年度分配淨利 value.

### Scenario: All transactions are shared equally

- **WHEN** no transactions have excluded members
- **THEN** each member's 年度分配淨利 = (total net profit × 80%) ÷ 8

### Scenario: Mixed shared and non-shared transactions

- **WHEN** common net profit is $100,000 and a member has $5,000 from non-shared transactions
- **THEN** that member's 年度分配淨利 = ($100,000 × 80% ÷ 8) + $5,000 = $15,000

### Scenario: No shared transactions exist

- **WHEN** all transactions have excluded members
- **THEN** common fund = $0, and each member's 年度分配淨利 equals only their non-shared portion
