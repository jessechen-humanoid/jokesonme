## ADDED Requirements

### Requirement: Page header economy

Every page's title card SHALL show the brand name 「看我笑話」 as a small secondary label (no larger than 13px) and the page name as the `h1`. A title card SHALL NOT repeat a number that is already shown in the same header's filter chips. Instructional copy that explains how to use a feature SHALL appear only in that list's empty state, not in the title card.

#### Scenario: Todo page header

- **WHEN** a member opens the todo page
- **THEN** the title card shows 「待辦」 as the heading, the brand name as a small label, counts only in the chips, and no explanatory subtitle

#### Scenario: Ideas page with content

- **WHEN** the ideas page has at least one unassigned idea
- **THEN** no copy about the `#` command is shown in the title card
