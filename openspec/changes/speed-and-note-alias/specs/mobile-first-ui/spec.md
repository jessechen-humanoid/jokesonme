## ADDED Requirements

### Requirement: Instant loading skeleton

Every signed-in page SHALL show a loading skeleton (header block and placeholder cards, navigation still visible) immediately after a member taps a navigation link, and SHALL replace it with the page once the server responds. The skeleton SHALL respect the reduced-motion preference.

#### Scenario: Switch tabs

- **WHEN** a member on 待辦 taps 演出 in the navigation
- **THEN** a skeleton appears before the server response arrives, and the 演出 page replaces it
