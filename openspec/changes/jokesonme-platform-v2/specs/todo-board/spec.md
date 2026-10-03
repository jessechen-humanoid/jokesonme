## Purpose

One shared, mobile-friendly todo list for the troupe that merges slash-command, show-template, and manually created todos.

## ADDED Requirements

### Requirement: Single todo list

All todos SHALL live in one store regardless of source (`command`, `template`, `manual`). Each todo SHALL have a title, optional show, optional due date, zero or more assignees, completion state, and source. Members and admin SHALL be able to create, edit, and delete any todo from the web.

#### Scenario: Mixed sources in one list

- **WHEN** a member opens the todo page
- **THEN** command, template, and manually created todos appear in the same list

### Requirement: Two-state completion

A todo SHALL be either not done or done; there SHALL be no in-progress state. Toggling SHALL record who completed it and when.

#### Scenario: Mark done

- **WHEN** a member taps the checkbox of an open todo
- **THEN** the todo shows as done with the member's name and completion time

### Requirement: Todo assignment

A todo with no assignee SHALL be displayed as 「未認領」. Any member SHALL be able to claim an unassigned todo or change assignees. The page SHALL offer a 「我的待辦」 filter showing open todos assigned to the signed-in user.

#### Scenario: Claim

- **WHEN** a member taps 「認領」 on an unassigned todo
- **THEN** the member becomes its assignee

### Requirement: Todo source traceability

Todos with source `command` SHALL show and link to the originating group message (for a quote-reply command, the quoted message). Todos with source `template` SHALL show the template they came from.

#### Scenario: Inspect command todo

- **WHEN** a member opens a todo created by `/買膠帶`
- **THEN** the original group message text, author, and time are shown

### Requirement: Absolute date display

Every due date and reminder date shown in the UI SHALL be an absolute date in the form `M/D（週）`, e.g. `10/21（二）`. Relative forms such as `D-3` SHALL NOT be shown.

##### Example: formatting

| Stored date | Displayed |
| ----------- | --------- |
| 2026-10-21 | 10/21（三） |
| 2026-10-07 | 10/7（三） |

#### Scenario: Due date label

- **WHEN** a todo is due on 2026-10-21
- **THEN** its label reads 「10/21（三）前」

### Requirement: Todo ordering

Open todos SHALL be ordered by due date ascending with undated todos after dated ones; done todos SHALL be hidden by default and viewable through a toggle.

#### Scenario: Most urgent first

- **WHEN** the list contains todos due 10/9, 10/5, and one undated
- **THEN** they are shown in the order 10/5, 10/9, undated
