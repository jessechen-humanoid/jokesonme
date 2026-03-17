## MODIFIED Requirements

### Requirement: Google Sheets transaction structure

The "收支紀錄" sheet SHALL use 9 columns: 演出名稱, 分類, 備註, 金額, 墊款人, 排除成員, 結清狀態, 日期, 登記人. The "排除成員" column SHALL store comma-separated member names representing members excluded from income allocation. An empty value SHALL indicate all members are included.

#### Scenario: Save income transaction with excluded members

- **WHEN** an income transaction is saved with 2 members unchecked
- **THEN** the "排除成員" column contains those 2 member names separated by commas, and the "墊款人" column is empty

#### Scenario: Save expense transaction

- **WHEN** an expense transaction is saved
- **THEN** the "排除成員" column is empty, and the "墊款人" column contains the advance payer name (if any)
