## Purpose

Keeps the troupe's show ideas from the LINE group in one place where they can be reviewed later and attached to a specific show.

## ADDED Requirements

### Requirement: Idea library page

The platform SHALL provide an idea library page listing all non-archived ideas without a show, newest first, each showing text, author, time, and a link to the original message. Admin and members SHALL access it; `finance_partner` SHALL NOT.

#### Scenario: View unsorted ideas

- **WHEN** a member opens the idea library
- **THEN** every unassigned, non-archived idea is listed with its author and time

### Requirement: Assign idea to a show

A member SHALL be able to assign an idea to a show, move it to another show, or return it to the library; a member SHALL be able to archive an idea and restore it from an archived view. Members SHALL also be able to add or edit ideas on the web.

#### Scenario: Assign to November show

- **WHEN** a member assigns 「讓觀眾投票決定結局」 to 「第 2 季 11 月號」
- **THEN** the idea leaves the library list and appears on that show's planning page
