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

---
### Requirement: Password verification action

The API SHALL support a `verifyPassword` action. It accepts a POST payload containing `password` and compares it against the `APP_PASSWORD` value stored in Script Properties. On match, it SHALL return `{ success: true, token: <API_TOKEN> }` where `API_TOKEN` is read from Script Properties. On mismatch, it SHALL return a failure response and SHALL NOT include a token.

#### Scenario: Correct password returns token

- **WHEN** a POST request with action `verifyPassword` and payload `{ password: <correct password> }` is sent
- **THEN** the API returns `{ success: true, token: <API_TOKEN> }`

#### Scenario: Incorrect password is rejected

- **WHEN** a POST request with action `verifyPassword` and an incorrect password is sent
- **THEN** the API returns a failure response with no token field


<!-- @trace
source: api-auth-token
updated: 2026-07-03
code:
  - OPTIMIZATION_PLAN.md
  - CLAUDE.md
  - gas/Code.gs
  - js/api.js
  - js/shared.js
-->

---
### Requirement: Token authorization for all actions

The API SHALL require a valid `token` on every action except `verifyPassword`. The token is read from the request (query parameter for GET, payload field for POST) and compared against the `API_TOKEN` value in Script Properties. If `API_TOKEN` is not set in Script Properties, the API SHALL skip token verification to allow a zero-downtime transition; this fallback exists only until the property is configured. Once `API_TOKEN` is set, any request whose token does not match SHALL return `{ success: false, error: "unauthorized" }` and SHALL NOT read or write any data.

#### Scenario: Missing token is rejected once enforcement is active

- **WHEN** `API_TOKEN` is set and a request for any action other than `verifyPassword` is sent without a token or with a wrong token
- **THEN** the API returns `{ success: false, error: "unauthorized" }` and performs no data read or write

#### Scenario: Valid token behaves normally

- **WHEN** `API_TOKEN` is set and a request includes a token equal to `API_TOKEN`
- **THEN** the action executes exactly as it did before authorization was added

#### Scenario: Transitional fallback before property is configured

- **WHEN** `API_TOKEN` is not set in Script Properties and a request without a token is sent
- **THEN** the API executes the action normally, preserving compatibility with the pre-upgrade frontend

<!-- @trace
source: api-auth-token
updated: 2026-07-03
code:
  - OPTIMIZATION_PLAN.md
  - CLAUDE.md
  - gas/Code.gs
  - js/api.js
  - js/shared.js
-->

---
### Requirement: Forecast structure validation

Before reading or writing forecast data, `getForecast` and `updateForecast` SHALL verify that the anchor cells (section header labels) of the forecast worksheet match the expected labels. On mismatch, the API SHALL return `{ "success": false, "error": "FORECAST_STRUCTURE_MISMATCH", "detail": "<anchor location>" }` and SHALL NOT return or write partially parsed data. When the structure matches, behaviour SHALL be identical to the previous implementation.

#### Scenario: Row inserted into forecast worksheet

- **WHEN** a row has been inserted into the forecast worksheet so that section anchors no longer sit at their expected positions, and `getForecast` is called
- **THEN** the response is `success: false` with error `FORECAST_STRUCTURE_MISMATCH` and a detail naming the failed anchor, and no forecast data is returned

#### Scenario: Intact structure behaves unchanged

- **WHEN** the forecast worksheet structure matches the expected anchors and `getForecast` is called
- **THEN** the response contains the same forecast data shape as before this change

#### Scenario: Write blocked on structure mismatch

- **WHEN** the forecast worksheet structure does not match and `updateForecast` is called
- **THEN** no cell is written and the response is `success: false` with error `FORECAST_STRUCTURE_MISMATCH`

<!-- @trace
source: site-optimization
updated: 2026-07-10
code:
  - OPTIMIZATION_PLAN.md
  - js/analytics.js
  - .agents/skills/spectra-commit/SKILL.md
  - js/checklist.js
  - import.html
  - checklist.html
  - .agents/skills/spectra-debug/SKILL.md
  - .agents/skills/spectra-ask/SKILL.md
  - .agents/skills/spectra-propose/SKILL.md
  - index.html
  - .agents/skills/spectra-discuss/SKILL.md
  - analytics.html
  - .agents/skills/spectra-audit/SKILL.md
  - .agents/skills/spectra-ingest/SKILL.md
  - opentix.html
  - .agents/skills/spectra-apply/SKILL.md
  - js/import.js
  - js/shared.js
  - AGENTS.md
  - css/style.css
  - forecast.html
  - opentix-analytics.html
  - demo.html
  - CLAUDE.md
  - gas/Code.gs
  - .agents/skills/spectra-archive/SKILL.md
  - js/transaction.js
  - .agents/skills/spectra-drift/SKILL.md
-->