# show-todo-templates Specification

## Purpose

Generates the recurring preparation todos for monthly shows with real due dates, replacing the unused static checklist.

## Requirements

### Requirement: Monthly show template

The system SHALL hold one template for show type `monthly`, each item having a title, default assignee (optional), and an offset in days relative to the performance date (negative = before). Only admin SHALL edit the template. The initial template SHALL be drafted from the legacy 23 checklist items and approved by Jesse before first use.

#### Scenario: Admin edits template

- **WHEN** the admin changes an item's offset from -14 to -10
- **THEN** shows created afterwards use -10 and existing shows' todos are unchanged


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
### Requirement: Template-generated due dates

Creating a show of type `monthly` with a performance date SHALL create one todo per template item, linked to the show, with source `template`, the item's default assignee, and due date = performance date + offset. Changing the show's performance date SHALL shift the due dates of that show's not-done template todos by the same number of days.

##### Example: due date calculation

| Performance date | Offset | Due date |
| ---------------- | ------ | -------- |
| 2026-10-24 | -21 | 2026-10-03 |
| 2026-10-24 | -1 | 2026-10-23 |
| 2026-10-24 | +7 | 2026-10-31 |

#### Scenario: Create monthly show

- **WHEN** an admin creates 「第 2 季 10 月號」 with type `monthly` and date 2026-10-24
- **THEN** template todos linked to that show exist with due dates computed from 2026-10-24


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
### Requirement: No templates for special shows

Shows of type `special` or `other` SHALL NOT generate template todos. Their finance records SHALL behave like any other show.

#### Scenario: Create special show

- **WHEN** a show of type `special` is created
- **THEN** no template todos are created and the show is selectable on finance pages

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