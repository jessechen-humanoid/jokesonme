## MODIFIED Requirements

### Requirement: Show selector on each page

The system SHALL provide a project selector dropdown on pages that require a project context (transaction page, checklist page). The dropdown SHALL display all projects from the project list sheet. The label and placeholder SHALL use the term "專案" instead of "演出" in user-visible text.

#### Scenario: Project selector displays projects

- **WHEN** user opens a page with a project selector
- **THEN** the dropdown displays all projects with placeholder "— 請選擇專案 —"

#### Scenario: Add new project option

- **WHEN** user selects "＋ 新增一個專案" from the dropdown
- **THEN** a modal appears with title "新增專案" and label "專案名稱"
