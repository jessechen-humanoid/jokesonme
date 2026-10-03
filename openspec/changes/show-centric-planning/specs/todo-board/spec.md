## ADDED Requirements

### Requirement: Only the nearest show group is expanded

In the todo list grouped by show, only the group of the nearest upcoming performance present in the list SHALL be expanded by default; when no upcoming performance group is present, the first group SHALL be expanded. Every other show group SHALL be collapsed to one header line showing the show name, its date in `M/D（週）` form when it has one, and the number of todos in the current view, and SHALL expand when tapped. The 「沒有掛演出」 group SHALL always be expanded.

##### Example: default state

| Groups in view | Expanded | Collapsed |
| -------------- | -------- | --------- |
| 10 月號 (10/17), 11 月號 (11/21), 12 月號 (12/19), 沒有掛演出 | 10 月號, 沒有掛演出 | 11 月號, 12 月號 |
| 11 月號, 12 月號 (no 10 月號 todos in 「我的」) | 11 月號 | 12 月號 |

#### Scenario: Far shows collapsed

- **WHEN** a member opens 「全部」 while 10 月號 is the next show and 11 月號 and 12 月號 also have todos
- **THEN** 10 月號 shows its todos, 11 月號 and 12 月號 show only 「11/21（六）・21 件」 style header lines, and tapping one reveals its todos


### Requirement: Todo page header without duplicate numbers

The todo page header SHALL show each count exactly once: the filter chips carry the counts (「我的 N」「全部 N」「未認領 N」) and the header SHALL NOT render separate statistic cards. Below the chips the header SHALL show one 「下一場」 line with the next performance's name, date in `M/D（週）` form, and days remaining, linking to that show's page; when there is no upcoming performance the line SHALL read 「還沒排下一場演出」 and link to the shows page.

#### Scenario: Header with a next show

- **WHEN** today is 2026-10-03 and the next show is 「看我笑話 10 月號」 on 2026-10-24
- **THEN** the header shows the chips with counts, no statistic cards, and the line 「下一場・還有 21 天 看我笑話 10 月號・10/24（六）」 linking to that show

#### Scenario: Header without a next show

- **WHEN** no active performance is dated on or after today
- **THEN** the line reads 「還沒排下一場演出」 and links to the shows page

### Requirement: Show group header links to the show page

In the todo list grouped by show, each group header for a show SHALL be a link to that show's planning page; the 「沒有掛演出」 group header SHALL NOT be a link.

#### Scenario: Open a show from its group

- **WHEN** a member taps the 「10 月號」 group header on the todo page
- **THEN** the 10 月號 show page opens with its todos and ideas

### Requirement: Todo show field uses the shared picker

The show field in the todo create and edit panel SHALL use the shared show picker (next show first, upcoming, 「更多…」, 「不掛演出」) and SHALL never list ledger rows. When the panel is opened from a show's page, the field SHALL be pre-selected to that show.

#### Scenario: New todo from a show page

- **WHEN** a member taps ＋ on the 10 月號 show page and saves a todo
- **THEN** the saved todo is attached to 10 月號 without the member choosing a show
