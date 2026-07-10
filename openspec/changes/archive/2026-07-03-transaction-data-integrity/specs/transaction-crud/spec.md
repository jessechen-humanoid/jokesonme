## MODIFIED Requirements

### Requirement: Edit transaction

The system SHALL allow users to edit an existing transaction. When the user clicks the edit action on a transaction row, the form SHALL be populated with the transaction's current values (category, notes, amount, advance payer, date). The submit button text SHALL change to "更新". Upon submission, the system SHALL update the existing transaction via the API, identifying it by its stable UUID. When editing, the system SHALL NOT overwrite the transaction's original date — the update payload SHALL omit the date field so the stored date is preserved. Only new transactions SHALL be stamped with today's date.

#### Scenario: Edit button populates form

- **WHEN** user clicks edit on a transaction with category "場地租借", notes "三創", amount -8000
- **THEN** the form scrolls into view with expense mode selected, category "場地租借", notes "三創", amount 8000, and submit button showing "更新"

#### Scenario: Editing preserves original date

- **WHEN** user edits a transaction dated three months ago, changing only its notes, and submits "更新"
- **THEN** the transaction is updated via the API and its stored date remains the original date, not today

#### Scenario: Update targets the correct row by UUID

- **WHEN** the update is submitted and other writes have since shifted sheet row positions
- **THEN** the backend locates the row by its UUID and updates the correct transaction

#### Scenario: Cancel edit returns to add mode

- **WHEN** user is in edit mode and clicks a cancel button
- **THEN** the form resets to empty add mode with submit button showing "新增"

### Requirement: Delete transaction

The system SHALL allow users to delete an existing transaction. When the user clicks the delete action, a confirmation dialog SHALL appear. Upon confirmation, the system SHALL delete the transaction identified by its stable UUID: the backend SHALL locate the row whose ID column matches the UUID and remove that row. If no row matches the UUID, the backend SHALL return `{ success: false, error: "找不到該筆交易（可能已被刪除）" }` and delete nothing.

#### Scenario: Delete targets the correct row by UUID

- **WHEN** user confirms deletion of a transaction and other writes have since shifted sheet row positions
- **THEN** the backend locates the row by its UUID and removes exactly that transaction, not another

#### Scenario: Delete of a missing UUID is rejected

- **WHEN** a delete request carries a UUID that matches no row
- **THEN** the backend returns `{ success: false, error: "找不到該筆交易（可能已被刪除）" }` and removes no row

#### Scenario: Delete cancelled

- **WHEN** user clicks delete on a transaction and cancels the dialog
- **THEN** the transaction remains unchanged
