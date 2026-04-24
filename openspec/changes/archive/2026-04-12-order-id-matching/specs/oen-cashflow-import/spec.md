## ADDED Requirements

### Requirement: Order ID matching for purchases

The system SHALL match 單筆購買 records from the cashflow report to order CSVs using the `訂單編號` field as an exact-match key. For each cashflow record with 金流類型 "單筆購買", the system SHALL look up the `訂單編號` in all uploaded order CSVs. If a match is found in a ticket order CSV, the system SHALL extract the ticket name from the `票券名稱及數量` field. If a match is found in a merchandise order CSV, the system SHALL extract the product name from the `訂購商品名稱及數量` field. Records that remain unmatched SHALL be displayed with a dropdown for the user to manually select the corresponding project.

#### Scenario: Match cashflow record to ticket order by order ID

- **WHEN** a cashflow record has 訂單編號 "O0410YYD6CE6Y"
- **AND** a ticket order CSV contains a row with 訂單編號 "O0410YYD6CE6Y"
- **THEN** the cashflow record is matched to the ticket order
- **AND** the ticket name is extracted (e.g., "5/23 週六午場小廳 小而精緻票")

#### Scenario: Match cashflow record to merchandise order by order ID

- **WHEN** a cashflow record has 訂單編號 "O04011PXLVKRF"
- **AND** a merchandise order CSV contains a row with 訂單編號 "O04011PXLVKRF"
- **THEN** the cashflow record is matched to the merchandise order
- **AND** the product name is extracted (e.g., "看我笑話小卡盲包｜大阪和服篇")

#### Scenario: Display unmatched records for manual assignment

- **WHEN** a cashflow record's 訂單編號 is not found in any uploaded order CSV
- **THEN** the record is displayed in the unmatched section with its payment info and item description
- **AND** a dropdown listing all available projects is provided for manual assignment

### Requirement: Ticket name to project batch mapping

After order ID matching is complete, the system SHALL extract all unique ticket names from matched ticket orders and all unique product names from matched merchandise orders. The system SHALL display a mapping UI where users select which project each unique name corresponds to. Once a mapping is selected, all cashflow records matched to that name SHALL automatically be assigned to the selected project. The mapping section title SHALL be "票券／商品對應專案".

#### Scenario: Map ticket name to project

- **WHEN** matching produces ticket orders with ticket names "5/23 週六午場小廳 小而精緻票" and "高腳圓桌 & 包廂對號票"
- **THEN** the system displays two mapping rows, one per unique ticket name
- **AND** each row has a dropdown listing all available projects
- **AND** selecting a project for "5/23 週六午場小廳 小而精緻票" assigns all 15 matching cashflow records to that project

#### Scenario: Map merchandise name to project

- **WHEN** matching produces merchandise orders with product name "看我笑話小卡盲包｜大阪和服篇"
- **THEN** the system displays a mapping row for that product name
- **AND** selecting a project assigns all matching cashflow records to that project

#### Scenario: Multiple ticket names mapped to different projects

- **WHEN** user maps "5/23 週六午場小廳 小而精緻票" to "看我笑話 5 月號" and "高腳圓桌 & 包廂對號票" to "看我笑話 4 月號"
- **THEN** the dashboard breakdown shows separate line items for each project with correct revenue totals

## MODIFIED Requirements

### Requirement: Upload cashflow and event files

The system SHALL provide an import page (`import.html`) with two upload zones: one for multiple Oen cashflow reports (撥款明細) in `.xlsx` format, and one for multiple order CSVs (票券訂單 and 周邊訂單) in `.csv` format. The right upload zone SHALL be labeled "票券與周邊訂單" and SHALL accept `.csv` files only. The right upload zone SHALL display a hint instructing users to download ticket order and merchandise order CSVs from the Oen backend. The system SHALL parse `.xlsx` files using SheetJS and `.csv` files using SheetJS CSV parsing. The system SHALL alert users when duplicate files are uploaded.

#### Scenario: Upload ticket order CSV

- **WHEN** user uploads a CSV file matching the pattern `*票券訂單*.csv` to the order upload zone
- **THEN** the system parses the CSV and adds it to the order files list as a ticket order type with its record count

#### Scenario: Upload merchandise order CSV

- **WHEN** user uploads a CSV file matching the pattern `*應援訂單*.csv` to the order upload zone
- **THEN** the system parses the CSV and adds it to the order files list as a merchandise order type with its record count

#### Scenario: Upload single cashflow report

- **WHEN** user uploads an xlsx file to the cashflow upload zone
- **THEN** the system parses the file and adds it to the cashflow files list with its record count and date range

#### Scenario: Upload multiple cashflow reports

- **WHEN** user uploads multiple xlsx files to the cashflow upload zone
- **THEN** the system parses each file and adds them all to the cashflow files list

#### Scenario: Reject non-csv file in order zone

- **WHEN** user attempts to upload a non-csv file to the order upload zone
- **THEN** the system SHALL ignore the file

#### Scenario: Upload duplicate file

- **WHEN** the user uploads a file with the same filename as one already uploaded in either zone
- **THEN** the system SHALL display an alert informing the user that this file has already been uploaded
- **AND** the duplicate file SHALL NOT be added

#### Scenario: Remove individual file

- **WHEN** user clicks the remove button on an uploaded file (cashflow or order)
- **THEN** that file is removed from the list and matching results are recalculated

### Requirement: Upload status visibility

The system SHALL clearly display the current upload state at all times. For cashflow reports, the system SHALL list all uploaded files with their filenames, record counts, date ranges, and a remove button for each. The system SHALL also display the merged total record count after deduplication. For order CSVs, the system SHALL list all uploaded files with their filenames, order type (票券/周邊), record counts, and a remove button for each. The system SHALL allow users to remove individual uploaded files.

#### Scenario: Display multiple uploaded cashflow files

- **WHEN** multiple cashflow reports have been uploaded
- **THEN** each file is listed with its filename, record count, and date range, plus a remove button
- **AND** a merged total line shows the deduplicated record count

#### Scenario: Display uploaded order files list

- **WHEN** one or more order CSV files have been uploaded
- **THEN** each file is listed with its filename, order type indicator (🎫 for ticket, 🛍️ for merchandise), record count, and a remove button

#### Scenario: No files uploaded

- **WHEN** no files have been uploaded yet
- **THEN** both upload zones display placeholder instructions prompting the user to upload files

### Requirement: Automatic cashflow classification

The system SHALL automatically classify cashflow records into categories:

1. Records with 金流類型 "定期定額會費" SHALL be classified as "付費會員"
2. Records with 金流類型 "單筆購買" SHALL be matched against uploaded order CSVs using 訂單編號
3. Records with 金流狀態 "撥款後退款" SHALL be flagged as refunds and excluded from import

#### Scenario: Classify membership fees

- **WHEN** the cashflow report contains records with 金流類型 "定期定額會費"
- **THEN** all such records are automatically classified as "付費會員" without requiring order file matching

#### Scenario: Flag refunded transactions

- **WHEN** the cashflow report contains records with 金流狀態 "撥款後退款"
- **THEN** these records are displayed separately as refunds and are not included in the import

### Requirement: Import dashboard

The system SHALL display a dashboard after matching is complete, showing:

1. Total revenue (收取金額), total fees (手續費), and net revenue (實際收取金額)
2. Breakdown by source: each matched project with record count, revenue, and fees
3. Membership fees subtotal with plan breakdown (e.g., 149元 x N, 1699元 x N)
4. Merchandise orders grouped by project with product breakdown
5. Count and total of unmatched records (if any)

#### Scenario: Display complete dashboard with ticket and merchandise orders

- **WHEN** all cashflow records have been classified and matched
- **THEN** the dashboard displays totals, per-project ticket revenue breakdown, per-project merchandise revenue breakdown, membership breakdown, and any unmatched items

#### Scenario: Merchandise orders shown separately from ticket orders

- **WHEN** both ticket orders and merchandise orders are matched
- **THEN** ticket orders are categorized as "演出票房" and merchandise orders are categorized as "周邊商品" in the breakdown table

### Requirement: Batch import to Google Sheets

The system SHALL provide an import button that writes matched results to Google Sheets via the API. The import SHALL create the following transaction records:

1. One income record per project for ticket revenue, categorized as "演出票房", with the project name, total ticket revenue as amount, and ticket type breakdown in notes
2. One income record per project for merchandise revenue, categorized as "周邊商品", with the project name, total merchandise revenue as amount, and product breakdown in notes
3. One income record for membership fees, categorized as "付費會員", under the "看我笑話會員" project, with plan breakdown in notes
4. One expense record per project for platform fees from ticket orders, categorized as "平台手續", with the total fee amount as a negative value
5. One expense record per project for platform fees from merchandise orders, categorized as "平台手續", with the total fee amount as a negative value
6. One expense record for membership platform fees, categorized as "平台手續", under "看我笑話會員"

#### Scenario: Import creates correct transaction records

- **WHEN** user clicks the import button with 2 ticket projects, 1 merchandise project, and membership fees present
- **THEN** the system creates 8 transaction records: 2 income (ticket revenue per project) + 1 income (merchandise) + 1 income (membership) + 2 expense (ticket platform fees) + 1 expense (merchandise platform fees) + 1 expense (membership fees)

#### Scenario: Import button disabled when unmatched records exist

- **WHEN** there are unmatched cashflow records that have not been manually assigned
- **THEN** the import button is disabled with a message indicating unmatched records must be resolved first

## REMOVED Requirements

### Requirement: Three-tier matching for ticket purchases

**Reason**: Replaced by order ID exact matching. The three-tier strategy (time+name, email fallback, manual) is no longer needed because ticket order and merchandise order CSVs share the same `訂單編號` as the cashflow report, enabling precise matching.

**Migration**: Use the new "Order ID matching for purchases" requirement instead. Upload ticket order CSV and merchandise order CSV from the Oen backend instead of event registration xlsx files.

### Requirement: Event name extraction from filename

**Reason**: Replaced by ticket name to project batch mapping. Event names are no longer extracted from filenames. Instead, ticket names and product names are extracted from the matched order CSV data and mapped to projects by the user.

**Migration**: Use the new "Ticket name to project batch mapping" requirement instead.

### Requirement: Event name to show mapping

**Reason**: Replaced by ticket name to project batch mapping. The mapping concept remains but the source of names changes from filename-extracted event names to order-data-extracted ticket/product names, and the mapping applies in batch to all records with that name.

**Migration**: Use the new "Ticket name to project batch mapping" requirement instead.
