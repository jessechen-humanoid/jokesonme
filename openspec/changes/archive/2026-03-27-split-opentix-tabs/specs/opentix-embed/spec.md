## MODIFIED Requirements

### Requirement: Navigation tab for OpenTix Tracker

The navigation bar SHALL include two tabs for opentix-tracker:
- "追蹤演出" linking to `opentix.html`
- "追蹤售票" linking to `opentix-analytics.html`

#### Scenario: Both tabs visible in navigation

- **WHEN** user loads any page on the jokesonme site
- **THEN** the navigation bar displays both "追蹤演出" and "追蹤售票" links

#### Scenario: 追蹤演出 tab navigates to tracking page

- **WHEN** user clicks the "追蹤演出" tab
- **THEN** the browser navigates to `opentix.html`
- **THEN** an iframe loads the opentix-tracker root page with `?embed=true`

#### Scenario: 追蹤售票 tab navigates to analytics page

- **WHEN** user clicks the "追蹤售票" tab
- **THEN** the browser navigates to `opentix-analytics.html`
- **THEN** an iframe loads the opentix-tracker `/analytics` page with `?embed=true`

## ADDED Requirements

### Requirement: Analytics iframe embed page

The `opentix-analytics.html` page SHALL display the opentix-tracker analytics page in a full-viewport iframe with the `?embed=true` query parameter.

#### Scenario: Page loads analytics in iframe

- **WHEN** user navigates to `opentix-analytics.html`
- **THEN** an iframe loads the opentix-tracker Vercel URL `/analytics?embed=true`
- **THEN** the iframe fills the available viewport below the navigation bar
