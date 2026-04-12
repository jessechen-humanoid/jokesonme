## ADDED Requirements

### Requirement: Activity registration upload for price and event reference

The system SHALL provide a third optional upload zone labeled "活動報名狀態（選填）" that accepts multiple `.xlsx` files. The system SHALL extract the event name from each filename using the pattern `date_eventName_活動報名狀態_N筆.xlsx`. For each uploaded file, the system SHALL parse all rows and build two lookup tables:

1. **Price table**: Maps each unique `票券名稱 + 規格名稱` combination to its `票券金額` value
2. **Event mapping table**: Maps each unique `票券名稱 + 規格名稱` combination to the event name extracted from the filename

The system SHALL display uploaded activity registration files in the upload status area with the 📋 icon, extracted event name, record count, and a remove button.

#### Scenario: Upload activity registration file

- **WHEN** user uploads "20260410_看我笑話｜第 2 季 4 月號_活動報名狀態_148筆.xlsx"
- **THEN** the system extracts event name "看我笑話｜第 2 季 4 月號"
- **AND** builds a price table entry mapping "高腳圓桌 & 包廂對號票 B30 包廂方桌位" to $550 under that event
- **AND** builds an event mapping entry mapping "高腳圓桌 & 包廂對號票 B30 包廂方桌位" to "看我笑話｜第 2 季 4 月號"

#### Scenario: Same ticket name appears in multiple events

- **WHEN** "高腳圓桌 & 包廂對號票 B30 包廂方桌位" appears in both "看我笑話｜第 2 季 4 月號" and "看我笑話｜第 2 季 5 月號"
- **THEN** the event mapping table records both events for that ticket name
- **AND** the system flags this ticket name as ambiguous (multiple events)

#### Scenario: No activity registration files uploaded

- **WHEN** no activity registration xlsx files have been uploaded
- **THEN** the system SHALL fall back to the existing behavior where users manually map ticket group names to projects via the mapping UI

### Requirement: Multi-ticket order splitting

When a ticket order CSV row's `票券名稱及數量` field contains multiple tickets (detected by the presence of more than one `x N` pattern), the system SHALL split the row into individual ticket entries. The splitting logic SHALL:

1. Parse the field by identifying each `{ticket name} x {quantity}` segment separated by double spaces
2. For each segment, extract the full ticket name (including seat spec) and the quantity
3. Look up each ticket's unit price from the activity registration price table using the full ticket name
4. Assign each split ticket entry its own unit price from the price table
5. Calculate the fee allocation for each split entry proportionally: `entry_fee = total_fee × (entry_price / total_price)`

If the activity registration price table is not available (no files uploaded), multi-ticket orders SHALL remain unsplit and be treated as a single entry using the existing groupName logic.

#### Scenario: Split a two-ticket combined order

- **WHEN** a ticket order has `票券名稱及數量` = "5/30 週六晚場大廳 B3 內野應援票 x 1  7/11 週六晚場大廳 B3 資深經理席 x 1"
- **AND** the activity registration price table maps "5/30 週六晚場大廳 B3 內野應援票" to $700 and "7/11 週六晚場大廳 B3 資深經理席" to $699
- **AND** the cashflow record has 收取金額 $1,399 and 手續費 $50
- **THEN** the system creates two split entries:
  - Entry 1: "5/30 週六晚場大廳 B3 內野應援票", amount $700, fee $25.02 (700/1399 × 50)
  - Entry 2: "7/11 週六晚場大廳 B3 資深經理席", amount $699, fee $24.98 (699/1399 × 50)

#### Scenario: Multi-ticket order without price table

- **WHEN** a ticket order has multiple tickets in `票券名稱及數量`
- **AND** no activity registration files have been uploaded
- **THEN** the order remains unsplit and is grouped under the combined ticket name as a single entry

### Requirement: Automatic event attribution via activity registration

After order ID matching and multi-ticket splitting, for each matched ticket entry the system SHALL attempt automatic event attribution by looking up the full ticket name (including seat spec, e.g., "高腳圓桌 & 包廂對號票 B30 包廂方桌位") in the activity registration event mapping table.

- If the ticket name maps to exactly one event, the system SHALL automatically assign that entry to the corresponding event name as its project
- If the ticket name maps to multiple events (ambiguous), the system SHALL use the order's creation timestamp to determine attribution: compare the timestamp against each event's ticket sale date range (derived from the earliest and latest `報名日期` in each activity registration file) and assign to the event whose sale period contains the order date
- If date-based attribution fails (order date falls in an overlapping period or outside all periods), the entry SHALL be marked as "需手動確認" in the mapping UI

Auto-attributed entries SHALL be pre-selected in the mapping UI dropdown and SHALL NOT require manual user action. The user MAY override the auto-selection.

#### Scenario: Unique event attribution

- **WHEN** a split ticket entry has name "5/30 週六晚場大廳 B3 內野應援票"
- **AND** the event mapping table maps this name only to "2026 好竹弋漫才專場 《直球》"
- **THEN** the system auto-assigns this entry to "2026 好竹弋漫才專場 《直球》"

#### Scenario: Ambiguous ticket resolved by date

- **WHEN** a ticket entry has name "高腳圓桌 & 包廂對號票 B30 包廂方桌位"
- **AND** the event mapping table maps this name to both "看我笑話｜第 2 季 4 月號" (sale period 2026/03/01–2026/03/31) and "看我笑話｜第 2 季 5 月號" (sale period 2026/04/01–2026/04/30)
- **AND** the order was created on 2026/03/22
- **THEN** the system auto-assigns this entry to "看我笑話｜第 2 季 4 月號"

#### Scenario: Ambiguous ticket unresolvable

- **WHEN** a ticket entry has an ambiguous event mapping
- **AND** the order creation date falls within the overlapping sale periods of multiple events
- **THEN** the entry is marked as "需手動確認" in the mapping UI
- **AND** the user MUST manually select the correct project before import

## MODIFIED Requirements

### Requirement: Upload cashflow and event files

The system SHALL provide an import page (`import.html`) with three upload zones: one for multiple Oen cashflow reports (撥款明細) in `.xlsx` format, one for multiple order CSVs (票券訂單 and 周邊訂單) in `.csv` format, and one optional zone for multiple activity registration reports (活動報名狀態) in `.xlsx` format. The right upload zone SHALL be labeled "票券與周邊訂單" and SHALL accept `.csv` files only. The third upload zone SHALL be labeled "活動報名狀態（選填）" and SHALL accept `.xlsx` files only. The system SHALL parse `.xlsx` files using SheetJS and `.csv` files using SheetJS CSV parsing. The system SHALL alert users when duplicate files are uploaded.

#### Scenario: Upload ticket order CSV

- **WHEN** user uploads a CSV file matching the pattern `*票券訂單*.csv` to the order upload zone
- **THEN** the system parses the CSV and adds it to the order files list as a ticket order type with its record count

#### Scenario: Upload merchandise order CSV

- **WHEN** user uploads a CSV file matching the pattern `*應援訂單*.csv` to the order upload zone
- **THEN** the system parses the CSV and adds it to the order files list as a merchandise order type with its record count

#### Scenario: Upload activity registration file

- **WHEN** user uploads an xlsx file matching the pattern `*活動報名狀態*.xlsx` to the activity registration upload zone
- **THEN** the system parses the file, extracts the event name from the filename, and adds it to the activity registration files list

#### Scenario: Upload single cashflow report

- **WHEN** user uploads an xlsx file to the cashflow upload zone
- **THEN** the system parses the file and adds it to the cashflow files list with its record count and date range

#### Scenario: Reject non-xlsx in activity registration zone

- **WHEN** user attempts to upload a non-xlsx file to the activity registration zone
- **THEN** the system SHALL ignore the file

#### Scenario: Upload duplicate file

- **WHEN** the user uploads a file with the same filename as one already uploaded in any zone
- **THEN** the system SHALL display an alert informing the user that this file has already been uploaded
- **AND** the duplicate file SHALL NOT be added

#### Scenario: Remove individual file

- **WHEN** user clicks the remove button on an uploaded file (cashflow, order, or activity registration)
- **THEN** that file is removed from the list and matching results are recalculated

### Requirement: Ticket name to project batch mapping

After order ID matching and optional multi-ticket splitting, the system SHALL extract all unique ticket group names from matched ticket orders and all unique product names from matched merchandise orders. If activity registration files are uploaded, the system SHALL attempt automatic event attribution for each group and pre-select the corresponding project in the mapping dropdown. Groups that are auto-attributed SHALL display a "自動對應" badge. Groups that are ambiguous and unresolvable SHALL display a "需手動確認" warning. The user MAY override any auto-selection. The mapping section title SHALL be "票券／商品對應專案".

#### Scenario: Auto-attributed mapping with activity registration

- **WHEN** activity registration files are uploaded
- **AND** ticket group "5/30 週六晚場大廳" maps uniquely to event "2026 好竹弋漫才專場 《直球》"
- **AND** "2026 好竹弋漫才專場 《直球》" exists in the project list
- **THEN** the mapping dropdown for "5/30 週六晚場大廳" is pre-selected to "2026 好竹弋漫才專場 《直球》"
- **AND** a "自動對應" badge is displayed

#### Scenario: Manual mapping without activity registration

- **WHEN** no activity registration files are uploaded
- **THEN** all mapping dropdowns default to "— 選擇專案 —" and require manual selection (existing behavior)

#### Scenario: Ambiguous mapping requires manual confirmation

- **WHEN** a ticket group name maps to multiple events and date-based resolution fails
- **THEN** the mapping dropdown displays a "需手動確認" warning
- **AND** the user MUST select a project manually
