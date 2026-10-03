## Purpose

Keeps a complete, tamper-resistant record of who changed what and when, including logins and finance exports, at the database layer so no code path can skip it.

## ADDED Requirements

### Requirement: Automatic data change logging

Every insert, update, and delete on every application table SHALL be recorded by a database trigger with timestamp, table, row id, operation, old values, new values, and actor. Adding a new application table SHALL require attaching the trigger in the same migration. The raw captured LINE messages table SHALL be the only exception: it holds group chat input rather than platform data, is purged after 14 days, and SHALL NOT be audited; todos and ideas created from those messages SHALL still be audited.

#### Scenario: Edit a transaction

- **WHEN** a member changes a transaction amount from 1000 to 1200
- **THEN** an audit row records the old value 1000, new value 1200, the member, and the time

### Requirement: Actor attribution

Each audit row SHALL identify the actor as either an approved user or one of the system actors `line-bot`, `reminder-job`, `migration`. A write with no resolvable actor SHALL be rejected rather than logged anonymously.

#### Scenario: Bot-created todo

- **WHEN** the slash command creates a todo
- **THEN** the audit row's actor is `line-bot` and the todo references the message author as creator

### Requirement: Login and export events

Successful sign-ins, approvals, role changes, and any download or export of finance data SHALL be recorded as audit events. Page views SHALL NOT be recorded.

#### Scenario: Export

- **WHEN** a finance partner downloads the settlement table
- **THEN** an audit event records the user, time, and which export

### Requirement: Append-only audit log

The audit log SHALL reject update and delete from every application role, including the server's service role; only insert SHALL be permitted.

#### Scenario: Tamper attempt

- **WHEN** any application credential issues `delete from audit_log`
- **THEN** the database raises an error and no row is removed

### Requirement: Financial soft delete

Deleting a transaction, settlement, or advance-reimbursement record SHALL mark it deleted with actor and time instead of removing the row; deleted records SHALL be excluded from all totals and lists.

#### Scenario: Delete a transaction

- **WHEN** a member deletes a transaction
- **THEN** it disappears from the list and totals, and the row still exists marked deleted
