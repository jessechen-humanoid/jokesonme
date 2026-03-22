## ADDED Requirements

### Requirement: Persist show selection across page navigation

The system SHALL store the user's selected show in sessionStorage when a show is selected, and restore it automatically when any page loads.

#### Scenario: User navigates away and returns

- **WHEN** the user selects a show, navigates to another page, and returns
- **THEN** the previously selected show SHALL be automatically restored and its data loaded

#### Scenario: Stored show no longer exists

- **WHEN** the stored show name does not match any available option
- **THEN** the system SHALL silently ignore the stored value and show the default empty state

#### Scenario: Session ends

- **WHEN** the browser tab is closed
- **THEN** the stored selection SHALL be cleared (sessionStorage behavior)
