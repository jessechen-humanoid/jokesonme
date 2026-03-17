# show-management Specification

## Purpose

TBD - created by archiving change 'build-platform'. Update Purpose after archive.

## Requirements

### Requirement: Show list shared across pages

The system SHALL maintain a single shared show list accessible from both the Transaction page and the Checklist page. All shows SHALL be stored in the "演出清單" sheet in Google Sheets.

#### Scenario: View show list from any page

- **WHEN** user opens the show dropdown on any page
- **THEN** the same list of shows is displayed, sourced from the shared "演出清單" sheet


<!-- @trace
source: build-platform
updated: 2026-03-17
code:
  - gas/Code.gs
  - .DS_Store
  - CLAUDE.md
-->

---
### Requirement: Pre-loaded default shows

The system SHALL pre-populate the show list with the following 13 shows:

1. 會員與其他收支
2. 周邊商品收支
3. 看我笑話第 2 季 Opening Party
4. 看我笑話 4 月號
5. 看我笑話 5 月號
6. 看我笑話 6 月號
7. 看我笑話 7 月號
8. 看我笑話 8 月號
9. 看我笑話 9 月號
10. 看我笑話 10 月號
11. 看我笑話 11 月號
12. 看我笑話 12 月號
13. 看我笑話第 2 季 After Party

#### Scenario: Default shows available on first use

- **WHEN** user opens the platform for the first time
- **THEN** all 13 default shows are available in the show dropdown


<!-- @trace
source: platform-v2
updated: 2026-03-17
code:
  - index.html
  - js/analytics.js
  - CLAUDE.md
  - js/checklist.js
  - .DS_Store
  - js/transaction.js
  - js/api.js
  - js/shared.js
  - gas/Code.gs
  - css/style.css
-->

---
### Requirement: Add new show

The system SHALL allow users to add a new show by entering a custom show name. The new show SHALL appear in the dropdown on all pages immediately after creation.

#### Scenario: Create a new show

- **WHEN** user selects "新增一檔演出" and enters a show name
- **THEN** the show is added to the "演出清單" sheet and appears in all show dropdowns


<!-- @trace
source: build-platform
updated: 2026-03-17
code:
  - gas/Code.gs
  - .DS_Store
  - CLAUDE.md
-->

---
### Requirement: Member selection

The system SHALL provide a member dropdown with the following 8 default members: 傑哥, 柏文, 巧達, 芭樂, 又又, 兔子, 大弋, 竹節蟲. The dropdown SHALL also include an "其他" option that allows free-text input for non-default members.

#### Scenario: Select a default member

- **WHEN** user opens the member dropdown
- **THEN** all 8 default members are listed as selectable options

#### Scenario: Enter a non-default member

- **WHEN** user selects "其他" from the member dropdown
- **THEN** a text input field appears allowing the user to type a custom name

<!-- @trace
source: build-platform
updated: 2026-03-17
code:
  - gas/Code.gs
  - .DS_Store
  - CLAUDE.md
-->