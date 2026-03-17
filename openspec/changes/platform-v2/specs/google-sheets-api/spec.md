## MODIFIED Requirements

### Requirement: API action routing

The API SHALL route requests based on the `action` parameter. The following actions SHALL be supported:

- `getShows`: return the show list
- `addShow`: create a new show
- `getTransactions`: return transactions (filterable by show)
- `addTransaction`: create a new transaction
- `updateTransaction`: update a transaction (e.g., settlement status, category, notes, amount)
- `deleteTransaction`: delete a transaction by row ID
- `getChecklist`: return checklist items for a show
- `initChecklist`: initialize checklist from template for a show
- `updateChecklistItem`: update a checklist item (progress, assignee, notes)
- `addChecklistItem`: add a custom checklist item

#### Scenario: Delete transaction action

- **WHEN** a POST request is sent with action `deleteTransaction` and a valid transaction ID
- **THEN** the corresponding row is removed from the "收支紀錄" sheet and a success response is returned

#### Scenario: Unknown action returns error

- **WHEN** a request is sent with an unrecognized `action` parameter
- **THEN** the API returns a JSON error response with an appropriate error message

### Requirement: Google Sheets structure

The API SHALL operate on a Google Sheets spreadsheet with four sheets:

1. **演出清單**: show name, creation date, status
2. **收支紀錄**: show name, category, notes, amount, advance payment person, settlement status, date, recorded by
3. **Checklist**: show name, category, item name, assignee, progress status, notes
4. **Checklist模板**: category, item name, default assignee

#### Scenario: Sheets exist with correct structure

- **WHEN** the API processes any request
- **THEN** it operates on the correctly structured sheets without errors
