## ADDED Requirements

### Requirement: Analytics cleanup migration

The API SHALL support a `migrateAnalyticsCleanup` action that performs a one-time data migration:

1. Remove the row with project name "會員與其他收支" from the project list sheet
2. Reorder the project list so that "看我笑話年度大會｜看我畫大餅" appears before "看我笑話第 2 季 Opening Party"

#### Scenario: Migration removes obsolete project and reorders

- **WHEN** a POST request is sent with action `migrateAnalyticsCleanup`
- **THEN** the "會員與其他收支" row is deleted and "看我笑話年度大會｜看我畫大餅" is moved before "看我笑話第 2 季 Opening Party"
- **AND** a success response is returned

#### Scenario: Migration is idempotent

- **WHEN** the migration is called after it has already been executed
- **THEN** no errors occur and a success response is returned
