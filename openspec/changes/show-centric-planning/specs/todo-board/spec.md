## ADDED Requirements

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
