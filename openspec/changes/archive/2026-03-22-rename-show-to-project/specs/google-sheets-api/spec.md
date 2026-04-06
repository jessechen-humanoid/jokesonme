## MODIFIED Requirements

### Requirement: Google Sheets structure

The API SHALL operate on a Google Sheets spreadsheet with four sheets:

1. **專案清單**: project name, creation date, status
2. **收支紀錄**: project name, category, notes, amount, advance payment person, settlement status, date, recorded by
3. **Checklist**: project name, category, item name, assignee, progress status, notes
4. **Checklist模板**: category, item name, default assignee

#### Scenario: Sheets exist with correct structure

- **WHEN** the API processes any request
- **THEN** it operates on the correctly structured sheets without errors

## ADDED Requirements

### Requirement: Data migration action

The API SHALL support a `migrateRenameShowToProject` action that performs a one-time data migration:

1. Rename the sheet tab from "演出清單" to "專案清單" (if not already renamed)
2. Update all transaction records where showName is "會員與其他收支" and category is "付費會員" to use showName "看我笑話會員"

#### Scenario: Migration renames sheet and moves membership records

- **WHEN** a POST request is sent with action `migrateRenameShowToProject`
- **THEN** the sheet tab is renamed and matching membership records are updated
- **AND** a success response is returned with the count of updated records

#### Scenario: Migration is idempotent

- **WHEN** the migration action is called after it has already been executed
- **THEN** no changes are made and a success response is returned
