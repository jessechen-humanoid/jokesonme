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


<!-- @trace
source: analytics-v2
updated: 2026-03-24
code:
  - js/api.js
  - .DS_Store
  - RAW DATA/20260322_2026 年度會議｜看我畫大餅_活動報名狀態_47筆.xlsx
  - js/shared.js
  - js/import.js
  - analytics.html
  - RAW DATA/20260322_應援撥款明細_1筆.xlsx
  - gas/Code.gs
  - css/style.css
  - js/transaction.js
  - RAW DATA/20260322_看我笑話｜第 2 季 4 月號_活動報名狀態_142筆.xlsx
  - js/analytics.js
  - RAW DATA/.DS_Store
  - index.html
  - RAW DATA/20260322_應援撥款明細_220筆.xlsx
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

The API SHALL operate on a Google Sheets spreadsheet with five sheets:

1. **專案清單**: project name, creation date, status
2. **收支紀錄**: project name, category, notes, amount, advance payment person, settlement status, date, recorded by
3. **Checklist**: project name, category, item name, assignee, progress status, notes
4. **Checklist模板**: category, item name, default assignee
5. **成員結算**: member name, amount, date, notes

#### Scenario: Sheets exist with correct structure

- **WHEN** the API processes any request
- **THEN** it operates on the correctly structured sheets without errors


<!-- @trace
source: analytics-v2
updated: 2026-03-24
code:
  - js/api.js
  - .DS_Store
  - RAW DATA/20260322_2026 年度會議｜看我畫大餅_活動報名狀態_47筆.xlsx
  - js/shared.js
  - js/import.js
  - analytics.html
  - RAW DATA/20260322_應援撥款明細_1筆.xlsx
  - gas/Code.gs
  - css/style.css
  - js/transaction.js
  - RAW DATA/20260322_看我笑話｜第 2 季 4 月號_活動報名狀態_142筆.xlsx
  - js/analytics.js
  - RAW DATA/.DS_Store
  - index.html
  - RAW DATA/20260322_應援撥款明細_220筆.xlsx
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

---
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

<!-- @trace
source: rename-show-to-project
updated: 2026-03-22
code:
  - js/analytics.js
  - gas/Code.gs
  - .DS_Store
  - js/import.js
  - js/shared.js
  - RAW DATA/20260322_看我笑話｜第 2 季 4 月號_活動報名狀態_142筆.xlsx
  - import.html
  - analytics.html
  - RAW DATA/20260322_2026 年度會議｜看我畫大餅_活動報名狀態_47筆.xlsx
  - RAW DATA/20260322_應援撥款明細_1筆.xlsx
  - RAW DATA/20260322_應援撥款明細_220筆.xlsx
  - RAW DATA/.DS_Store
-->

---
### Requirement: Analytics cleanup migration

The API SHALL support a `migrateAnalyticsCleanup` action that performs a one-time data migration:

1. Remove the row with project name "會員與其他收支" from the project list sheet
2. Reorder the project list so that "看我笑話年度大會｜看我畫大餅" appears before "看我笑話第 2 季 Opening Party"

#### Scenario: Migration removes obsolete project and reorders

- **WHEN** a POST request is sent with action `migrateAnalyticsCleanup`
- **THEN** the "會員與其他收支" row is deleted and "看我笑話年度大會｜看我畫大餅" is moved before "看我笑話第 2 季 Opening Party"
- **AND** a success response is returned

#### Scenario: Migration is idempotent

- **WHEN** the migration is called after it has already been executed
- **THEN** no errors occur and a success response is returned

<!-- @trace
source: analytics-cleanup
updated: 2026-03-22
code:
  - RAW DATA/20260322_看我笑話｜第 2 季 4 月號_活動報名狀態_142筆.xlsx
  - js/analytics.js
  - RAW DATA/20260322_應援撥款明細_220筆.xlsx
  - RAW DATA/20260322_應援撥款明細_1筆.xlsx
  - RAW DATA/20260322_2026 年度會議｜看我畫大餅_活動報名狀態_47筆.xlsx
  - gas/Code.gs
  - RAW DATA/.DS_Store
  - .DS_Store
  - analytics.html
-->

---
### Requirement: Get forecast data

The system SHALL provide a `getForecast` API endpoint that reads the "財務預估" worksheet and returns structured JSON containing all six sections: baseParams, versionParams, income, expense, pnl, and profitShare.

#### Scenario: Successful forecast data retrieval

- **WHEN** the API receives action=getForecast
- **THEN** it returns all sections with labels, values, and row references from the "財務預估" worksheet

#### Scenario: Missing forecast worksheet

- **WHEN** the "財務預估" worksheet does not exist
- **THEN** the API returns an error response indicating the worksheet is missing


<!-- @trace
source: forecast-page
updated: 2026-04-06
code:
  - gas/Code.gs
  - .DS_Store
  - css/style.css
  - js/forecast.js
  - js/shared.js
  - forecast.html
-->

---
### Requirement: Update forecast parameters

The system SHALL provide an `updateForecast` API endpoint that accepts baseParams and versionParams arrays and writes the values back to the corresponding cells in the "財務預估" worksheet.

#### Scenario: Successful parameter update

- **WHEN** the API receives action=updateForecast with modified parameters
- **THEN** it writes each value to the correct cell in the "財務預估" worksheet and returns a success response

#### Scenario: Update with empty payload

- **WHEN** the API receives action=updateForecast with no parameters
- **THEN** it returns an error response indicating no parameters were provided

<!-- @trace
source: forecast-page
updated: 2026-04-06
code:
  - gas/Code.gs
  - .DS_Store
  - css/style.css
  - js/forecast.js
  - js/shared.js
  - forecast.html
-->