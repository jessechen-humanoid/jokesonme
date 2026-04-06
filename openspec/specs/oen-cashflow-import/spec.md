# oen-cashflow-import Specification

## Purpose

TBD - created by archiving change 'oen-cashflow-import'. Update Purpose after archive.

## Requirements

### Requirement: Upload cashflow and event files

The system SHALL provide an import page (`import.html`) with two upload zones: one for multiple Oen cashflow reports (撥款明細) and one for multiple event registration reports (活動報名狀態). The system SHALL accept `.xlsx` files only. The system SHALL parse uploaded files client-side using SheetJS. The system SHALL alert users when duplicate files are uploaded.

#### Scenario: Upload single cashflow report

- **WHEN** user uploads an xlsx file to the cashflow upload zone
- **THEN** the system parses the file and adds it to the cashflow files list with its record count and date range

#### Scenario: Upload multiple cashflow reports

- **WHEN** user uploads multiple xlsx files to the cashflow upload zone
- **THEN** the system parses each file and adds them all to the cashflow files list

#### Scenario: Upload multiple event files

- **WHEN** user uploads one or more xlsx files to the event upload zone
- **THEN** the system parses each file, extracts the event name from the filename, and displays each file with its event name and record count

#### Scenario: Reject non-xlsx file

- **WHEN** user attempts to upload a non-xlsx file
- **THEN** the system displays an error message and does not process the file

#### Scenario: Upload duplicate cashflow file

- **WHEN** the user uploads a cashflow file with the same filename as one already uploaded
- **THEN** the system SHALL display an alert informing the user that this file has already been uploaded
- **AND** the duplicate file SHALL NOT be added

#### Scenario: Upload duplicate event file

- **WHEN** the user uploads an event file with the same filename as one already uploaded
- **THEN** the system SHALL display an alert informing the user that this file has already been uploaded
- **AND** the duplicate file SHALL NOT be added

#### Scenario: Remove individual cashflow file

- **WHEN** user clicks the remove button on an uploaded cashflow file
- **THEN** that file is removed from the list and matching results are recalculated


<!-- @trace
source: multi-cashflow-upload
updated: 2026-03-22
code:
  - RAW DATA/20260322_看我笑話｜第 2 季 4 月號_活動報名狀態_142筆.xlsx
  - RAW DATA/20260322_2026 年度會議｜看我畫大餅_活動報名狀態_47筆.xlsx
  - import.html
  - js/import.js
  - .DS_Store
  - RAW DATA/.DS_Store
  - RAW DATA/20260322_應援撥款明細_220筆.xlsx
-->

---
### Requirement: Upload status visibility

The system SHALL clearly display the current upload state at all times. For cashflow reports, the system SHALL list all uploaded files with their filenames, record counts, date ranges, and a remove button for each. The system SHALL also display the merged total record count after deduplication. For event files, the system SHALL list all uploaded files with their event names and record counts. The system SHALL allow users to remove individual uploaded files.

#### Scenario: Display multiple uploaded cashflow files

- **WHEN** multiple cashflow reports have been uploaded
- **THEN** each file is listed with its filename, record count, and date range, plus a remove button
- **AND** a merged total line shows the deduplicated record count

#### Scenario: Display uploaded event files list

- **WHEN** multiple event files have been uploaded
- **THEN** each file is listed with its extracted event name, record count, and a remove button

#### Scenario: No files uploaded

- **WHEN** no files have been uploaded yet
- **THEN** both upload zones display placeholder instructions prompting the user to upload files


<!-- @trace
source: multi-cashflow-upload
updated: 2026-03-22
code:
  - RAW DATA/20260322_看我笑話｜第 2 季 4 月號_活動報名狀態_142筆.xlsx
  - RAW DATA/20260322_2026 年度會議｜看我畫大餅_活動報名狀態_47筆.xlsx
  - import.html
  - js/import.js
  - .DS_Store
  - RAW DATA/.DS_Store
  - RAW DATA/20260322_應援撥款明細_220筆.xlsx
-->

---
### Requirement: Automatic cashflow classification

The system SHALL automatically classify cashflow records into categories:

1. Records with 金流類型 "定期定額會費" SHALL be classified as "付費會員"
2. Records with 金流類型 "單筆購買" SHALL be matched against uploaded event files
3. Records with 金流狀態 "撥款後退款" SHALL be flagged as refunds and excluded from import

#### Scenario: Classify membership fees

- **WHEN** the cashflow report contains records with 金流類型 "定期定額會費"
- **THEN** all such records are automatically classified as "付費會員" without requiring event file matching

#### Scenario: Flag refunded transactions

- **WHEN** the cashflow report contains records with 金流狀態 "撥款後退款"
- **THEN** these records are displayed separately as refunds and are not included in the import


<!-- @trace
source: oen-cashflow-import
updated: 2026-03-22
code:
  - js/import.js
  - RAW DATA/20260322_應援撥款明細_220筆.xlsx
  - css/style.css
  - import.html
  - .DS_Store
  - RAW DATA/.DS_Store
  - gas/Code.gs
  - RAW DATA/20260322_看我笑話｜第 2 季 4 月號_活動報名狀態_142筆.xlsx
  - js/shared.js
  - RAW DATA/20260322_2026 年度會議｜看我畫大餅_活動報名狀態_47筆.xlsx
  - js/api.js
-->

---
### Requirement: Three-tier matching for ticket purchases

The system SHALL match 單筆購買 records from the cashflow report to event files using a three-tier strategy:

1. **Time + Name match**: Match cashflow 付款時間 with event 報名日期 within 5 minutes AND same person name (付款人 = 購買人名稱)
2. **Email fallback**: For unmatched records, match by 電子郵件 = 購買人 Email across all event files
3. **Manual assignment**: Records that remain unmatched SHALL be displayed with a dropdown for the user to manually select the corresponding show

#### Scenario: Match by payment time and name

- **WHEN** a cashflow record has 付款時間 "2026/02/12 12:48" and 付款人 "羅俊佑"
- **AND** an event file has 報名日期 "2026/02/12 12:48" and 購買人名稱 "羅俊佑"
- **THEN** the cashflow record is matched to that event

#### Scenario: Match by email fallback

- **WHEN** a cashflow record cannot be matched by time + name
- **AND** the record's 電子郵件 matches a 購買人 Email in an event file
- **THEN** the cashflow record is matched to that event

#### Scenario: Display unmatched records for manual assignment

- **WHEN** a cashflow record cannot be matched by either time+name or email
- **THEN** the record is displayed with a dropdown listing all available shows for manual assignment


<!-- @trace
source: oen-cashflow-import
updated: 2026-03-22
code:
  - js/import.js
  - RAW DATA/20260322_應援撥款明細_220筆.xlsx
  - css/style.css
  - import.html
  - .DS_Store
  - RAW DATA/.DS_Store
  - gas/Code.gs
  - RAW DATA/20260322_看我笑話｜第 2 季 4 月號_活動報名狀態_142筆.xlsx
  - js/shared.js
  - RAW DATA/20260322_2026 年度會議｜看我畫大餅_活動報名狀態_47筆.xlsx
  - js/api.js
-->

---
### Requirement: Event name extraction from filename

The system SHALL extract the event name from the uploaded event file's filename. The expected filename format is `date_eventName_活動報名狀態_N筆.xlsx`. The system SHALL extract the segment between the first underscore and `_活動報名狀態`.

#### Scenario: Extract event name from standard filename

- **WHEN** user uploads a file named "20260322_看我笑話｜第 2 季 4 月號_活動報名狀態_142筆.xlsx"
- **THEN** the system extracts the event name as "看我笑話｜第 2 季 4 月號"


<!-- @trace
source: oen-cashflow-import
updated: 2026-03-22
code:
  - js/import.js
  - RAW DATA/20260322_應援撥款明細_220筆.xlsx
  - css/style.css
  - import.html
  - .DS_Store
  - RAW DATA/.DS_Store
  - gas/Code.gs
  - RAW DATA/20260322_看我笑話｜第 2 季 4 月號_活動報名狀態_142筆.xlsx
  - js/shared.js
  - RAW DATA/20260322_2026 年度會議｜看我畫大餅_活動報名狀態_47筆.xlsx
  - js/api.js
-->

---
### Requirement: Event name to show mapping

The system SHALL provide a mapping step where users confirm or change the correspondence between extracted event names and existing projects in the project list. The system SHALL display a dropdown of existing projects for each event name. Users SHALL be able to select an existing project or keep the extracted name. The section title SHALL use "活動對應專案" instead of "活動對應演出".

#### Scenario: Map event name to existing project

- **WHEN** an event file has extracted name "看我笑話｜第 2 季 4 月號"
- **AND** the project list contains "看我笑話 4 月號"
- **THEN** the user can select "看我笑話 4 月號" from the dropdown to map this event


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
### Requirement: Import dashboard

The system SHALL display a dashboard after matching is complete, showing:

1. Total revenue (收取金額), total fees (手續費), and net revenue (實際收取金額)
2. Breakdown by source: each matched event with record count, revenue, and fees
3. Membership fees subtotal with plan breakdown (e.g., 149元 x N, 1699元 x N)
4. Count and total of unmatched records (if any)

#### Scenario: Display complete dashboard

- **WHEN** all cashflow records have been classified and matched
- **THEN** the dashboard displays totals, per-event breakdown, membership breakdown, and any unmatched items


<!-- @trace
source: oen-cashflow-import
updated: 2026-03-22
code:
  - js/import.js
  - RAW DATA/20260322_應援撥款明細_220筆.xlsx
  - css/style.css
  - import.html
  - .DS_Store
  - RAW DATA/.DS_Store
  - gas/Code.gs
  - RAW DATA/20260322_看我笑話｜第 2 季 4 月號_活動報名狀態_142筆.xlsx
  - js/shared.js
  - RAW DATA/20260322_2026 年度會議｜看我畫大餅_活動報名狀態_47筆.xlsx
  - js/api.js
-->

---
### Requirement: Batch import to Google Sheets

The system SHALL provide an import button that writes matched results to Google Sheets via the API. The import SHALL create the following transaction records:

1. One income record per event, categorized as "演出票房", with the project name, total ticket revenue as amount, and ticket type breakdown in notes
2. One income record for membership fees, categorized as "付費會員", under the "看我笑話會員" project, with plan breakdown in notes
3. One expense record per event for platform fees, categorized as "平台手續", with the total fee amount as a negative value
4. One expense record for membership platform fees, categorized as "平台手續", under "看我笑話會員"

#### Scenario: Import creates correct transaction records

- **WHEN** user clicks the import button with 2 events matched and membership fees present
- **THEN** the system creates 6 transaction records: 2 income (ticket revenue per event) + 1 income (membership under "看我笑話會員") + 2 expense (platform fees per event) + 1 expense (membership fees under "看我笑話會員")

#### Scenario: Import button disabled when unmatched records exist

- **WHEN** there are unmatched cashflow records that have not been manually assigned
- **THEN** the import button is disabled with a message indicating unmatched records must be resolved first


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
### Requirement: Cashflow deduplication by transaction ID

When multiple cashflow reports are uploaded, the system SHALL merge all rows and deduplicate using the 金流編號 (transaction ID) field. Rows with the same 金流編號 SHALL appear only once in the merged result.

#### Scenario: Overlapping cashflow reports

- **WHEN** two cashflow reports contain rows with the same 金流編號
- **THEN** the merged result contains each unique 金流編號 only once
- **AND** the dashboard totals reflect the deduplicated data

<!-- @trace
source: multi-cashflow-upload
updated: 2026-03-22
code:
  - RAW DATA/20260322_看我笑話｜第 2 季 4 月號_活動報名狀態_142筆.xlsx
  - RAW DATA/20260322_2026 年度會議｜看我畫大餅_活動報名狀態_47筆.xlsx
  - import.html
  - js/import.js
  - .DS_Store
  - RAW DATA/.DS_Store
  - RAW DATA/20260322_應援撥款明細_220筆.xlsx
-->