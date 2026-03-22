## ADDED Requirements

### Requirement: Password gate for all pages

All pages (index.html, checklist.html, analytics.html) SHALL check sessionStorage for authentication state on page load. If not authenticated, the page SHALL display a full-screen overlay with a password input field, blocking access to all page content. The correct password SHALL be `joke0321`. Upon successful authentication, the system SHALL store the authenticated state in sessionStorage and remove the overlay. The authentication SHALL persist across page navigations within the same browser session and SHALL expire when the browser tab is closed.

#### Scenario: First visit without authentication

- **WHEN** a user navigates to any page without a valid sessionStorage authentication entry
- **THEN** a full-screen overlay is displayed with a password input field, and all page content behind the overlay is not interactable

#### Scenario: Enter correct password

- **WHEN** the user enters `joke0321` and submits
- **THEN** the overlay is removed, sessionStorage stores the authenticated state, and the page content becomes visible and interactable

#### Scenario: Enter incorrect password

- **WHEN** the user enters an incorrect password and submits
- **THEN** an error message is displayed, and the overlay remains visible

#### Scenario: Navigate between pages after authentication

- **WHEN** the user has authenticated on one page and navigates to another page
- **THEN** the other page detects the sessionStorage authentication and does not show the overlay
