# show-checklist Specification (delta)

## ADDED Requirements

### Requirement: Project name editing preserves focus

Editing a project name input on the checklist page SHALL persist the change via the single-item update path without reloading the whole checklist. The input element SHALL NOT be re-created by the save, so keyboard focus and caret position are preserved while the user keeps typing. If the save fails, the UI SHALL surface the existing error indication and restore the last persisted value.

#### Scenario: Continuous typing keeps focus

- **WHEN** user types continuously in a project name input for longer than the debounce interval
- **THEN** the input keeps keyboard focus and the caret does not jump while saves occur in the background

#### Scenario: Edited name is persisted

- **WHEN** user edits a project name, waits for the debounced save, and manually reloads the page
- **THEN** the checklist shows the edited name

### Requirement: Checklist initialization is not repeated

When a show is selected and its checklist already contains items, the client SHALL NOT call the checklist initialization action again. Initialization SHALL only be requested when the fetched checklist for the selected show is empty.

#### Scenario: Re-selecting an initialized show

- **WHEN** user selects a show whose checklist already has items
- **THEN** no `initChecklist` request is issued and the existing items render directly

#### Scenario: Selecting a new show initializes once

- **WHEN** user selects a show whose fetched checklist is empty
- **THEN** exactly one `initChecklist` request is issued before items render
