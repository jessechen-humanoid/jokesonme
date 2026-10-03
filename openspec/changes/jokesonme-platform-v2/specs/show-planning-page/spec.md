## Purpose

Gives each monthly show one page that gathers its ideas, todos, and working documents so the troupe can see the month's plan at a glance.

## ADDED Requirements

### Requirement: Monthly planning page

Each show SHALL have a planning page showing the show name and performance date (in `M/D（週）` form), the ideas assigned to it, and its todos (open first, by due date). The show list SHALL let members open any show's planning page. `finance_partner` SHALL NOT access planning pages.

#### Scenario: Open October show

- **WHEN** a member opens 「第 2 季 10 月號」
- **THEN** its assigned ideas and its todos appear on one page

### Requirement: Show document links

The planning page SHALL hold three editable link fields: rundown, presentation, and survey. Empty fields SHALL show an add action; filled fields SHALL open the link in a new tab.

#### Scenario: Add rundown link

- **WHEN** a member pastes a Google Docs URL into the rundown field
- **THEN** the planning page shows a rundown link that opens that URL
