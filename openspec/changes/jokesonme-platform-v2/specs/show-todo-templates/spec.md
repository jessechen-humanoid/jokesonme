## Purpose

Generates the recurring preparation todos for monthly shows with real due dates, replacing the unused static checklist.

## ADDED Requirements

### Requirement: Monthly show template

The system SHALL hold one template for show type `monthly`, each item having a title, default assignee (optional), and an offset in days relative to the performance date (negative = before). Only admin SHALL edit the template. The initial template SHALL be drafted from the legacy 23 checklist items and approved by Jesse before first use.

#### Scenario: Admin edits template

- **WHEN** the admin changes an item's offset from -14 to -10
- **THEN** shows created afterwards use -10 and existing shows' todos are unchanged

### Requirement: Template-generated due dates

Creating a show of type `monthly` with a performance date SHALL create one todo per template item, linked to the show, with source `template`, the item's default assignee, and due date = performance date + offset. Changing the show's performance date SHALL shift the due dates of that show's not-done template todos by the same number of days.

##### Example: due date calculation

| Performance date | Offset | Due date |
| ---------------- | ------ | -------- |
| 2026-10-24 | -21 | 2026-10-03 |
| 2026-10-24 | -1 | 2026-10-23 |
| 2026-10-24 | +7 | 2026-10-31 |

#### Scenario: Create monthly show

- **WHEN** an admin creates 「第 2 季 10 月號」 with type `monthly` and date 2026-10-24
- **THEN** template todos linked to that show exist with due dates computed from 2026-10-24

### Requirement: No templates for special shows

Shows of type `special` or `other` SHALL NOT generate template todos. Their finance records SHALL behave like any other show.

#### Scenario: Create special show

- **WHEN** a show of type `special` is created
- **THEN** no template todos are created and the show is selectable on finance pages
