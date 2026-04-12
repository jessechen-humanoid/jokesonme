# forecast-page Specification

## Purpose

TBD - created by archiving change 'forecast-page'. Update Purpose after archive.

## Requirements

### Requirement: Forecast page display

The system SHALL display a "財務預估" page accessible from the navigation bar, positioned between "財務分析" and "應援匯入". The page SHALL display six sections in order: 分潤規劃, 基礎參數, 版本參數, 損益彙總, 收入計算, 支出計算.

#### Scenario: View forecast page sections

- **WHEN** user navigates to the forecast page
- **THEN** all six sections are displayed in the specified order with data from the Google Sheet "財務預估" worksheet

#### Scenario: View forecast page with no data

- **WHEN** the "財務預估" worksheet is empty or missing
- **THEN** the page SHALL display a loading error message


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
### Requirement: Forecast read-only sections

The system SHALL display 分潤規劃, 損益彙總, 收入計算, and 支出計算 as read-only sections. Each section SHALL show three version columns: 保守版, 基礎版, 激進版.

#### Scenario: View profit sharing section

- **WHEN** user views the 分潤規劃 section
- **THEN** the system displays 共同基金 (20%), 成員分潤總額 (80%), and 每人年度分潤 (÷8) for all three versions

#### Scenario: View P&L summary section

- **WHEN** user views the 損益彙總 section
- **THEN** the system displays 年度淨利 and 淨利率 for all three versions


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
### Requirement: Forecast editable parameters

The system SHALL allow users to edit 基礎參數 (rows 4-19) and 版本參數 (rows 22-31) directly on the page. Editable fields SHALL be rendered as input fields.

#### Scenario: Edit a base parameter

- **WHEN** user changes a base parameter value (e.g., 大廳場租 from 16000 to 18000)
- **THEN** the input field reflects the new value and the save button becomes available

#### Scenario: Edit a version parameter

- **WHEN** user changes a version parameter value for one of the three versions
- **THEN** the input field reflects the new value for that specific version column


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
### Requirement: Forecast batch save

The system SHALL provide a "儲存參數" button that writes all modified parameters back to Google Sheet in a single API call. After saving, the system SHALL re-fetch all calculated sections to reflect updated results.

#### Scenario: Save modified parameters

- **WHEN** user modifies parameters and clicks "儲存參數"
- **THEN** all modified values are written to the Google Sheet, the Sheet formulas recalculate, and the read-only sections update with new values

#### Scenario: Save button loading state

- **WHEN** user clicks "儲存參數" and the API call is in progress
- **THEN** the button is disabled and shows a loading indicator until the operation completes

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