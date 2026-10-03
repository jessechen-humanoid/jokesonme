## MODIFIED Requirements

### Requirement: Show list shared across pages

The system SHALL maintain a single shared show list accessible from the todo page and all finance pages. All shows SHALL be stored in the Supabase `shows` table, each with name, type (`monthly`, `special`, or `other`), optional performance date, and status.

#### Scenario: View show list from any page

- **WHEN** user opens the show dropdown on any page
- **THEN** the same list of shows is displayed, sourced from the Supabase `shows` table

### Requirement: Add new show

The system SHALL allow admin and members to add a new show by entering a name, choosing a type, and optionally a performance date. A `monthly` show SHALL require a performance date. The new show SHALL appear in the dropdown on all pages immediately after creation.

#### Scenario: Create a new show

- **WHEN** user selects 「新增一檔演出」, enters 「第 2 季 10 月號」, type `monthly`, date 2026-10-24
- **THEN** the show is stored in Supabase and appears in all show dropdowns

#### Scenario: Monthly show without date

- **WHEN** user submits a `monthly` show without a performance date
- **THEN** the form shows an error and no show is created
