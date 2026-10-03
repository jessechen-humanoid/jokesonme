## Purpose

Lets the troupe and its finance partner sign in with their LINE accounts, gated by an admin-approved allowlist with three roles. It replaces the shared password so every action can be attributed to a person.

## ADDED Requirements

### Requirement: LINE Login sign-in

The system SHALL authenticate users only through LINE Login. The system SHALL NOT offer password, email, or Google sign-in. A signed-in session SHALL persist in the browser so that a returning user on the same browser is not asked to sign in again until the session expires (30 days).

#### Scenario: Desktop sign-in

- **WHEN** an unauthenticated user opens any platform page in a desktop browser
- **THEN** the system redirects to LINE Login and, after the user approves, returns to the requested page with a session

#### Scenario: Returning user

- **WHEN** a user with an unexpired session opens the platform again in the same browser
- **THEN** the page loads without any sign-in prompt

### Requirement: Automatic sign-in from LINE links

Links the platform sends into LINE SHALL use the LIFF URL form. When a user opens such a link inside the LINE app, the system SHALL establish the session from the LIFF identity without showing any sign-in screen.

#### Scenario: Open link from group chat

- **WHEN** a member taps a platform link posted in the LINE group
- **THEN** the page opens inside LINE, already signed in as that member

### Requirement: Same-provider user identity

The LINE Login channel and the Messaging API channel SHALL belong to the same LINE provider, and the system SHALL key users by LINE `userId`. A message author captured by the bot and a signed-in web user with the same `userId` SHALL resolve to the same platform user.

#### Scenario: Bot author matches web user

- **WHEN** member 柏文 sends a group message and later signs in on the web
- **THEN** both the captured message and the web session reference the same platform user record

### Requirement: Pending approval allowlist

A first-time sign-in SHALL create a user record with status `pending` and show a waiting-for-approval screen with no access to any data. Only an admin SHALL approve a pending user, choosing a role at approval time. An admin SHALL be able to revoke an approved user; a revoked user's next request SHALL be rejected.

#### Scenario: New person signs in

- **WHEN** a person whose LINE account is not on the allowlist signs in
- **THEN** they see a waiting-for-approval screen and the admin approvals page lists them as pending

#### Scenario: Admin approves

- **WHEN** the admin approves the pending user with role `finance_partner`
- **THEN** that user's next page load shows the finance pages

### Requirement: Role-based page access

The system SHALL support exactly three roles: `admin`, `member`, `finance_partner`. `admin` and `member` SHALL access all pages; only `admin` SHALL access approvals, role changes, and template editing. `finance_partner` SHALL access only finance pages (transactions, settlements, advance reimbursements, analytics, forecast, cash-flow import) and SHALL NOT read todos, ideas, planning pages, or captured LINE messages. Enforcement SHALL happen on the server for every data request, not only by hiding navigation.

##### Example: access matrix

| Role | Todos, ideas & messages | Finance pages | Approvals & templates |
| ---- | ---------------- | ------------- | --------------------- |
| admin | yes | yes | yes |
| member | yes | yes | no |
| finance_partner | no | yes | no |

#### Scenario: Finance partner requests todos

- **WHEN** a `finance_partner` user calls the todos data endpoint directly
- **THEN** the server responds with 403 and returns no todo data
