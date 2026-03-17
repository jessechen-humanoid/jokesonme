# show-checklist Specification

## Purpose

TBD - created by archiving change 'build-platform'. Update Purpose after archive.

## Requirements

### Requirement: Initialize checklist from template

The system SHALL generate a checklist for a selected show by copying items from the "Checklist模板" sheet. The generated checklist SHALL include all default items with their pre-assigned owners. Initialization SHALL occur automatically when a show is selected for the first time on the Checklist page.

#### Scenario: First-time show selection generates checklist

- **WHEN** user selects a show that has no existing checklist items
- **THEN** the system copies all template items into the "Checklist" sheet for that show, with default assignees pre-filled

#### Scenario: Subsequent show selection loads existing data

- **WHEN** user selects a show that already has checklist items
- **THEN** the system loads the existing checklist data without re-initializing from the template


<!-- @trace
source: build-platform
updated: 2026-03-17
code:
  - gas/Code.gs
  - .DS_Store
  - CLAUDE.md
-->

---
### Requirement: Checklist template with three categories

The checklist template SHALL contain items organized into three categories:

1. **演出內容** (Show Content) — 11 items including: show confirmation, performance lineup, 3 project slots (with editable names), presentation, rundown, music cues, survey, and VIP tickets
2. **設備與人員** (Equipment & Staff) — 8 items including: microphone rental, DV rental, lighting/sound crew, photographer, merchandise staff, and postcard production workflow
3. **影片製作** (Video Production) — 4 items including: video file delivery and 3 editing briefs that auto-populate with project names from category 1

#### Scenario: Template items have correct default assignees

- **WHEN** a checklist is initialized from the template
- **THEN** items with default assignees are pre-filled (e.g., 大弋 for microphone, 芭樂 for DV, 兔子 for photography, 柏文 for postcard illustration, 傑哥 for presentation/survey/VIP tickets)


<!-- @trace
source: build-platform
updated: 2026-03-17
code:
  - gas/Code.gs
  - .DS_Store
  - CLAUDE.md
-->

---
### Requirement: Video production items auto-populate project names

The three editing brief items in the Video Production category SHALL automatically display the project names entered in the Show Content category's project slots (企劃 1/2/3).

#### Scenario: Project name flows to editing brief

- **WHEN** user fills in "企劃 1" with the name "即興賽" in the Show Content category
- **THEN** the corresponding Video Production item displays as "「即興賽」剪輯說明"


<!-- @trace
source: build-platform
updated: 2026-03-17
code:
  - gas/Code.gs
  - .DS_Store
  - CLAUDE.md
-->

---
### Requirement: Track item progress with three states

Each checklist item SHALL have a progress status with exactly three states: 未開始 (Not Started), 進行中 (In Progress), 已完成 (Completed). The default state for new items SHALL be 未開始.

#### Scenario: Update item progress

- **WHEN** user changes an item's status from "未開始" to "進行中"
- **THEN** the status is updated and persisted to the "Checklist" sheet


<!-- @trace
source: build-platform
updated: 2026-03-17
code:
  - gas/Code.gs
  - .DS_Store
  - CLAUDE.md
-->

---
### Requirement: Progress status visual indicators

Each progress state SHALL be displayed with a distinct background color:
- 未開始: red background (`#E74C3C`)
- 進行中: yellow background (`#F39C12`)
- 已完成: green background (`#27AE60`)

#### Scenario: Status colors are visually distinct

- **WHEN** user views the checklist with items in different states
- **THEN** each item's status is displayed with its corresponding color (red, yellow, or green)


<!-- @trace
source: build-platform
updated: 2026-03-17
code:
  - gas/Code.gs
  - .DS_Store
  - CLAUDE.md
-->

---
### Requirement: Change item assignee

The system SHALL allow users to change the assignee of any checklist item by selecting from the member dropdown.

#### Scenario: Reassign an item

- **WHEN** user changes the assignee of "麥克風租借確認" from "大弋" to "芭樂"
- **THEN** the new assignee is saved and displayed


<!-- @trace
source: build-platform
updated: 2026-03-17
code:
  - gas/Code.gs
  - .DS_Store
  - CLAUDE.md
-->

---
### Requirement: Add custom checklist items

The system SHALL allow users to add new custom checklist items to any category for a specific show. Custom items SHALL support assignee selection and progress tracking.

#### Scenario: Add a custom item

- **WHEN** user clicks "新增待辦事項" and enters an item description
- **THEN** the new item is added to the checklist and persisted to the sheet


<!-- @trace
source: build-platform
updated: 2026-03-17
code:
  - gas/Code.gs
  - .DS_Store
  - CLAUDE.md
-->

---
### Requirement: Checklist data persistence

All checklist progress, assignee changes, and custom items SHALL be persisted to the "Checklist" sheet in Google Sheets. Data SHALL be retained across browser sessions.

#### Scenario: Progress persists after page reload

- **WHEN** user marks an item as "已完成" and reloads the page
- **THEN** the item still shows as "已完成"


<!-- @trace
source: build-platform
updated: 2026-03-17
code:
  - gas/Code.gs
  - .DS_Store
  - CLAUDE.md
-->

---
### Requirement: Public relations ticket notes

The "公關票確認" checklist item SHALL include a notes field where users can enter the names of people receiving complimentary tickets. This notes field SHALL be visible to all team members.

#### Scenario: Enter VIP ticket recipients

- **WHEN** user fills in the notes field for "公關票確認" with guest names
- **THEN** the guest names are saved and visible to all team members when they view this item

<!-- @trace
source: build-platform
updated: 2026-03-17
code:
  - gas/Code.gs
  - .DS_Store
  - CLAUDE.md
-->