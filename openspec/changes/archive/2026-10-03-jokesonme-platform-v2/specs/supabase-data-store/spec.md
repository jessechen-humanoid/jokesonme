## Purpose

Moves all platform data from Google Sheets to Supabase in a single reconciled cutover, so the new platform has one source of truth.

## ADDED Requirements

### Requirement: Supabase as the single data store

After cutover, all platform data except the financial forecast SHALL be read from and written to Supabase. Wherever an existing finance spec names a Google Sheet (收支紀錄, 專案清單, 成員結算, 代墊還款), that SHALL be read as the corresponding Supabase table; calculation rules in those specs SHALL remain unchanged. The financial forecast (財務預估) SHALL stay in its Google Sheet tab, edited there directly; the platform SHALL link to it instead of re-implementing its formulas.

#### Scenario: Add transaction after cutover

- **WHEN** a member adds a transaction on the new platform
- **THEN** it is stored in Supabase and nothing is written to the Google Sheet

### Requirement: One-time finance migration

A migration script SHALL copy 專案清單, 收支紀錄, 成員結算, and 代墊還款 into Supabase in one run, preserving each sheet's row order so first-in-first-out advance settlement produces the same result, with actor `migration`. Legacy Checklist and Checklist模板 data SHALL NOT be migrated. The script SHALL be re-runnable against an empty target and SHALL refuse to run against a target that already holds finance rows.

#### Scenario: Accidental second run

- **WHEN** the migration is run again after a successful import
- **THEN** it exits with an error and changes nothing

### Requirement: Reconciliation gate

Before cutover, a reconciliation report SHALL compare old and new per-member settlement balances, per-member advance-reimbursement balances, per-show income and expense totals, and row counts. Cutover SHALL proceed only when every compared amount matches exactly (difference 0).

##### Example: report outcome

| Check | Old | New | Result |
| ----- | --- | --- | ------ |
| 柏文 settlement balance | 12,340 | 12,340 | pass |
| 巧達 advance balance | 3,000 | 2,999 | fail – blocks cutover |

#### Scenario: Mismatch

- **WHEN** any compared amount differs
- **THEN** the report lists the mismatches and the old platform stays in service

### Requirement: Legacy archive after cutover

After cutover the migrated tabs of the Google Sheet SHALL no longer be edited (the 財務預估 tab stays editable for forecasting) and the GAS Web App SHALL no longer be called by any page. The old static pages SHALL stop being the team's entry point.

#### Scenario: Old URL after cutover

- **WHEN** a member opens the old GitHub Pages URL after cutover
- **THEN** they are pointed to the new platform URL
