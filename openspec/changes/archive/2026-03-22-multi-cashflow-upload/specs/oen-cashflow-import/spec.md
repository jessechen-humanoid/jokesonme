## MODIFIED Requirements

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

## ADDED Requirements

### Requirement: Cashflow deduplication by transaction ID

When multiple cashflow reports are uploaded, the system SHALL merge all rows and deduplicate using the 金流編號 (transaction ID) field. Rows with the same 金流編號 SHALL appear only once in the merged result.

#### Scenario: Overlapping cashflow reports

- **WHEN** two cashflow reports contain rows with the same 金流編號
- **THEN** the merged result contains each unique 金流編號 only once
- **AND** the dashboard totals reflect the deduplicated data
