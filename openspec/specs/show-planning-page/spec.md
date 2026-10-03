# show-planning-page Specification

## Purpose

Gives each monthly show one page that gathers its ideas, todos, and working documents so the troupe can see the month's plan at a glance.

## Requirements

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
### Requirement: Show document links

The planning page SHALL hold three editable link fields: rundown, presentation, and survey. Empty fields SHALL show an add action; filled fields SHALL open the link in a new tab.

#### Scenario: Add rundown link

- **WHEN** a member pastes a Google Docs URL into the rundown field
- **THEN** the planning page shows a rundown link that opens that URL

<!-- @trace
source: jokesonme-platform-v2
updated: 2026-10-03
code:
  - platform/components/show-picker.tsx
  - platform/app/pending/page.tsx
  - platform/scripts/migrate-from-sheet.mts
  - platform/supabase/migrations/0008_monthly_template.sql
  - platform/components/tx-board.tsx
  - platform/lib/finance/calc.ts
  - platform/components/finance-head.tsx
  - platform/supabase/migrations/0007_revoke_truncate.sql
  - platform/app/(app)/ideas/actions.ts
  - platform/app/api/finance/export/route.ts
  - platform/lib/members.ts
  - platform/app/(app)/finance/analytics/page.tsx
  - platform/app/(app)/finance/import/legacy-import.tsx
  - platform/app/api/line/webhook/route.ts
  - platform/public/next.svg
  - platform/public/window.svg
  - platform/app/(app)/ideas/page.tsx
  - platform/app/api/auth/liff/route.ts
  - platform/lib/finance/reserve.ts
  - platform/wrangler.toml
  - platform/app/(app)/admin/template/page.tsx
  - platform/app/(app)/admin/users/page.tsx
  - platform/app/(app)/shows/[id]/page.tsx
  - platform/app/(app)/me/page.tsx
  - platform/app/globals.css
  - platform/supabase/migrations/0003_app_settings.sql
  - platform/app/(app)/todos/page.tsx
  - platform/supabase/migrations/0005_users_login.sql
  - platform/app/(app)/finance/import/page.tsx
  - platform/lib/line/store.ts
  - platform/eslint.config.mjs
  - platform/app/login/page.tsx
  - platform/supabase/migrations/0001_audit.sql
  - platform/supabase/migrations/0002_core.sql
  - platform/lib/shows.ts
  - platform/tsconfig.json
  - platform/open-next.config.ts
  - platform/lib/auth/users.ts
  - platform/app/(app)/admin/template/actions.ts
  - platform/app/api/auth/login/route.ts
  - platform/app/api/auth/logout/route.ts
  - platform/lib/auth/line-login.ts
  - platform/components/bottom-nav.tsx
  - platform/scripts/legacy-oracle.mts
  - platform/supabase/migrations/0004_message_retention.sql
  - platform/app/liff/[[...path]]/page.tsx
  - platform/components/ledger-sheet.tsx
  - platform/components/idea-list.tsx
  - platform/app/(app)/shows/page.tsx
  - platform/lib/audit.ts
  - platform/app/favicon.ico
  - js/api.js
  - platform/next.config.ts
  - platform/lib/line/signature.ts
  - platform/lib/line/webhook.ts
  - platform/public/file.svg
  - platform/lib/auth/access.ts
  - platform/CLAUDE.md
  - platform/app/(app)/admin/users/actions.ts
  - platform/app/(app)/todos/actions.ts
  - platform/lib/auth/session.ts
  - platform/lib/ideas.ts
  - platform/lib/todos.ts
  - platform/scripts/db-check.sql
  - platform/public/vercel.svg
  - platform/public/globe.svg
  - platform/scripts/test-db.sh
  - platform/scripts/db-migrate.sh
  - platform/lib/templates.ts
  - platform/scripts/reconcile.mts
  - platform/app/api/cron/purge-messages/route.ts
  - platform/app/api/auth/callback/line/route.ts
  - platform/lib/cron/auth.ts
  - platform/worker.ts
  - platform/lib/finance/reconcile.ts
  - platform/package.json
  - platform/lib/line/summary.ts
  - platform/public/legacy/import.css
  - platform/app/(app)/finance/page.tsx
  - platform/app/(app)/layout.tsx
  - platform/app/api/finance/import/route.ts
  - platform/app/(app)/finance/actions.ts
  - platform/components/avatar.tsx
  - platform/lib/line/api.ts
  - platform/public/legacy/import.js
  - platform/lib/auth/current.ts
  - platform/components/todo-board.tsx
  - platform/app/(app)/shows/actions.ts
  - platform/scripts/rehearse-migration.sh
  - platform/AGENTS.md
  - platform/app/page.tsx
  - platform/app/liff/[[...path]]/liff-login.tsx
  - platform/supabase/migrations/0006_finance.sql
  - platform/README.md
  - platform/lib/dates.ts
  - platform/scripts/check-tax-reserves.mts
  - platform/lib/line/commands.ts
  - platform/lib/finance/sheet.ts
  - platform/public/legacy/import-shim.js
  - platform/components/show-editor.tsx
  - platform/lib/supabase.ts
  - platform/app/layout.tsx
  - platform/app/(app)/finance/transactions/page.tsx
  - platform/lib/finance/data.ts
tests:
  - platform/lib/finance/reserve.test.ts
  - platform/lib/line/webhook.test.ts
  - platform/lib/auth/session.test.ts
  - platform/lib/templates.test.ts
  - platform/supabase/test/audit_core.test.sql
  - platform/lib/finance/calc.test.ts
  - platform/lib/line/commands.test.ts
  - platform/lib/auth/access.test.ts
  - platform/supabase/test/finance.test.sql
  - platform/supabase/test/retention.test.sql
  - platform/lib/dates.test.ts
  - platform/lib/todos.test.ts
  - platform/supabase/test/local-shim.sql
  - platform/lib/line/summary.test.ts
-->

---
### Requirement: Shows page emphasises only the next show

On the shows page, the next performance SHALL be shown as a full card with its date, days remaining, and its number of open todos; the other upcoming performances SHALL be compact one-line rows; the 「已演出／其他」 group SHALL be collapsed by default behind a toggle showing its count.

#### Scenario: Default shows page

- **WHEN** a member opens the shows page while 10 月號 is next and 11 月號, 12 月號 follow
- **THEN** 10 月號 appears as a full card with 「還有 14 天」 and its open todo count, 11 月號 and 12 月號 are single lines, and past or undated shows are hidden until 「已演出／其他（N）」 is tapped

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