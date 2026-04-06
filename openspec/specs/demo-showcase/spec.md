# demo-showcase Specification

## Purpose

TBD - created by archiving change 'demo-page'. Update Purpose after archive.

## Requirements

### Requirement: Demo page with tab navigation

The system SHALL provide a standalone demo page (`demo.html`) with three tabs: Transaction Records (收支紀錄), Financial Analytics (財務分析), and Show Preparation (演出準備). Tab clicks SHALL switch the visible content section without page navigation. The page SHALL NOT depend on any external API or Google Sheets connection.

#### Scenario: Default tab on load

- **WHEN** user opens the demo page
- **THEN** the first tab (收支紀錄) is active and its content is visible

#### Scenario: Switch between tabs

- **WHEN** user clicks a different tab
- **THEN** the corresponding content section becomes visible and the previous section is hidden


<!-- @trace
source: demo-page
updated: 2026-03-24
code:
  - RAW DATA/20260322_應援撥款明細_220筆.xlsx
  - demo.html
  - RAW DATA/20260322_2026 年度會議｜看我畫大餅_活動報名狀態_47筆.xlsx
  - .DS_Store
  - RAW DATA/.DS_Store
  - RAW DATA/20260322_應援撥款明細_1筆.xlsx
  - RAW DATA/20260322_看我笑話｜第 2 季 4 月號_活動報名狀態_142筆.xlsx
-->

---
### Requirement: Mock data with obfuscated financials

The demo page SHALL display hardcoded mock data with fictitious project names, member names, and financial figures. The financial numbers SHALL appear realistic but SHALL NOT correspond to any real data. Member names SHALL use generic labels (e.g., "成員 A", "成員 B").

#### Scenario: View transaction records tab

- **WHEN** user views the Transaction Records tab
- **THEN** a mock transaction list is displayed with fictitious show names, categories, amounts, and member allocations

#### Scenario: View financial analytics tab

- **WHEN** user views the Financial Analytics tab
- **THEN** mock summary stats, per-show P&L table, category pie charts, and member earnings table are displayed with fictitious data

#### Scenario: View show preparation tab

- **WHEN** user views the Show Preparation tab
- **THEN** a mock checklist is displayed with fictitious tasks and assignees


<!-- @trace
source: demo-page
updated: 2026-03-24
code:
  - RAW DATA/20260322_應援撥款明細_220筆.xlsx
  - demo.html
  - RAW DATA/20260322_2026 年度會議｜看我畫大餅_活動報名狀態_47筆.xlsx
  - .DS_Store
  - RAW DATA/.DS_Store
  - RAW DATA/20260322_應援撥款明細_1筆.xlsx
  - RAW DATA/20260322_看我笑話｜第 2 季 4 月號_活動報名狀態_142筆.xlsx
-->

---
### Requirement: Floating annotation callouts

The demo page SHALL display floating annotation callouts that explain key features. Each callout SHALL consist of a title and a 1-2 sentence description. Callouts SHALL be positioned near the feature they describe and SHALL NOT block the underlying content. Callouts SHALL be visible without user interaction (no hover or click required).

#### Scenario: Annotations visible on tab switch

- **WHEN** user switches to a tab
- **THEN** the annotation callouts for that tab's features are immediately visible


<!-- @trace
source: demo-page
updated: 2026-03-24
code:
  - RAW DATA/20260322_應援撥款明細_220筆.xlsx
  - demo.html
  - RAW DATA/20260322_2026 年度會議｜看我畫大餅_活動報名狀態_47筆.xlsx
  - .DS_Store
  - RAW DATA/.DS_Store
  - RAW DATA/20260322_應援撥款明細_1筆.xlsx
  - RAW DATA/20260322_看我笑話｜第 2 季 4 月號_活動報名狀態_142筆.xlsx
-->

---
### Requirement: View-only mode

The demo page SHALL be entirely view-only. All form inputs, buttons, and interactive elements SHALL be visually present but non-functional. Users SHALL NOT be able to submit forms, toggle states, or modify any data.

#### Scenario: Attempt to interact with form

- **WHEN** user clicks a submit button or form input on the demo page
- **THEN** nothing happens — no form submission, no state change, no error

<!-- @trace
source: demo-page
updated: 2026-03-24
code:
  - RAW DATA/20260322_應援撥款明細_220筆.xlsx
  - demo.html
  - RAW DATA/20260322_2026 年度會議｜看我畫大餅_活動報名狀態_47筆.xlsx
  - .DS_Store
  - RAW DATA/.DS_Store
  - RAW DATA/20260322_應援撥款明細_1筆.xlsx
  - RAW DATA/20260322_看我笑話｜第 2 季 4 月號_活動報名狀態_142筆.xlsx
-->