## MODIFIED Requirements

### Requirement: Monthly planning page

Each performance SHALL have a planning page showing the show name and performance date (in `M/D（週）` form), the ideas assigned to it, and its todos (open first, by due date). The shows page, labelled 「演出」 in the bottom navigation, SHALL list only `performance` rows in two groups: 「接下來」 (dated on or after today, ascending) and 「已演出／其他」 (dated before today, undated, or archived). Members SHALL open any show's planning page from either group. The ＋ action on a planning page SHALL create a todo or idea already attached to that show. `finance_partner` SHALL NOT access planning pages.

#### Scenario: Open October show

- **WHEN** a member opens 「第 2 季 10 月號」
- **THEN** its assigned ideas and its todos appear on one page

#### Scenario: Shows page grouping

- **WHEN** today is 2026-10-03 and performances are 10 月號 (10/24), 11 月號 (11/21), 9 月號 (9/26), 《直球》(undated)
- **THEN** 「接下來」 lists 10 月號 then 11 月號, 「已演出／其他」 lists 9 月號 and 《直球》, and no ledger row appears

#### Scenario: Add an idea from the show page

- **WHEN** a member taps ＋ on the 10 月號 page and saves an idea
- **THEN** the idea is attached to 10 月號 and appears in that page's idea list
