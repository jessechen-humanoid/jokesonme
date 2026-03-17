# google-sheets-api Specification

## Purpose

TBD - created by archiving change 'build-platform'. Update Purpose after archive.

## Requirements

### Requirement: API deployed as Google Apps Script Web App

The system SHALL use a Google Apps Script project deployed as a Web App to serve as the API layer between the frontend and Google Sheets. The Web App SHALL accept both GET and POST requests.

#### Scenario: API responds to GET request

- **WHEN** the frontend sends a GET request with an `action` parameter
- **THEN** the API returns the requested data as a JSON response

#### Scenario: API responds to POST request

- **WHEN** the frontend sends a POST request with an `action` parameter and payload
- **THEN** the API processes the write operation and returns a JSON response with the result


<!-- @trace
source: build-platform
updated: 2026-03-17
code:
  - gas/Code.gs
  - .DS_Store
  - CLAUDE.md
-->

---
### Requirement: API action routing

The API SHALL route requests based on the `action` parameter. The following actions SHALL be supported:

- `getShows`: return the show list
- `addShow`: create a new show
- `getTransactions`: return transactions (filterable by show)
- `addTransaction`: create a new transaction
- `updateTransaction`: update a transaction (e.g., settlement status)
- `getChecklist`: return checklist items for a show
- `initChecklist`: initialize checklist from template for a show
- `updateChecklistItem`: update a checklist item (progress, assignee, notes)
- `addChecklistItem`: add a custom checklist item

#### Scenario: Unknown action returns error

- **WHEN** a request is sent with an unrecognized `action` parameter
- **THEN** the API returns a JSON error response with an appropriate error message


<!-- @trace
source: build-platform
updated: 2026-03-17
code:
  - gas/Code.gs
  - .DS_Store
  - CLAUDE.md
-->

---
### Requirement: CORS support

The API SHALL be configured to allow cross-origin requests from the GitHub Pages domain, enabling the static frontend to communicate with the Apps Script backend.

#### Scenario: Cross-origin request succeeds

- **WHEN** the frontend on GitHub Pages sends a request to the Apps Script Web App
- **THEN** the response includes appropriate CORS headers and the request succeeds


<!-- @trace
source: build-platform
updated: 2026-03-17
code:
  - gas/Code.gs
  - .DS_Store
  - CLAUDE.md
-->

---
### Requirement: Google Sheets structure

The API SHALL operate on a Google Sheets spreadsheet with four sheets:

1. **演出清單**: show name, creation date, status
2. **收支紀錄**: show name, item description, amount, advance payment person, settlement status, date, recorded by
3. **Checklist**: show name, category, item name, assignee, progress status, notes
4. **Checklist模板**: category, item name, default assignee

#### Scenario: Sheets exist with correct structure

- **WHEN** the API processes any request
- **THEN** it operates on the correctly structured sheets without errors


<!-- @trace
source: build-platform
updated: 2026-03-17
code:
  - gas/Code.gs
  - .DS_Store
  - CLAUDE.md
-->

---
### Requirement: JSON response format

All API responses SHALL use JSON format with a consistent structure: `{ success: true, data: ... }` for successful operations and `{ success: false, error: "..." }` for failures.

#### Scenario: Successful response format

- **WHEN** a valid request is processed successfully
- **THEN** the response body is `{ "success": true, "data": <result> }`

#### Scenario: Error response format

- **WHEN** a request fails due to validation or processing error
- **THEN** the response body is `{ "success": false, "error": "<error message>" }`

<!-- @trace
source: build-platform
updated: 2026-03-17
code:
  - gas/Code.gs
  - .DS_Store
  - CLAUDE.md
-->