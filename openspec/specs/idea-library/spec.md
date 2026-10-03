# idea-library Specification

## Purpose

Keeps the troupe's show ideas from the LINE group in one place where they can be reviewed later and attached to a specific show.

## Requirements

### Requirement: Idea library page

The platform SHALL provide an ideas page with three views: 「還沒歸位」 (non-archived ideas without a show, newest first, with the count in the chip), 「全部」 (every non-archived idea with its show name), and 「已封存」. Each idea SHALL show its text, author, time, and whether it came from LINE. Admin and members SHALL access it; `finance_partner` SHALL NOT. Explanatory copy about the `#` command SHALL appear only in the empty state of 「還沒歸位」, not in the page header.

#### Scenario: View unsorted ideas

- **WHEN** a member opens the ideas page
- **THEN** the 「還沒歸位」 view is selected and lists every unassigned, non-archived idea with author and time

#### Scenario: Empty inbox

- **WHEN** there are no unassigned ideas
- **THEN** the empty state explains that 「#內容」 in the group saves an idea here


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
### Requirement: Assign idea to a show

Each idea card in 「還沒歸位」 and 「全部」 SHALL offer a one-tap button 「→ {next show name}」 that attaches the idea to the next upcoming performance, and an 「其他…」 button that opens the shared show picker. When there is no upcoming performance, the one-tap button SHALL be hidden and only 「其他…」 remains. A member SHALL be able to move an idea to another show or back to no show through the picker, and to edit or archive an idea from its edit panel opened by tapping the card text; archived ideas SHALL be restorable from 「已封存」. An idea that leaves the current view (for example, assigned while viewing 「還沒歸位」) SHALL disappear from the list immediately. Ledger rows SHALL never be offered.

#### Scenario: Assign to November show

- **WHEN** a member taps 「其他…」 on 「讓觀眾投票決定結局」 and picks 「第 2 季 11 月號」
- **THEN** the idea leaves 「還沒歸位」 and appears on that show's page

#### Scenario: One tap to the next show

- **WHEN** 10 月號 is the next show and a member taps 「→ 10 月號」 on an idea
- **THEN** the idea is attached to 10 月號 without any further choice

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