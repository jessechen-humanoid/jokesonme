## MODIFIED Requirements

### Requirement: Upload cashflow and event files

The system SHALL provide an import page (`import.html`) with two upload zones: one for the Oen cashflow report (撥款明細) and one for multiple event registration reports (活動報名狀態). The system SHALL accept `.xlsx` files only. The system SHALL parse uploaded files client-side using SheetJS. The system SHALL alert users when duplicate files are uploaded.

#### Scenario: Upload cashflow report

- **WHEN** user uploads an xlsx file to the cashflow upload zone
- **THEN** the system parses the file and displays the total number of records, date range, and total amount

#### Scenario: Upload multiple event files

- **WHEN** user uploads one or more xlsx files to the event upload zone
- **THEN** the system parses each file, extracts the event name from the filename, and displays each file with its event name and record count

#### Scenario: Reject non-xlsx file

- **WHEN** user attempts to upload a non-xlsx file
- **THEN** the system displays an error message and does not process the file

#### Scenario: Replace existing cashflow report

- **WHEN** a cashflow report has already been uploaded and the user uploads another one
- **THEN** the system SHALL display a confirmation prompt asking whether to replace the existing file
- **AND** if the user confirms, the new file replaces the old one
- **AND** if the user cancels, the existing file is kept

#### Scenario: Upload duplicate event file

- **WHEN** the user uploads an event file with the same filename as one already uploaded
- **THEN** the system SHALL display an alert informing the user that this file has already been uploaded
- **AND** the duplicate file SHALL NOT be added
