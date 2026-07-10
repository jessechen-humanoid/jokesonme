## MODIFIED Requirements

### Requirement: Password gate for all pages

All pages SHALL check sessionStorage for an authentication token on page load. If no valid token is present, the page SHALL display a full-screen overlay with a password input field, blocking access to all page content. The password SHALL NOT be hard-coded anywhere in the frontend. Instead, the entered password SHALL be sent to the backend `verifyPassword` action for verification. Upon a successful response, the system SHALL store the returned API token in sessionStorage and remove the overlay. The authentication SHALL persist across page navigations within the same browser session and SHALL expire when the browser tab is closed. When any API request returns an unauthorized error, the system SHALL clear the stored token from sessionStorage and re-display the password overlay.

#### Scenario: First visit without a token

- **WHEN** a user navigates to any page without a valid sessionStorage token
- **THEN** a full-screen overlay is displayed with a password input field, and all page content behind the overlay is not interactable

#### Scenario: Enter correct password

- **WHEN** the user enters the correct password and submits
- **THEN** the password is sent to the backend `verifyPassword` action, the returned token is stored in sessionStorage, the overlay is removed, and the page content becomes visible and interactable

#### Scenario: Enter incorrect password

- **WHEN** the user enters an incorrect password and submits
- **THEN** the backend returns a failure response, an error message is displayed, no token is stored, and the overlay remains visible

#### Scenario: Navigate between pages after authentication

- **WHEN** the user has authenticated on one page and navigates to another page
- **THEN** the other page detects the sessionStorage token and does not show the overlay

#### Scenario: Token rejected by backend

- **WHEN** an API request returns an unauthorized error because the stored token is missing or invalid
- **THEN** the system clears the token from sessionStorage and re-displays the password overlay

#### Scenario: No hard-coded password in frontend

- **WHEN** the frontend source code is searched for the previous literal password value
- **THEN** no occurrence is found, because password verification happens only on the server
