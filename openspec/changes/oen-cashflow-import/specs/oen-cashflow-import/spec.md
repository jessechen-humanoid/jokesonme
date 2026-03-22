## ADDED Requirements

### Requirement: Upload cashflow and event files

The system SHALL provide an import page (`import.html`) with two upload zones: one for the Oen cashflow report (撥款明細) and one for multiple event registration reports (活動報名狀態). The system SHALL accept `.xlsx` files only. The system SHALL parse uploaded files client-side using SheetJS.

#### Scenario: Upload cashflow report

- **WHEN** user uploads an xlsx file to the cashflow upload zone
- **THEN** the system parses the file and displays the total number of records, date range, and total amount

#### Scenario: Upload multiple event files

- **WHEN** user uploads one or more xlsx files to the event upload zone
- **THEN** the system parses each file, extracts the event name from the filename, and displays each file with its event name and record count

#### Scenario: Reject non-xlsx file

- **WHEN** user attempts to upload a non-xlsx file
- **THEN** the system displays an error message and does not process the file

### Requirement: Upload status visibility

The system SHALL clearly display the current upload state at all times. For the cashflow report, the system SHALL show whether it has been uploaded, the record count, and the date range. For event files, the system SHALL list all uploaded files with their event names and record counts. The system SHALL allow users to remove individual uploaded files.

#### Scenario: Display uploaded cashflow status

- **WHEN** a cashflow report has been uploaded
- **THEN** the upload zone displays a checkmark, filename, record count, and date range

#### Scenario: Display uploaded event files list

- **WHEN** multiple event files have been uploaded
- **THEN** each file is listed with its extracted event name, record count, and a remove button

#### Scenario: No files uploaded

- **WHEN** no files have been uploaded yet
- **THEN** both upload zones display placeholder instructions prompting the user to upload files

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

### Requirement: Event name extraction from filename

The system SHALL extract the event name from the uploaded event file's filename. The expected filename format is `date_eventName_活動報名狀態_N筆.xlsx`. The system SHALL extract the segment between the first underscore and `_活動報名狀態`.

#### Scenario: Extract event name from standard filename

- **WHEN** user uploads a file named "20260322_看我笑話｜第 2 季 4 月號_活動報名狀態_142筆.xlsx"
- **THEN** the system extracts the event name as "看我笑話｜第 2 季 4 月號"

### Requirement: Event name to show mapping

The system SHALL provide a mapping step where users confirm or change the correspondence between extracted event names and existing shows in the show list. The system SHALL display a dropdown of existing shows for each event name. Users SHALL be able to select an existing show or keep the extracted name.

#### Scenario: Map event name to existing show

- **WHEN** an event file has extracted name "看我笑話｜第 2 季 4 月號"
- **AND** the show list contains "看我笑話 4 月號"
- **THEN** the user can select "看我笑話 4 月號" from the dropdown to map this event

### Requirement: Import dashboard

The system SHALL display a dashboard after matching is complete, showing:

1. Total revenue (收取金額), total fees (手續費), and net revenue (實際收取金額)
2. Breakdown by source: each matched event with record count, revenue, and fees
3. Membership fees subtotal with plan breakdown (e.g., 149元 x N, 1699元 x N)
4. Count and total of unmatched records (if any)

#### Scenario: Display complete dashboard

- **WHEN** all cashflow records have been classified and matched
- **THEN** the dashboard displays totals, per-event breakdown, membership breakdown, and any unmatched items

### Requirement: Batch import to Google Sheets

The system SHALL provide an import button that writes matched results to Google Sheets via the API. The import SHALL create the following transaction records:

1. One income record per event, categorized as "演出票房", with the show name, total ticket revenue as amount, and ticket type breakdown in notes
2. One income record for membership fees, categorized as "付費會員", under the "會員與其他收支" show, with plan breakdown in notes
3. One expense record per event for platform fees, categorized as "平台手續", with the total fee amount as a negative value
4. One expense record for membership platform fees, categorized as "平台手續", under "會員與其他收支"

#### Scenario: Import creates correct transaction records

- **WHEN** user clicks the import button with 2 events matched and membership fees present
- **THEN** the system creates 6 transaction records: 2 income (ticket revenue per event) + 1 income (membership) + 2 expense (platform fees per event) + 1 expense (membership fees)

#### Scenario: Import button disabled when unmatched records exist

- **WHEN** there are unmatched cashflow records that have not been manually assigned
- **THEN** the import button is disabled with a message indicating unmatched records must be resolved first
