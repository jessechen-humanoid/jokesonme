## Purpose

The finance overview and show profit-and-loss views let members see the year's money at a glance on a phone. This capability defines what those views show and how they stay readable on narrow screens.

## ADDED Requirements

### Requirement: Prior-year unpaid notice

The finance overview SHALL show a notice above the member distribution section whenever, for any Taipei calendar year earlier than the year being viewed, at least one member's unpaid distribution for that year is greater than 0. A member's unpaid distribution for a year is the same figure the member tile shows as 未付 when that year is selected. The notice SHALL contain one line per such year, most recent year first, stating the year, the number of members with a positive unpaid amount, and the sum of those positive amounts, and each line SHALL link to the finance overview for that year. Years in which no member has a positive unpaid amount SHALL NOT be listed, and when no earlier year qualifies the notice SHALL NOT be rendered. The notice SHALL NOT change the default year and SHALL NOT change any calculated figure.

#### Scenario: Earlier year still has unpaid distributions

- **WHEN** the overview is showing 2027 and, for 2026, two members have unpaid amounts of $60,646 and $812 while every other member's 2026 unpaid amount is 0 or negative
- **THEN** the notice shows one line for 2026 with 2 members and a total of $61,458, linking to the 2026 overview

#### Scenario: Everything in earlier years is paid

- **WHEN** the overview is showing 2027 and no member has a positive unpaid amount for any earlier year
- **THEN** no prior-year notice is rendered

#### Scenario: Viewing the earliest year

- **WHEN** the overview is showing the earliest year that has data
- **THEN** no prior-year notice is rendered

##### Example: which years are listed

| Year viewed | Unpaid by year (positive amounts only) | Notice lines |
| ----------- | -------------------------------------- | ------------ |
| 2027 | 2026: 60,646 + 812 | 2026 — 2 members — 61,458 |
| 2028 | 2027: none; 2026: 812 | 2026 — 1 member — 812 |
| 2026 | (no earlier year) | none |

### Requirement: Show profit and loss stays readable on narrow screens

Below 900px viewport width the show profit-and-loss view SHALL render as a list instead of a six-column table. Each list row SHALL show the show name, its performance date and series (or 科目 for non-performance ledgers), the net amount at the right edge, and the income and cost on a secondary line, and the whole row SHALL link to that show's finance page. The list SHALL offer links to sort by date, net, income, and cost, and SHALL keep the series filter. The list SHALL NOT require horizontal scrolling to read the net amount. At 900px and above the view SHALL remain a table.

#### Scenario: Net amount visible on a phone

- **WHEN** user opens the show finance list at 375px viewport width
- **THEN** every row shows its net amount without horizontal scrolling and the document scroll width equals the viewport width

#### Scenario: Desktop keeps the table

- **WHEN** user opens the show finance list at 1280px viewport width
- **THEN** the six-column table is shown and the list is not

### Requirement: Finance overview shows a short show list

The show profit-and-loss section on the finance overview SHALL list at most 5 rows, taken from the top of the currently selected sort order and series filter, followed by a link to the full show finance list that states how many rows exist in total. The totals line on the overview SHALL remain the total of all rows for the year and filter, not only the listed rows. The full show finance list SHALL continue to show every row.

#### Scenario: More shows than the limit

- **WHEN** the selected year has 24 rows in the show profit-and-loss data
- **THEN** the overview lists 5 rows, shows a link reading that there are 24 in total, and the totals line equals the sum of all 24 rows

#### Scenario: Fewer shows than the limit

- **WHEN** the selected year has 3 rows
- **THEN** the overview lists all 3 rows

### Requirement: Finance overview avoids duplicated blocks

The finance overview SHALL present the paid-membership monthly figures table collapsed by default behind a disclosure control, with the chart always visible. The finance overview SHALL NOT render a separate link card to the pending inbox at the bottom of the page, because the finance tabs already show the pending inbox and its count.

#### Scenario: Membership table collapsed

- **WHEN** user opens the finance overview
- **THEN** the paid-membership chart is visible and the monthly figures table is hidden until the user opens the disclosure control

#### Scenario: No duplicate pending card

- **WHEN** user opens the finance overview while 31 Oen lines are pending
- **THEN** the pending count appears on the 待確認 tab and no separate pending card appears below the show list

### Requirement: Member tile shows the last recorded payout

Each member tile on the finance overview SHALL show the date of that member's most recent recorded payout, taken from the member's latest settlement with a positive amount (the settlement's payout date, regardless of which distribution year it was booked for). Negative correction settlements SHALL NOT count as payouts. A date in the current Taipei calendar year SHALL be shown as month and day; a date in another year SHALL include the year. When a member has no positive settlement the tile SHALL state that there is no payout record. The member tile SHALL NOT show a predicted next payout date.

#### Scenario: Member with payouts

- **WHEN** 柏文 has positive settlements dated 2026-10-16 and 2026-11-10 and today is 2026-11-12
- **THEN** 柏文's tile shows 上次出款 11/10 and no future payout date

#### Scenario: Member without payouts

- **WHEN** 傑哥 has no settlements
- **THEN** 傑哥's tile shows that there is no payout record

#### Scenario: Correction rows are ignored

- **WHEN** a member's latest settlement is a negative correction dated 2026-11-20 and the latest positive settlement is dated 2026-11-10
- **THEN** the tile shows 上次出款 11/10
