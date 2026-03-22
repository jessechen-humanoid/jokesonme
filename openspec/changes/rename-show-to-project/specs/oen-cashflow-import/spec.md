## MODIFIED Requirements

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

### Requirement: Event name to show mapping

The system SHALL provide a mapping step where users confirm or change the correspondence between extracted event names and existing projects in the project list. The system SHALL display a dropdown of existing projects for each event name. Users SHALL be able to select an existing project or keep the extracted name. The section title SHALL use "活動對應專案" instead of "活動對應演出".

#### Scenario: Map event name to existing project

- **WHEN** an event file has extracted name "看我笑話｜第 2 季 4 月號"
- **AND** the project list contains "看我笑話 4 月號"
- **THEN** the user can select "看我笑話 4 月號" from the dropdown to map this event
