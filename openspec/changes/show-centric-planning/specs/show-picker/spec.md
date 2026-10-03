## Purpose

Defines the one shared rule for offering a show to attach something to: the next upcoming performance first, then the other dated upcoming performances, with everything else behind a "more" step. The web picker and the LINE quick-reply buttons both derive from this rule so they never drift apart.

## ADDED Requirements

### Requirement: Pickable show list

The system SHALL compute the pickable show list with one pure function from the full show list and today's date in Asia/Taipei. Only shows with kind `performance` and status `active` or `archived` as described below SHALL be considered; shows with kind `ledger` SHALL never appear. The result SHALL have three parts: `next` (the active performance with the earliest performance date on or after today, or none), `upcoming` (all active performances dated on or after today, ascending by date, including `next`), and `more` (every other performance: dated before today, undated, or archived; ordered by date descending with undated last). Every surface that offers a show to attach to SHALL use this function.

#### Scenario: Mixed list

- **WHEN** today is 2026-10-03 and the performances are 10 月號 (2026-10-24), 11 月號 (2026-11-21), 9 月號 (2026-09-26), 《直球》(undated, active), and 「看我笑話會員」(kind ledger)
- **THEN** `next` is 10 月號, `upcoming` is [10 月號, 11 月號], `more` is [9 月號, 《直球》], and 「看我笑話會員」 appears nowhere

##### Example: shapes

| Shows (kind performance unless noted) | next | upcoming | more |
| ------------------------------------- | ---- | -------- | ---- |
| all undated, active | none | [] | all, in name order |
| 10/24, 11/21, 9/26 past, one archived 8/22 | 10/24 | [10/24, 11/21] | [9/26, 8/22] |
| only ledger rows | none | [] | [] |

#### Scenario: No upcoming performance

- **WHEN** no active performance has a date on or after today
- **THEN** `next` is none and `upcoming` is empty, and surfaces that offer a "next show" shortcut hide that shortcut

### Requirement: Web show picker control

The planning pages SHALL offer shows through one shared picker control instead of a full dropdown. The control SHALL show `next` first labelled 「下一場」, then the remaining `upcoming` shows (at most 5 chips), then a 「更多…」 step that reveals the `more` list, and an option for no show where the field is optional. Selecting a chip SHALL set the value immediately; the control SHALL be usable at 375px width without horizontal page scroll.

#### Scenario: Pick the next show in one tap

- **WHEN** a member opens the picker while 10 月號 is the next show
- **THEN** the first chip reads 「下一場」 with 10 月號 and one tap selects it

#### Scenario: Reach an old show

- **WHEN** a member taps 「更多…」
- **THEN** past and undated performances are listed and selectable, still without any ledger row

### Requirement: Finance pages keep the full list

Finance pages SHALL continue to offer every show, including kind `ledger`, through their own selector; the pickable show list rule SHALL NOT apply to finance pages.

#### Scenario: Ledger row selectable in transactions

- **WHEN** a member opens the project selector on the transactions page
- **THEN** 「共同基金支出」 is listed and selectable
