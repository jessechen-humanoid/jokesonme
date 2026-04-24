# oen-cashflow-import Specification

## Purpose

TBD - created by archiving change 'oen-cashflow-import'. Update Purpose after archive.

## Requirements

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


<!-- @trace
source: multi-ticket-split
updated: 2026-04-12
code:
  - import.html
  - RAW DATA/20260410_2026 好竹弋漫才專場 《直球》_活動報名狀態_75筆.xlsx
  - RAW DATA/20260412_應援撥款明細_444筆.xlsx
  - RAW DATA/20260412_應援票券訂單_515筆.csv
  - RAW DATA/20260410_看我笑話｜第 2 季 5 月號_活動報名狀態_142筆.xlsx
  - .DS_Store
  - js/import.js
  - RAW DATA/20260410_2026 支薪好友喜劇專場 《向上管理》_活動報名狀態_273筆.xlsx
  - RAW DATA/20260410_看我笑話｜第 2 季 4 月號_活動報名狀態_148筆.xlsx
  - RAW DATA/20260412_應援訂單_85筆.csv
-->

---
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


<!-- @trace
source: order-id-matching
updated: 2026-04-12
code:
  - RAW DATA/20260410_2026 好竹弋漫才專場 《直球》_活動報名狀態_75筆.xlsx
  - .DS_Store
  - RAW DATA/20260412_應援票券訂單_515筆.csv
  - RAW DATA/20260412_應援訂單_85筆.csv
  - RAW DATA/20260410_2026 支薪好友喜劇專場 《向上管理》_活動報名狀態_273筆.xlsx
  - RAW DATA/20260410_看我笑話｜第 2 季 4 月號_活動報名狀態_148筆.xlsx
  - RAW DATA/20260412_應援撥款明細_444筆.xlsx
  - RAW DATA/20260410_看我笑話｜第 2 季 5 月號_活動報名狀態_142筆.xlsx
  - import.html
  - js/import.js
-->

---
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


<!-- @trace
source: order-id-matching
updated: 2026-04-12
code:
  - RAW DATA/20260410_2026 好竹弋漫才專場 《直球》_活動報名狀態_75筆.xlsx
  - .DS_Store
  - RAW DATA/20260412_應援票券訂單_515筆.csv
  - RAW DATA/20260412_應援訂單_85筆.csv
  - RAW DATA/20260410_2026 支薪好友喜劇專場 《向上管理》_活動報名狀態_273筆.xlsx
  - RAW DATA/20260410_看我笑話｜第 2 季 4 月號_活動報名狀態_148筆.xlsx
  - RAW DATA/20260412_應援撥款明細_444筆.xlsx
  - RAW DATA/20260410_看我笑話｜第 2 季 5 月號_活動報名狀態_142筆.xlsx
  - import.html
  - js/import.js
-->

---
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


<!-- @trace
source: order-id-matching
updated: 2026-04-12
code:
  - RAW DATA/20260410_2026 好竹弋漫才專場 《直球》_活動報名狀態_75筆.xlsx
  - .DS_Store
  - RAW DATA/20260412_應援票券訂單_515筆.csv
  - RAW DATA/20260412_應援訂單_85筆.csv
  - RAW DATA/20260410_2026 支薪好友喜劇專場 《向上管理》_活動報名狀態_273筆.xlsx
  - RAW DATA/20260410_看我笑話｜第 2 季 4 月號_活動報名狀態_148筆.xlsx
  - RAW DATA/20260412_應援撥款明細_444筆.xlsx
  - RAW DATA/20260410_看我笑話｜第 2 季 5 月號_活動報名狀態_142筆.xlsx
  - import.html
  - js/import.js
-->

---
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


<!-- @trace
source: order-id-matching
updated: 2026-04-12
code:
  - RAW DATA/20260410_2026 好竹弋漫才專場 《直球》_活動報名狀態_75筆.xlsx
  - .DS_Store
  - RAW DATA/20260412_應援票券訂單_515筆.csv
  - RAW DATA/20260412_應援訂單_85筆.csv
  - RAW DATA/20260410_2026 支薪好友喜劇專場 《向上管理》_活動報名狀態_273筆.xlsx
  - RAW DATA/20260410_看我笑話｜第 2 季 4 月號_活動報名狀態_148筆.xlsx
  - RAW DATA/20260412_應援撥款明細_444筆.xlsx
  - RAW DATA/20260410_看我笑話｜第 2 季 5 月號_活動報名狀態_142筆.xlsx
  - import.html
  - js/import.js
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

---
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


<!-- @trace
source: order-id-matching
updated: 2026-04-12
code:
  - RAW DATA/20260410_2026 好竹弋漫才專場 《直球》_活動報名狀態_75筆.xlsx
  - .DS_Store
  - RAW DATA/20260412_應援票券訂單_515筆.csv
  - RAW DATA/20260412_應援訂單_85筆.csv
  - RAW DATA/20260410_2026 支薪好友喜劇專場 《向上管理》_活動報名狀態_273筆.xlsx
  - RAW DATA/20260410_看我笑話｜第 2 季 4 月號_活動報名狀態_148筆.xlsx
  - RAW DATA/20260412_應援撥款明細_444筆.xlsx
  - RAW DATA/20260410_看我笑話｜第 2 季 5 月號_活動報名狀態_142筆.xlsx
  - import.html
  - js/import.js
-->

---
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


<!-- @trace
source: multi-ticket-split
updated: 2026-04-12
code:
  - import.html
  - RAW DATA/20260410_2026 好竹弋漫才專場 《直球》_活動報名狀態_75筆.xlsx
  - RAW DATA/20260412_應援撥款明細_444筆.xlsx
  - RAW DATA/20260412_應援票券訂單_515筆.csv
  - RAW DATA/20260410_看我笑話｜第 2 季 5 月號_活動報名狀態_142筆.xlsx
  - .DS_Store
  - js/import.js
  - RAW DATA/20260410_2026 支薪好友喜劇專場 《向上管理》_活動報名狀態_273筆.xlsx
  - RAW DATA/20260410_看我笑話｜第 2 季 4 月號_活動報名狀態_148筆.xlsx
  - RAW DATA/20260412_應援訂單_85筆.csv
-->

---
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


<!-- @trace
source: multi-ticket-split
updated: 2026-04-12
code:
  - import.html
  - RAW DATA/20260410_2026 好竹弋漫才專場 《直球》_活動報名狀態_75筆.xlsx
  - RAW DATA/20260412_應援撥款明細_444筆.xlsx
  - RAW DATA/20260412_應援票券訂單_515筆.csv
  - RAW DATA/20260410_看我笑話｜第 2 季 5 月號_活動報名狀態_142筆.xlsx
  - .DS_Store
  - js/import.js
  - RAW DATA/20260410_2026 支薪好友喜劇專場 《向上管理》_活動報名狀態_273筆.xlsx
  - RAW DATA/20260410_看我笑話｜第 2 季 4 月號_活動報名狀態_148筆.xlsx
  - RAW DATA/20260412_應援訂單_85筆.csv
-->

---
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


<!-- @trace
source: multi-ticket-split
updated: 2026-04-12
code:
  - import.html
  - RAW DATA/20260410_2026 好竹弋漫才專場 《直球》_活動報名狀態_75筆.xlsx
  - RAW DATA/20260412_應援撥款明細_444筆.xlsx
  - RAW DATA/20260412_應援票券訂單_515筆.csv
  - RAW DATA/20260410_看我笑話｜第 2 季 5 月號_活動報名狀態_142筆.xlsx
  - .DS_Store
  - js/import.js
  - RAW DATA/20260410_2026 支薪好友喜劇專場 《向上管理》_活動報名狀態_273筆.xlsx
  - RAW DATA/20260410_看我笑話｜第 2 季 4 月號_活動報名狀態_148筆.xlsx
  - RAW DATA/20260412_應援訂單_85筆.csv
-->

---
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

<!-- @trace
source: multi-ticket-split
updated: 2026-04-12
code:
  - import.html
  - RAW DATA/20260410_2026 好竹弋漫才專場 《直球》_活動報名狀態_75筆.xlsx
  - RAW DATA/20260412_應援撥款明細_444筆.xlsx
  - RAW DATA/20260412_應援票券訂單_515筆.csv
  - RAW DATA/20260410_看我笑話｜第 2 季 5 月號_活動報名狀態_142筆.xlsx
  - .DS_Store
  - js/import.js
  - RAW DATA/20260410_2026 支薪好友喜劇專場 《向上管理》_活動報名狀態_273筆.xlsx
  - RAW DATA/20260410_看我笑話｜第 2 季 4 月號_活動報名狀態_148筆.xlsx
  - RAW DATA/20260412_應援訂單_85筆.csv
-->