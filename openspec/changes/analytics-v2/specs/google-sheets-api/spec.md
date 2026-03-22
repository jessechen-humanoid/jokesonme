## MODIFIED Requirements

### Requirement: Google Sheets structure

The API SHALL operate on a Google Sheets spreadsheet with five sheets:

1. **專案清單**: project name, creation date, status
2. **收支紀錄**: project name, category, notes, amount, advance payment person, settlement status, date, recorded by
3. **Checklist**: project name, category, item name, assignee, progress status, notes
4. **Checklist模板**: category, item name, default assignee
5. **成員結算**: member name, amount, date, notes

#### Scenario: Sheets exist with correct structure

- **WHEN** the API processes any request
- **THEN** it operates on the correctly structured sheets without errors

### Requirement: API action routing

The API SHALL route requests based on the `action` parameter. The following actions SHALL be supported:

- `getShows`: return the project list
- `addShow`: create a new project
- `getTransactions`: return transactions (filterable by project)
- `addTransaction`: create a new transaction
- `updateTransaction`: update a transaction
- `deleteTransaction`: delete a transaction by row ID
- `getChecklist`: return checklist items for a project
- `initChecklist`: initialize checklist from template
- `updateChecklistItem`: update a checklist item
- `addChecklistItem`: add a custom checklist item
- `batchImportTransactions`: create multiple transaction records
- `getSettlements`: return all member settlement records
- `addSettlement`: add a new member settlement record

#### Scenario: Get settlements action

- **WHEN** a GET request is sent with action `getSettlements`
- **THEN** the API returns all rows from the "成員結算" sheet as JSON

#### Scenario: Add settlement action

- **WHEN** a POST request is sent with action `addSettlement` and payload containing member, amount, date, and notes
- **THEN** a new row is appended to the "成員結算" sheet and a success response is returned

#### Scenario: Unknown action returns error

- **WHEN** a request is sent with an unrecognized `action` parameter
- **THEN** the API returns a JSON error response with an appropriate error message
