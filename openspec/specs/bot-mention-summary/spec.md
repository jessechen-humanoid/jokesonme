# bot-mention-summary Specification

## Purpose

Lets anyone in the LINE group ask the bot who still has to do what, by mentioning it, using only free reply messages; the platform sends no push messages at all.

## Requirements

### Requirement: Mention summary reply

When a text message in the registered group mentions the bot and is not a `/` or `#` command, the bot SHALL reply (reply API, not push) with the open todos grouped by assignee, each line showing the todo title and its due date in `M/D（週）前` form, followed by a 「未認領」 group and a LIFF link to the todo page. If the message also mentions other people, the reply SHALL list only those people's todos. If there are no open todos, the reply SHALL say so. Each person SHALL show at most 5 todos, nearest due date first, with a 「…還有 N 件」 line for the rest.

##### Example: reply body

| Open todos | Reply contains |
| ---------- | -------------- |
| 大弋: Rundown 製作 due 2026-10-19; unassigned: 公關票確認 due 2026-10-21 | 「大弋」 then 「・Rundown 製作 10/19（一）前」, 「未認領」 then 「・公關票確認 10/21（三）前」 |
| none | 「目前沒有未完成的待辦」 |

#### Scenario: Ask the bot

- **WHEN** a member sends 「@傑瓜 這週誰要做什麼」
- **THEN** the bot replies with every member's open todos and the unclaimed ones, and no push message is sent

#### Scenario: Ask about one person

- **WHEN** a member sends 「@傑瓜 @柏文」
- **THEN** the reply lists only 柏文's open todos


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
### Requirement: No push messages

The bot SHALL NOT send push, multicast, or broadcast messages; every bot message SHALL be a reply to a group message, so monthly LINE message quota is never consumed.

#### Scenario: Quota untouched

- **WHEN** the platform has run for a month with members using commands and mentions
- **THEN** LINE's quota consumption endpoint reports 0 messages used by the bot

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