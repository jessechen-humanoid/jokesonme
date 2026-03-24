## ADDED Requirements

### Requirement: Navigation tab for OpenTix Tracker

The navigation bar SHALL include a "票數追蹤" tab that links to `opentix.html`.

#### Scenario: Tab visible in navigation

- **WHEN** user loads any page on the jokesonme site
- **THEN** the navigation bar displays a "票數追蹤" link

#### Scenario: Tab navigates to embed page

- **WHEN** user clicks the "票數追蹤" tab
- **THEN** the browser navigates to `opentix.html`

### Requirement: Iframe embed page

The `opentix.html` page SHALL display the opentix-tracker application in a full-viewport iframe with the `?embed=true` query parameter.

#### Scenario: Page loads opentix-tracker in iframe

- **WHEN** user navigates to `opentix.html`
- **THEN** an iframe loads the opentix-tracker Vercel URL with `?embed=true` appended
- **THEN** the iframe fills the available viewport below the navigation bar

#### Scenario: No show selector on embed page

- **WHEN** user navigates to `opentix.html`
- **THEN** the page does NOT display a show selector, since opentix-tracker has its own event management

### Requirement: Embed mode hides navbar in opentix-tracker

When the opentix-tracker application receives `?embed=true` as a URL parameter, it SHALL hide its own navigation bar.

#### Scenario: Navbar hidden in embed mode

- **WHEN** opentix-tracker is loaded with `?embed=true` query parameter
- **THEN** the `<NavBar />` component is NOT rendered
- **THEN** all other page content and functionality remains intact

#### Scenario: Navbar visible in standalone mode

- **WHEN** opentix-tracker is loaded without `?embed=true` query parameter
- **THEN** the `<NavBar />` component is rendered normally
