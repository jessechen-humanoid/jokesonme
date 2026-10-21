## MODIFIED Requirements

### Requirement: Todo page header without duplicate numbers

The todo page header SHALL show each count exactly once: the segmented control carries the counts (「我的 N」「全部 N」「未認領 N」) and the header SHALL NOT render separate statistic cards. Below the control the page SHALL show one 「下一場」 row with the next performance's name, date in `M/D（週）` form, and days remaining, linking to that show's page; when there is no upcoming performance the row SHALL read 「還沒排下一場演出」 and link to the shows page.

#### Scenario: Header with a next show

- **WHEN** today is 2026-10-03 and the next show is 「看我笑話 10 月號」 on 2026-10-24
- **THEN** the page shows the segmented control with counts, no statistic cards, and a row with 「下一場」, 「還有 21 天」, 「看我笑話 10 月號」 and 「10/24（六）」 linking to that show

#### Scenario: Header without a next show

- **WHEN** no active performance is dated on or after today
- **THEN** the row reads 「還沒排下一場演出」 and links to the shows page

## ADDED Requirements

### Requirement: Due date urgency colouring

An open todo's due label SHALL be coloured by urgency relative to today in Asia/Taipei: overdue labels SHALL use the danger colour on its tinted background, labels due today through three days ahead SHALL use `--brand-deep` on `--brand-4`, and later labels SHALL use `--ink-2`. Done todos SHALL NOT be coloured.

#### Scenario: Overdue todo

- **WHEN** today is 2026-10-22 and an open todo is due 2026-10-20
- **THEN** its label 「10/20（二）前」 uses the danger colour
