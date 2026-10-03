# line-group-capture Specification

## Purpose

Captures every message in the troupe's LINE group as it happens, because LINE offers no history API, and turns explicit slash (`/`) and hash (`#`) commands into todos and ideas without any language-model call.

## Requirements

### Requirement: Group message capture

The webhook SHALL verify the LINE signature and SHALL store every text message event from the registered group with its LINE message id, group id, author `userId`, timestamp, text, mention list, and quoted message id when present. Storage SHALL be idempotent on the LINE message id. Events from groups other than the registered group SHALL be ignored. The webhook SHALL respond 200 within LINE's timeout even when downstream work fails, and failures SHALL be logged.

#### Scenario: Ordinary chat message

- **WHEN** a member sends "週六誰可以去搬道具" in the group
- **THEN** one row with that text and the member's `userId` exists in the captured messages store and no reply is sent

#### Scenario: Redelivered event

- **WHEN** LINE delivers the same message event twice
- **THEN** only one stored row exists for that message id

#### Scenario: Invalid signature

- **WHEN** a request arrives with an invalid `x-line-signature`
- **THEN** the webhook responds 401 and stores nothing


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
### Requirement: Ordinary chat retention

Captured messages that did not produce a todo or idea and are not referenced by any todo or idea SHALL be deleted once they are older than 14 days. Command messages and referenced messages SHALL be kept permanently. A daily job at 03:30 Asia/Taipei SHALL perform the purge through a database function that refuses any retention window shorter than 14 days and only deletes from the captured messages table.

##### Example: purge decision on 2026-10-20

| Message | Sent | Referenced by todo/idea | Kept |
| ------- | ---- | ----------------------- | ---- |
| 「週六誰可以去搬道具」 | 2026-10-01 | no | deleted |
| 「週六誰可以去搬道具」 | 2026-10-10 | no | kept (within 14 days) |
| `/買膠帶` | 2026-09-01 | yes (todo source) | kept |
| 「最後一段讓觀眾投票」 quoted by `#` | 2026-09-01 | yes (idea source) | kept |

#### Scenario: Window too short

- **WHEN** the purge function is called with a 3-day window
- **THEN** it raises an error and deletes nothing

#### Scenario: Quote of an expired message

- **WHEN** a member replies with `#` to a 20-day-old ordinary message that has been purged
- **THEN** no idea is created and the bot replies that the quoted message cannot be found


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
### Requirement: Slash command todo creation

A message whose trimmed text starts with half-width `/` or full-width `／` followed by non-empty text SHALL immediately create a todo with source `command`. The todo title SHALL be the text after the slash with mention text removed. Mentioned users SHALL become assignees; with no mention the todo SHALL be unassigned. The bot SHALL send a reply message (not a push) confirming title and assignees. A slash that is not the first character SHALL NOT trigger.

##### Example: parsing

| Message | Creates todo | Title | Assignee |
| ------- | ------------ | ----- | -------- |
| `/訂 10/20 的場地 @柏文` | yes | 訂 10/20 的場地 | 柏文 |
| `／買膠帶` | yes | 買膠帶 | unassigned |
| `明天 1/20 開會` | no | – | – |
| `https://example.com/a` | no | – | – |
| `/` (not a quote reply) | no (usage reply) | – | – |

#### Scenario: Command with mention

- **WHEN** a member sends `/訂 10/20 的場地 @柏文`
- **THEN** a todo "訂 10/20 的場地" assigned to 柏文 exists and the bot replies confirming it


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
### Requirement: Hash command idea capture

A message whose trimmed text starts with half-width `#` or full-width `＃` followed by non-empty text SHALL immediately create an idea with the text after the hash, the author, the time, a link to the captured message, and no show. The bot SHALL reply 「已存進靈感庫，要歸到哪一場？」 with the quick-reply show buttons when an upcoming performance exists, otherwise 「已存進靈感庫」 without buttons. A `#` that is not the first character SHALL NOT trigger.

##### Example: parsing

| Message | Creates idea | Idea text |
| ------- | ------------ | --------- |
| `#讓觀眾投票決定結局` | yes | 讓觀眾投票決定結局 |
| `＃即興劇加計時器` | yes | 即興劇加計時器 |
| `今天 #1 的組合很好笑` | no | – |
| `#` (not a quote reply) | no (usage reply) | – |

#### Scenario: Save an idea

- **WHEN** a member sends `#讓觀眾投票決定結局`
- **THEN** an unassigned idea with that text exists and the bot replies with the confirmation and show buttons


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
### Requirement: Quote-reply commands

When a member uses LINE's reply feature on an earlier group message and sends a bare `/`, `／`, `#`, or `＃`, the system SHALL look up the quoted message among captured messages: a bare slash SHALL create a todo titled with the quoted text, and a bare hash SHALL create an idea with the quoted text whose author is the quoted message's author. The bot SHALL reply confirming. If the event carries no quoted message id, the bot SHALL reply with the usage hint and create nothing. If the quoted message is not in the store (sent before the bot joined, or purged after 14 days), the bot SHALL create nothing and reply that the quoted message cannot be found, suggesting `#內容` or `/內容` instead.

#### Scenario: Save someone else's idea

- **WHEN** 巧達 replies to 柏文's message "最後一段讓觀眾投票" with `#`
- **THEN** an idea "最後一段讓觀眾投票" credited to 柏文 exists and the bot confirms

#### Scenario: Quoted message not captured

- **WHEN** a member replies with `#` to a message sent before the bot joined
- **THEN** no idea is created and the bot replies that the quoted message cannot be found


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
### Requirement: Command usage reply

A message consisting only of `/`, `／`, `#`, or `＃` that is not a quote reply SHALL NOT create anything; the bot SHALL reply with a one-line hint describing both commands.

#### Scenario: Bare slash

- **WHEN** a member sends `/` without quoting a message
- **THEN** nothing is created and the bot replies with the usage hint

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
### Requirement: Quick-reply show buttons on confirmations

When the bot confirms a newly created idea (`#` command, including quote-reply) or todo (`/` command, including quote-reply), the confirmation reply SHALL carry quick-reply buttons derived from the pickable show list: the next show, then the following upcoming performances, at most 3 show buttons, plus a 4th button 「先放著」. Each show button SHALL be a postback action whose data is `v=1&t=<idea|todo>&id=<uuid>&show=<uuid>`, with 「先放著」 using `show=none`; the label SHALL be the show name with a leading 「看我笑話 」 removed and cut to 20 characters. When there is no upcoming performance the reply SHALL be plain text without buttons. Ledger rows SHALL never be offered. Replies remain reply-token replies, never push.

#### Scenario: Idea confirmation with buttons

- **WHEN** 柏文 sends `#讓觀眾投票決定結局` while 10 月號 (10/24) and 11 月號 (11/21) are the upcoming performances
- **THEN** the bot replies 「已存進靈感庫，要歸到哪一場？」 with buttons 「10 月號」「11 月號」「先放著」

##### Example: button composition

| Upcoming performances | Buttons |
| --------------------- | ------- |
| none | no quick reply |
| 10 月號 | 10 月號, 先放著 |
| 10 月號, 11 月號, 12 月號, 《直球》 | 10 月號, 11 月號, 12 月號, 先放著 |

#### Scenario: Todo confirmation with buttons

- **WHEN** a member sends `/買膠帶 @柏文`
- **THEN** the bot replies 「已建立待辦：買膠帶（柏文）」 with the same show buttons


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
### Requirement: Postback assigns the idea or todo to a show

The webhook SHALL handle `postback` events from the registered group. For data `v=1&t=idea&id=<uuid>&show=<uuid>` it SHALL set that idea's `show_id`; for `t=todo` it SHALL set that todo's `show_id`; then it SHALL reply 「已歸到「{show name}」」. For `show=none` it SHALL write nothing and reply 「好，先放在靈感庫」 (or 「好，先不掛演出」 for a todo). If the idea or todo no longer exists it SHALL reply 「這則已經不在了」. Postback data that is malformed or not version 1 SHALL be logged and ignored without a reply. Postback events SHALL NOT be stored in the captured messages table. If the group postback event carries no reply token, the write SHALL still happen and the reply SHALL be skipped.

#### Scenario: Attach to October

- **WHEN** a member taps 「10 月號」 under the idea confirmation
- **THEN** that idea's show becomes 10 月號 and the bot replies 「已歸到「看我笑話 10 月號」」

#### Scenario: Leave it

- **WHEN** a member taps 「先放著」
- **THEN** nothing is written and the bot replies 「好，先放在靈感庫」

#### Scenario: Stale button

- **WHEN** a member taps a button whose idea was deleted on the web
- **THEN** nothing is written and the bot replies 「這則已經不在了」

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