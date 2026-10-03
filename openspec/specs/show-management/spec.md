# show-management Specification

## Purpose

TBD - created by archiving change 'build-platform'. Update Purpose after archive.

## Requirements

### Requirement: Show list shared across pages

The system SHALL maintain a single `shows` table as the source for every page. Each show SHALL have name, type (`monthly`, `special`, or `other`), kind (`performance` or `ledger`), optional performance date, and status (`active` or `archived`). Finance pages SHALL read the full list. Planning pages (todos, ideas, show pages) and LINE replies SHALL read only `performance` rows through the pickable show list rule.

#### Scenario: Finance sees all, planning sees performances

- **WHEN** the table holds 22 `performance` rows and 7 `ledger` rows
- **THEN** the transactions page selector lists 29 and the todo form's show picker lists only the 22 performances


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
### Requirement: Pre-loaded default shows

The system SHALL pre-populate the show list with the following 14 shows:

1. 會員與其他收支
2. 周邊商品收支
3. 共同基金支出
4. 看我笑話第 2 季 Opening Party
5. 看我笑話 4 月號
6. 看我笑話 5 月號
7. 看我笑話 6 月號
8. 看我笑話 7 月號
9. 看我笑話 8 月號
10. 看我笑話 9 月號
11. 看我笑話 10 月號
12. 看我笑話 11 月號
13. 看我笑話 12 月號
14. 看我笑話第 2 季 After Party

#### Scenario: Default shows available on first use

- **WHEN** user opens the platform for the first time
- **THEN** all 14 default shows are available in the show dropdown

#### Scenario: Virtual show "共同基金支出" is selectable

- **WHEN** user opens the show dropdown on the transaction page
- **THEN** "共同基金支出" is listed as a selectable option


<!-- @trace
source: tax-reserve-and-fund-payment
updated: 2026-04-24
code:
  - RAW DATA/20260410_看我笑話｜第 2 季 5 月號_活動報名狀態_142筆.xlsx
  - RAW DATA/20260412_應援訂單_85筆.csv
  - js/api.js
  - js/analytics.js
  - RAW DATA/20260410_看我笑話｜第 2 季 4 月號_活動報名狀態_148筆.xlsx
  - js/import.js
  - RAW DATA/20260410_2026 好竹弋漫才專場 《直球》_活動報名狀態_75筆.xlsx
  - js/transaction.js
  - .DS_Store
  - js/shared.js
  - gas/Code.gs
  - index.html
  - RAW DATA/20260410_2026 支薪好友喜劇專場 《向上管理》_活動報名狀態_273筆.xlsx
  - RAW DATA/20260412_應援撥款明細_444筆.xlsx
  - css/style.css
  - RAW DATA/20260412_應援票券訂單_515筆.csv
  - import.html
-->

---
### Requirement: Add new show

The system SHALL allow admin and members to add a new show by entering a name, choosing a type, and optionally a performance date. A `monthly` show SHALL require a performance date. The new show SHALL appear in the dropdown on all pages immediately after creation.

#### Scenario: Create a new show

- **WHEN** user selects 「新增一檔演出」, enters 「第 2 季 10 月號」, type `monthly`, date 2026-10-24
- **THEN** the show is stored in Supabase and appears in all show dropdowns

#### Scenario: Monthly show without date

- **WHEN** user submits a `monthly` show without a performance date
- **THEN** the form shows an error and no show is created


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
### Requirement: Member selection

The system SHALL provide a member dropdown with the following 8 default members: 傑哥, 柏文, 巧達, 芭樂, 又又, 兔子, 大弋, 竹節蟲. The dropdown SHALL also include an "其他" option that allows free-text input for non-default members.

#### Scenario: Select a default member

- **WHEN** user opens the member dropdown
- **THEN** all 8 default members are listed as selectable options

#### Scenario: Enter a non-default member

- **WHEN** user selects "其他" from the member dropdown
- **THEN** a text input field appears allowing the user to type a custom name

<!-- @trace
source: build-platform
updated: 2026-03-17
code:
  - gas/Code.gs
  - .DS_Store
  - CLAUDE.md
-->

---
### Requirement: Persist show selection across page navigation

The system SHALL store the user's selected show in sessionStorage when a show is selected, and restore it automatically when any page loads.

#### Scenario: User navigates away and returns

- **WHEN** the user selects a show, navigates to another page, and returns
- **THEN** the previously selected show SHALL be automatically restored and its data loaded

#### Scenario: Stored show no longer exists

- **WHEN** the stored show name does not match any available option
- **THEN** the system SHALL silently ignore the stored value and show the default empty state

#### Scenario: Session ends

- **WHEN** the browser tab is closed
- **THEN** the stored selection SHALL be cleared (sessionStorage behavior)

<!-- @trace
source: persist-show-selection
updated: 2026-03-17
code:
  - .DS_Store
  - js/shared.js
-->

---
### Requirement: Show kind

Every row in the `shows` table SHALL carry a `kind` of `performance` or `ledger`, not null, defaulting to `performance`. `ledger` rows are finance-only buckets (membership, channel, merchandise, common fund) and SHALL never be offered on planning pages (todos, ideas, show pages) or in LINE replies; `performance` rows SHALL be offered on both planning and finance pages. Shows created through the platform UI SHALL always be `performance`; `ledger` rows SHALL only be created by migration or database maintenance.

#### Scenario: Migration classifies existing rows

- **WHEN** migration 0009 runs on the production data of 2026-10-03
- **THEN** exactly these 7 rows become `ledger`: 看我笑話會員, 會員與其他收支, 共同基金支出, 看我笑話頻道, 看我笑話商演 / 業配合作, 看我笑話小卡盲包 大阪和服篇, 看我笑話小卡盲包 現代問題研究中心篇; the other 22 rows stay `performance`

#### Scenario: New show from the UI

- **WHEN** a member creates 「第 3 季 1 月號」 from the shows page
- **THEN** the stored row has kind `performance`


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
### Requirement: Archive a show

A member SHALL be able to mark a performance as archived (已演出／歸檔) and back to active from the show's edit panel. Archived shows SHALL leave the 「接下來」 list and the next-show shortcuts but SHALL remain visible under 「更多」 and on finance pages, and their todos and ideas SHALL stay attached.

#### Scenario: Archive a past month

- **WHEN** a member archives 「看我笑話 6 月號」
- **THEN** it no longer appears under 「接下來」 or as a quick-reply button, still appears under 「更多…」 and in the finance project selector, and its transactions are unchanged

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