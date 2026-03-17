## MODIFIED Requirements

### Requirement: Track item progress with three states

Each checklist item SHALL have a progress status with exactly three states: 未開始 (Not Started), 進行中 (In Progress), 已完成 (Completed). The default state for new items SHALL be 未開始. Status toggle SHALL use optimistic UI — the status badge SHALL update immediately without reloading the checklist, with background API persistence.

#### Scenario: Update item progress

- **WHEN** user clicks a status badge to cycle from "未開始" to "進行中"
- **THEN** the badge immediately changes color and text, and the API is called in the background

#### Scenario: Progress API failure rollback

- **WHEN** user clicks a status badge but the API call fails
- **THEN** the badge reverts to its previous state and an error message is shown

## ADDED Requirements

### Requirement: Checklist table layout

Each checklist category SHALL be rendered as a table with three column headers: 項目 (Item), 負責人 (Assignee), 進度 (Progress). The public relations ticket notes field SHALL be displayed in a row spanning all columns directly below the "公關票確認" item row.

#### Scenario: Checklist displays as table

- **WHEN** user views a checklist category
- **THEN** items are displayed in a table with aligned columns for item name, assignee dropdown, and progress badge

#### Scenario: Public ticket notes below item

- **WHEN** user views the "公關票確認" item
- **THEN** the notes textarea appears in the row directly below the item, spanning the full table width
