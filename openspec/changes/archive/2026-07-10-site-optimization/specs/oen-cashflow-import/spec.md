# oen-cashflow-import Specification (delta)

## ADDED Requirements

### Requirement: External library integrity verification

The SheetJS library `<script>` tag on the import page SHALL pin a specific library version and SHALL include an `integrity` attribute with the SHA-384 hash of that version plus `crossorigin="anonymous"`. If the fetched file does not match the hash, the browser blocks execution and the import feature becomes unavailable rather than running tampered code. A comment adjacent to the tag SHALL document how to recompute the hash when upgrading the library version.

#### Scenario: Library loads with valid integrity

- **WHEN** user opens the import page with network access and the CDN serves the pinned SheetJS version
- **THEN** the library loads (`typeof XLSX !== 'undefined'`) and file import works as before

#### Scenario: Tampered library is blocked

- **WHEN** the CDN response does not match the declared SHA-384 hash
- **THEN** the browser refuses to execute the script and no spreadsheet parsing occurs
