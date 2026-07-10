# frontend-resilience Specification

## Purpose

TBD - created by archiving change 'frontend-resilience'. Update Purpose after archive.

## Requirements

### Requirement: Normalized API error handling

The frontend API client (js/api.js) SHALL wrap every request so that any failure — network error, request timeout, non-2xx HTTP status, or non-JSON response body — resolves to an object of the form `{ success: false, error: <message> }` rather than throwing. Requests SHALL apply a timeout of no less than 30 seconds to accommodate Google Apps Script cold starts. On success, the client SHALL return the parsed response (after the existing unauthorized handling). Callers SHALL be able to rely solely on checking the `success` field.

#### Scenario: Network failure returns a normalized error

- **WHEN** an API request fails due to a network error, a timeout, a non-2xx status, or an unparseable body
- **THEN** the call resolves to `{ success: false, error: <message> }` and does not throw

#### Scenario: Successful request is unchanged

- **WHEN** an API request succeeds with a valid JSON body
- **THEN** the parsed response is returned as before, including the existing unauthorized handling


<!-- @trace
source: frontend-resilience
updated: 2026-07-03
code:
  - OPTIMIZATION_PLAN.md
  - js/forecast.js
  - js/api.js
  - js/shared.js
  - js/checklist.js
  - js/analytics.js
  - js/transaction.js
  - CLAUDE.md
  - js/import.js
-->

---
### Requirement: Write-operation failure feedback

When a write operation fails (its response `success` is false), the UI SHALL surface the failure to the user and SHALL NOT clear or reset the input form, so the user can retry without re-entering data. The submit button SHALL be restored to the label matching the current mode. For the transaction form specifically, a failed add or update SHALL keep the entered category, amount, and notes, and SHALL restore the button to "更新" when editing or "新增" when adding.

#### Scenario: Failed transaction submit preserves the form

- **WHEN** the user submits the transaction form and the API returns a failure
- **THEN** an error message is shown, the category/amount/notes remain filled, and the submit button reads "新增" (add mode) or "更新" (edit mode) accordingly

#### Scenario: Successful submit still resets

- **WHEN** the user submits the transaction form and the API returns success
- **THEN** the form resets as it did before this change


<!-- @trace
source: frontend-resilience
updated: 2026-07-03
code:
  - OPTIMIZATION_PLAN.md
  - js/forecast.js
  - js/api.js
  - js/shared.js
  - js/checklist.js
  - js/analytics.js
  - js/transaction.js
  - CLAUDE.md
  - js/import.js
-->

---
### Requirement: Consistent HTML escaping

The frontend SHALL provide a single implementation of `escapeHtml` and `escapeAttr` in js/shared.js, each guarding against null/undefined input by returning an empty string. All other frontend scripts SHALL use these shared functions rather than defining their own. Any place that inserts user-controlled strings (project names, member names, categories, notes) into HTML — including the project selector options — SHALL escape those values.

#### Scenario: Only one escapeHtml definition exists

- **WHEN** the js directory is searched for `escapeHtml` function definitions
- **THEN** exactly one definition is found, located in js/shared.js

#### Scenario: Special characters in a project name do not break the UI

- **WHEN** a project whose name contains a double quote and angle brackets is added and the project selector is rendered
- **THEN** the option displays and is selectable, transactions can be recorded against it, and the page layout is not broken

#### Scenario: Null input is handled

- **WHEN** `escapeHtml` or `escapeAttr` is called with null or undefined
- **THEN** it returns an empty string rather than the text "undefined"

<!-- @trace
source: frontend-resilience
updated: 2026-07-03
code:
  - OPTIMIZATION_PLAN.md
  - js/forecast.js
  - js/api.js
  - js/shared.js
  - js/checklist.js
  - js/analytics.js
  - js/transaction.js
  - CLAUDE.md
  - js/import.js
-->