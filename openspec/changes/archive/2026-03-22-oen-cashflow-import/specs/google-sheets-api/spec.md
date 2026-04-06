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
- `batchImportTransactions`: create multiple transaction records in a single request

#### Scenario: Delete transaction action

- **WHEN** a POST request is sent with action `deleteTransaction` and a valid transaction ID
- **THEN** the corresponding row is removed from the "收支紀錄" sheet and a success response is returned

#### Scenario: Unknown action returns error

- **WHEN** a request is sent with an unrecognized `action` parameter
- **THEN** the API returns a JSON error response with an appropriate error message

#### Scenario: Batch import transactions

- **WHEN** a POST request is sent with action `batchImportTransactions` and a payload containing an array of transaction objects
- **THEN** the API appends all transactions to the "收支紀錄" sheet in a single operation and returns the count of imported records
