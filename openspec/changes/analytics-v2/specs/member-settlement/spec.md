## ADDED Requirements

### Requirement: Settlement record storage

The system SHALL store member settlement records in a Google Sheets tab named "成員結算" with columns: 成員 (member name), 金額 (amount), 日期 (date), 備註 (notes).

#### Scenario: Settlement sheet created on first use

- **WHEN** a settlement record is added and the "成員結算" sheet does not exist
- **THEN** the system creates the sheet with the correct headers

### Requirement: Add settlement record

The system SHALL provide a button in the member earnings section to add a new settlement record. Clicking the button SHALL open a modal form with fields: member (dropdown), amount (number), date (date picker), notes (text). Submitting the form SHALL save the record to the "成員結算" sheet and refresh the member earnings table.

#### Scenario: Add settlement via modal

- **WHEN** user clicks "新增結算" and fills in member "傑哥", amount 5000, date "2026-03-31"
- **THEN** a new row is added to the "成員結算" sheet and the member earnings table updates to reflect the settlement

### Requirement: Get settlement records

The system SHALL provide an API action to retrieve all settlement records from the "成員結算" sheet.

#### Scenario: Retrieve all settlements

- **WHEN** a GET request is sent with action `getSettlements`
- **THEN** the API returns all settlement records as an array of objects with member, amount, date, and notes fields
