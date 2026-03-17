# transaction-crud Specification

## Purpose

TBD - created by archiving change 'platform-v2'. Update Purpose after archive.

## Requirements

### Requirement: Edit transaction

The system SHALL allow users to edit an existing transaction. When the user clicks the edit action on a transaction row, the form at the top of the page SHALL be populated with the transaction's current values (category, notes, amount, advance payer, date). The submit button text SHALL change to "更新". Upon submission, the system SHALL update the existing transaction via the API.

#### Scenario: Edit button populates form

- **WHEN** user clicks edit on a transaction with category "場地租借", notes "三創", amount -8000
- **THEN** the form scrolls into view with expense mode selected, category "場地租借", notes "三創", amount 8000, and submit button showing "更新"

#### Scenario: Submit edited transaction

- **WHEN** user modifies the populated form and clicks "更新"
- **THEN** the existing transaction is updated via the API and the list refreshes

#### Scenario: Cancel edit returns to add mode

- **WHEN** user is in edit mode and clicks a cancel button
- **THEN** the form resets to empty add mode with submit button showing "新增"


<!-- @trace
source: platform-v2
updated: 2026-03-17
code:
  - index.html
  - js/analytics.js
  - CLAUDE.md
  - js/checklist.js
  - .DS_Store
  - js/transaction.js
  - js/api.js
  - js/shared.js
  - gas/Code.gs
  - css/style.css
-->

---
### Requirement: Delete transaction

The system SHALL allow users to delete an existing transaction. When the user clicks the delete action, a confirmation dialog SHALL appear. The transaction SHALL only be deleted after the user confirms.

#### Scenario: Delete with confirmation

- **WHEN** user clicks delete on a transaction and confirms the dialog
- **THEN** the transaction is removed from the Google Sheet and disappears from the list

#### Scenario: Delete cancelled

- **WHEN** user clicks delete on a transaction and cancels the dialog
- **THEN** the transaction remains unchanged


<!-- @trace
source: platform-v2
updated: 2026-03-17
code:
  - index.html
  - js/analytics.js
  - CLAUDE.md
  - js/checklist.js
  - .DS_Store
  - js/transaction.js
  - js/api.js
  - js/shared.js
  - gas/Code.gs
  - css/style.css
-->

---
### Requirement: Transaction row action menu

Each transaction row SHALL display a "⋯" action button in the rightmost column. Clicking the button SHALL reveal a menu with "編輯" and "刪除" options.

#### Scenario: Open action menu

- **WHEN** user clicks "⋯" on a transaction row
- **THEN** a menu appears with "編輯" and "刪除" options

#### Scenario: Close action menu

- **WHEN** user clicks outside an open action menu
- **THEN** the menu closes

<!-- @trace
source: platform-v2
updated: 2026-03-17
code:
  - index.html
  - js/analytics.js
  - CLAUDE.md
  - js/checklist.js
  - .DS_Store
  - js/transaction.js
  - js/api.js
  - js/shared.js
  - gas/Code.gs
  - css/style.css
-->