# show-planning-page Specification

## Purpose

Gives each monthly show one page that gathers its ideas, todos, and working documents so the troupe can see the month's plan at a glance.

## Requirements

### Requirement: Monthly planning page

Each performance SHALL have a planning page showing the show name, its type, and performance date (in `M/D（週）` form) with days remaining, followed by 筆記 (the ideas assigned to it) and then its todos. 筆記 SHALL come first and SHALL offer an inline composer on the page itself: typing text and pressing 存 SHALL create a note already attached to that show without opening a panel. The todos SHALL be collapsed by default into one summary card showing the number of open todos and the earliest open due date; tapping it SHALL expand the full todo list (open first, by due date) and offer 新增待辦, which creates a todo already attached to that show. The shows page, labelled 「演出」 in the navigation, SHALL list only `performance` rows in two groups: 「接下來」 (dated on or after today, ascending) and 「已演出／其他」 (dated before today, undated, or archived). Members SHALL open any show's planning page from either group. `finance_partner` SHALL NOT access planning pages.

#### Scenario: Open October show

- **WHEN** a member opens 「第 2 季 10 月號」
- **THEN** its notes appear first, followed by a collapsed card reading the number of open todos and the earliest due date

#### Scenario: Shows page grouping

- **WHEN** today is 2026-10-03 and performances are 10 月號 (10/24), 11 月號 (11/21), 9 月號 (9/26), 《直球》(undated)
- **THEN** 「接下來」 lists 10 月號 then 11 月號, 「已演出／其他」 lists 9 月號 and 《直球》, and no ledger row appears

#### Scenario: Write a note on the show page

- **WHEN** a member types 「開場改成觀眾投票」 into the 筆記 composer on the 10 月號 page and presses 存
- **THEN** the note is attached to 10 月號 and appears at the top of that page's notes

#### Scenario: Expand todos

- **WHEN** a member taps the collapsed todo card on the 10 月號 page
- **THEN** the full todo list of 10 月號 appears with a 新增待辦 action

---
### Requirement: Shows page emphasises only the next show

On the shows page, the next performance SHALL be shown as a highlighted card with its date, days remaining, number of notes, and number of open todos; the other upcoming performances SHALL be compact rows with a date badge, name, and the same two counts; the 「已演出／其他」 group SHALL be collapsed by default behind a toggle showing its count.

#### Scenario: Default shows page

- **WHEN** a member opens the shows page while 10 月號 is next and 11 月號, 12 月號 follow
- **THEN** 10 月號 appears as a highlighted card with 「還有 14 天」 and its note and open todo counts, 11 月號 and 12 月號 are single rows with date badges, and past or undated shows are hidden until 「已演出／其他（N）」 is tapped
