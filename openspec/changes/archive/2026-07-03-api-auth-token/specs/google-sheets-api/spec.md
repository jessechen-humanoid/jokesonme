## ADDED Requirements

### Requirement: Password verification action

The API SHALL support a `verifyPassword` action. It accepts a POST payload containing `password` and compares it against the `APP_PASSWORD` value stored in Script Properties. On match, it SHALL return `{ success: true, token: <API_TOKEN> }` where `API_TOKEN` is read from Script Properties. On mismatch, it SHALL return a failure response and SHALL NOT include a token.

#### Scenario: Correct password returns token

- **WHEN** a POST request with action `verifyPassword` and payload `{ password: <correct password> }` is sent
- **THEN** the API returns `{ success: true, token: <API_TOKEN> }`

#### Scenario: Incorrect password is rejected

- **WHEN** a POST request with action `verifyPassword` and an incorrect password is sent
- **THEN** the API returns a failure response with no token field

### Requirement: Token authorization for all actions

The API SHALL require a valid `token` on every action except `verifyPassword`. The token is read from the request (query parameter for GET, payload field for POST) and compared against the `API_TOKEN` value in Script Properties. If `API_TOKEN` is not set in Script Properties, the API SHALL skip token verification to allow a zero-downtime transition; this fallback exists only until the property is configured. Once `API_TOKEN` is set, any request whose token does not match SHALL return `{ success: false, error: "unauthorized" }` and SHALL NOT read or write any data.

#### Scenario: Missing token is rejected once enforcement is active

- **WHEN** `API_TOKEN` is set and a request for any action other than `verifyPassword` is sent without a token or with a wrong token
- **THEN** the API returns `{ success: false, error: "unauthorized" }` and performs no data read or write

#### Scenario: Valid token behaves normally

- **WHEN** `API_TOKEN` is set and a request includes a token equal to `API_TOKEN`
- **THEN** the action executes exactly as it did before authorization was added

#### Scenario: Transitional fallback before property is configured

- **WHEN** `API_TOKEN` is not set in Script Properties and a request without a token is sent
- **THEN** the API executes the action normally, preserving compatibility with the pre-upgrade frontend

## REMOVED Requirements

### Requirement: Data migration action

**Reason**: The `migrateRenameShowToProject` one-time migration has already been executed in production; keeping it routable is an unnecessary attack surface.

**Migration**: The function body remains in gas/Code.gs for historical reference but is removed from the action router, so the action is no longer reachable via the API.

### Requirement: Analytics cleanup migration

**Reason**: The `migrateAnalyticsCleanup` one-time migration has already been executed and has no idempotency guard, so an accidental or malicious call would destructively edit the project list.

**Migration**: The function body remains in gas/Code.gs for historical reference but is removed from the action router, so the action is no longer reachable via the API.
