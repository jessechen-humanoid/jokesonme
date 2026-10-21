## MODIFIED Requirements

### Requirement: Page header economy

Every page SHALL start with a compact top bar containing the page name as the `h1` (24px) and the signed-in user's avatar; detail pages SHALL add a back link to their parent page. The top bar SHALL NOT be a coloured title card and SHALL NOT repeat the brand name (the brand name appears in the desktop sidebar and on the login page). Filter or sub-page switches SHALL sit directly under the title as one segmented control that fits a 375px screen without hiding any option. A header SHALL NOT repeat a number already shown in its segmented control. Instructional copy that explains how to use a feature SHALL appear only in that list's empty state.

#### Scenario: Todo page header

- **WHEN** a member opens the todo page
- **THEN** the top bar shows 「待辦」 and the avatar, counts appear only in the segmented control, and no explanatory subtitle is shown

#### Scenario: Finance tabs on a phone

- **WHEN** a member opens 收支 at 375px width
- **THEN** 收支、逐筆、分析、匯入、預估 are all visible without horizontal scrolling

## ADDED Requirements

### Requirement: Icon navigation

The bottom navigation on phones and the sidebar on desktop (≥ 900px) SHALL show a line icon above or beside every label: 待辦, 筆記, 演出, 行事曆, 財務. The current section SHALL be marked by persimmon icon and label.

#### Scenario: Current section on a phone

- **WHEN** a member is on any /shows page
- **THEN** the 演出 item shows its icon and label in persimmon and the other items in `--ink-2`

### Requirement: Desktop two-column pages

At widths of 900px and above, the show planning page SHALL place 筆記 and 待辦 side by side, and the calendar SHALL place the month grid and the selected day's items side by side. Below 900px they SHALL stack in a single column.

#### Scenario: Show page on a laptop

- **WHEN** a member opens a show page at 1280px width
- **THEN** 筆記 is the left column and 待辦 is the right column
