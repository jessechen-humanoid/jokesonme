# opentix-embed Specification

## Purpose

TBD - created by archiving change 'split-opentix-tabs'. Update Purpose after archive.

## Requirements

### Requirement: Analytics iframe embed page

The `opentix-analytics.html` page SHALL display the opentix-tracker analytics page in a full-viewport iframe with the `?embed=true` query parameter.

#### Scenario: Page loads analytics in iframe

- **WHEN** user navigates to `opentix-analytics.html`
- **THEN** an iframe loads the opentix-tracker Vercel URL `/analytics?embed=true`
- **THEN** the iframe fills the available viewport below the navigation bar

<!-- @trace
source: split-opentix-tabs
updated: 2026-03-27
code:
  - RAW DATA/20260322_應援撥款明細_1筆.xlsx
  - opentix-analytics.html
  - RAW DATA/.DS_Store
  - RAW DATA/20260322_2026 年度會議｜看我畫大餅_活動報名狀態_47筆.xlsx
  - js/shared.js
  - .DS_Store
  - opentix.html
  - RAW DATA/20260322_看我笑話｜第 2 季 4 月號_活動報名狀態_142筆.xlsx
  - RAW DATA/20260322_應援撥款明細_220筆.xlsx
-->

---
### Requirement: Navigation tab for OpenTix Tracker

The navigation bar SHALL include a "票數追蹤" tab that links to `opentix.html`.

#### Scenario: Tab visible in navigation

- **WHEN** user loads any page on the jokesonme site
- **THEN** the navigation bar displays a "票數追蹤" link

#### Scenario: Tab navigates to embed page

- **WHEN** user clicks the "票數追蹤" tab
- **THEN** the browser navigates to `opentix.html`


<!-- @trace
source: opentix-embed-tab
updated: 2026-03-27
code:
  - RAW DATA/20260322_2026 年度會議｜看我畫大餅_活動報名狀態_47筆.xlsx
  - RAW DATA/20260322_應援撥款明細_1筆.xlsx
  - RAW DATA/20260322_看我笑話｜第 2 季 4 月號_活動報名狀態_142筆.xlsx
  - RAW DATA/.DS_Store
  - .DS_Store
  - RAW DATA/20260322_應援撥款明細_220筆.xlsx
  - opentix-analytics.html
  - opentix.html
  - js/shared.js
-->

---
### Requirement: Iframe embed page

The `opentix.html` page SHALL display the opentix-tracker application in a full-viewport iframe with the `?embed=true` query parameter.

#### Scenario: Page loads opentix-tracker in iframe

- **WHEN** user navigates to `opentix.html`
- **THEN** an iframe loads the opentix-tracker Vercel URL with `?embed=true` appended
- **THEN** the iframe fills the available viewport below the navigation bar

#### Scenario: No show selector on embed page

- **WHEN** user navigates to `opentix.html`
- **THEN** the page does NOT display a show selector, since opentix-tracker has its own event management


<!-- @trace
source: opentix-embed-tab
updated: 2026-03-27
code:
  - RAW DATA/20260322_2026 年度會議｜看我畫大餅_活動報名狀態_47筆.xlsx
  - RAW DATA/20260322_應援撥款明細_1筆.xlsx
  - RAW DATA/20260322_看我笑話｜第 2 季 4 月號_活動報名狀態_142筆.xlsx
  - RAW DATA/.DS_Store
  - .DS_Store
  - RAW DATA/20260322_應援撥款明細_220筆.xlsx
  - opentix-analytics.html
  - opentix.html
  - js/shared.js
-->

---
### Requirement: Embed mode hides navbar in opentix-tracker

When the opentix-tracker application receives `?embed=true` as a URL parameter, it SHALL hide its own navigation bar.

#### Scenario: Navbar hidden in embed mode

- **WHEN** opentix-tracker is loaded with `?embed=true` query parameter
- **THEN** the `<NavBar />` component is NOT rendered
- **THEN** all other page content and functionality remains intact

#### Scenario: Navbar visible in standalone mode

- **WHEN** opentix-tracker is loaded without `?embed=true` query parameter
- **THEN** the `<NavBar />` component is rendered normally

<!-- @trace
source: opentix-embed-tab
updated: 2026-03-27
code:
  - RAW DATA/20260322_2026 年度會議｜看我畫大餅_活動報名狀態_47筆.xlsx
  - RAW DATA/20260322_應援撥款明細_1筆.xlsx
  - RAW DATA/20260322_看我笑話｜第 2 季 4 月號_活動報名狀態_142筆.xlsx
  - RAW DATA/.DS_Store
  - .DS_Store
  - RAW DATA/20260322_應援撥款明細_220筆.xlsx
  - opentix-analytics.html
  - opentix.html
  - js/shared.js
-->