# show-picker Specification

## Purpose

Defines the one shared rule for offering a show to attach something to: the next upcoming performance first, then the other dated upcoming performances, with everything else behind a "more" step. The web picker and the LINE quick-reply buttons both derive from this rule so they never drift apart.

## Requirements

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


<!-- @trace
source: show-centric-planning
updated: 2026-10-03
code:
  - platform/app/(app)/finance/import/page.tsx
  - platform/supabase/migrations/0009_show_kind.sql
  - platform/lib/events.ts
  - platform/lib/supabase.ts
  - platform/components/idea-list.tsx
  - platform/components/bottom-nav.tsx
  - platform/app/globals.css
  - platform/components/todo-board.tsx
  - platform/app/(app)/ideas/page.tsx
  - platform/supabase/migrations/0010_internal_events.sql
  - platform/app/(app)/calendar/page.tsx
  - platform/components/add-menu.tsx
  - platform/lib/line/commands.ts
  - platform/lib/calendar/feed.ts
  - platform/app/(app)/shows/actions.ts
  - platform/lib/line/summary.ts
  - platform/app/(app)/shows/page.tsx
  - platform/app/(app)/calendar/actions.ts
  - platform/lib/calendar/ics.ts
  - platform/lib/dates.ts
  - platform/eslint.config.mjs
  - platform/components/show-editor.tsx
  - platform/components/finance-show-select.tsx
  - platform/app/(app)/admin/template/page.tsx
  - platform/lib/calendar/fixtures/show-calendar-20261003.ics
  - platform/lib/line/quick-reply.ts
  - platform/wrangler.toml
  - platform/app/api/line/webhook/route.ts
  - platform/scripts/oneoff-show-dates-20261003.mts
  - platform/app/(app)/shows/[id]/page.tsx
  - platform/app/(app)/finance/transactions/page.tsx
  - platform/components/show-picker.tsx
  - platform/app/(app)/todos/page.tsx
  - platform/lib/calendar/days.ts
  - platform/lib/line/api.ts
  - platform/lib/line/store.ts
  - platform/lib/shows.ts
  - platform/lib/line/webhook.ts
tests:
  - platform/lib/line/commands.test.ts
  - platform/lib/calendar/days.test.ts
  - platform/lib/events.test.ts
  - platform/lib/calendar/feed.test.ts
  - platform/lib/line/webhook.test.ts
  - platform/supabase/test/internal_events.test.sql
  - platform/lib/line/quick-reply.test.ts
  - platform/lib/line/summary.test.ts
  - platform/supabase/test/show_kind.test.sql
  - platform/lib/calendar/ics.test.ts
  - platform/lib/shows.test.ts
-->

---
### Requirement: Web show picker control

The planning pages SHALL offer shows through one shared picker control instead of a full dropdown. The control SHALL show `next` first labelled 「下一場」, then the remaining `upcoming` shows (at most 5 chips), then a 「更多…」 step that reveals the `more` list, and an option for no show where the field is optional. Selecting a chip SHALL set the value immediately; the control SHALL be usable at 375px width without horizontal page scroll.

#### Scenario: Pick the next show in one tap

- **WHEN** a member opens the picker while 10 月號 is the next show
- **THEN** the first chip reads 「下一場」 with 10 月號 and one tap selects it

#### Scenario: Reach an old show

- **WHEN** a member taps 「更多…」
- **THEN** past and undated performances are listed and selectable, still without any ledger row


<!-- @trace
source: show-centric-planning
updated: 2026-10-03
code:
  - platform/app/(app)/finance/import/page.tsx
  - platform/supabase/migrations/0009_show_kind.sql
  - platform/lib/events.ts
  - platform/lib/supabase.ts
  - platform/components/idea-list.tsx
  - platform/components/bottom-nav.tsx
  - platform/app/globals.css
  - platform/components/todo-board.tsx
  - platform/app/(app)/ideas/page.tsx
  - platform/supabase/migrations/0010_internal_events.sql
  - platform/app/(app)/calendar/page.tsx
  - platform/components/add-menu.tsx
  - platform/lib/line/commands.ts
  - platform/lib/calendar/feed.ts
  - platform/app/(app)/shows/actions.ts
  - platform/lib/line/summary.ts
  - platform/app/(app)/shows/page.tsx
  - platform/app/(app)/calendar/actions.ts
  - platform/lib/calendar/ics.ts
  - platform/lib/dates.ts
  - platform/eslint.config.mjs
  - platform/components/show-editor.tsx
  - platform/components/finance-show-select.tsx
  - platform/app/(app)/admin/template/page.tsx
  - platform/lib/calendar/fixtures/show-calendar-20261003.ics
  - platform/lib/line/quick-reply.ts
  - platform/wrangler.toml
  - platform/app/api/line/webhook/route.ts
  - platform/scripts/oneoff-show-dates-20261003.mts
  - platform/app/(app)/shows/[id]/page.tsx
  - platform/app/(app)/finance/transactions/page.tsx
  - platform/components/show-picker.tsx
  - platform/app/(app)/todos/page.tsx
  - platform/lib/calendar/days.ts
  - platform/lib/line/api.ts
  - platform/lib/line/store.ts
  - platform/lib/shows.ts
  - platform/lib/line/webhook.ts
tests:
  - platform/lib/line/commands.test.ts
  - platform/lib/calendar/days.test.ts
  - platform/lib/events.test.ts
  - platform/lib/calendar/feed.test.ts
  - platform/lib/line/webhook.test.ts
  - platform/supabase/test/internal_events.test.sql
  - platform/lib/line/quick-reply.test.ts
  - platform/lib/line/summary.test.ts
  - platform/supabase/test/show_kind.test.sql
  - platform/lib/calendar/ics.test.ts
  - platform/lib/shows.test.ts
-->

---
### Requirement: Finance pages keep the full list

Finance pages SHALL continue to offer every show, including kind `ledger`, through their own selector; the pickable show list rule SHALL NOT apply to finance pages.

#### Scenario: Ledger row selectable in transactions

- **WHEN** a member opens the project selector on the transactions page
- **THEN** 「共同基金支出」 is listed and selectable

<!-- @trace
source: show-centric-planning
updated: 2026-10-03
code:
  - platform/app/(app)/finance/import/page.tsx
  - platform/supabase/migrations/0009_show_kind.sql
  - platform/lib/events.ts
  - platform/lib/supabase.ts
  - platform/components/idea-list.tsx
  - platform/components/bottom-nav.tsx
  - platform/app/globals.css
  - platform/components/todo-board.tsx
  - platform/app/(app)/ideas/page.tsx
  - platform/supabase/migrations/0010_internal_events.sql
  - platform/app/(app)/calendar/page.tsx
  - platform/components/add-menu.tsx
  - platform/lib/line/commands.ts
  - platform/lib/calendar/feed.ts
  - platform/app/(app)/shows/actions.ts
  - platform/lib/line/summary.ts
  - platform/app/(app)/shows/page.tsx
  - platform/app/(app)/calendar/actions.ts
  - platform/lib/calendar/ics.ts
  - platform/lib/dates.ts
  - platform/eslint.config.mjs
  - platform/components/show-editor.tsx
  - platform/components/finance-show-select.tsx
  - platform/app/(app)/admin/template/page.tsx
  - platform/lib/calendar/fixtures/show-calendar-20261003.ics
  - platform/lib/line/quick-reply.ts
  - platform/wrangler.toml
  - platform/app/api/line/webhook/route.ts
  - platform/scripts/oneoff-show-dates-20261003.mts
  - platform/app/(app)/shows/[id]/page.tsx
  - platform/app/(app)/finance/transactions/page.tsx
  - platform/components/show-picker.tsx
  - platform/app/(app)/todos/page.tsx
  - platform/lib/calendar/days.ts
  - platform/lib/line/api.ts
  - platform/lib/line/store.ts
  - platform/lib/shows.ts
  - platform/lib/line/webhook.ts
tests:
  - platform/lib/line/commands.test.ts
  - platform/lib/calendar/days.test.ts
  - platform/lib/events.test.ts
  - platform/lib/calendar/feed.test.ts
  - platform/lib/line/webhook.test.ts
  - platform/supabase/test/internal_events.test.sql
  - platform/lib/line/quick-reply.test.ts
  - platform/lib/line/summary.test.ts
  - platform/supabase/test/show_kind.test.sql
  - platform/lib/calendar/ics.test.ts
  - platform/lib/shows.test.ts
-->