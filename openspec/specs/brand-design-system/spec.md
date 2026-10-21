# brand-design-system Specification

## Purpose

TBD - created by archiving change 'brand-visual-redesign'. Update Purpose after archive.

## Requirements

### Requirement: Brand colour tokens

The system SHALL define the following colour tokens as CSS variables in `:root` and all UI chrome SHALL consume colours through these tokens. No other decorative colours SHALL be introduced. These tokens implement direction B1 「柿子紅品牌版」 chosen by Jesse on 2026-10-03: layout and components follow Jebby Dashboard (paper ground, large white cards, restrained type scale, segmented tabs) without the Jebby character, and persimmon replaces Jebby's lime. Earlier direction C (bright orange) is superseded.

- Page ground `--ground`: `#F6F2E8`; secondary ground `--ground-2`: `#EFE9DA`
- Card surface `--surface`: `#FFFFFF`; list-row surface `--surface-2`: `#FAF8F1`
- Text `--ink`: `#1E211B`, `--ink-2`: `#585E52`, `--ink-3`: `#8B9184`
- Lines `--line`: `#E5DFCF`, `--line-2`: `#F0EBDD`
- Persimmon `--brand`: `#E2673F`, deep `--brand-deep`: `#B84D2A`, tints `--brand-2`: `#F2B9A2`, `--brand-3`: `#FBE3D8`, `--brand-4`: `#FDF1EB`
- Shadow `--shadow`: `0 1px 2px rgba(31,34,28,.04), 0 10px 26px -14px rgba(31,34,28,.18)`

#### Scenario: Page ground is warm paper

- **WHEN** user opens any page of the new platform
- **THEN** the page `body` background is `#F6F2E8`

#### Scenario: Card renders on white surface

- **WHEN** user views a section card
- **THEN** the card background is `#FFFFFF` with `border-radius: 24px` and the `--shadow` shadow


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
### Requirement: Brand orange usage restriction

Persimmon (`--brand`) SHALL be used for exactly these purposes: the next-show highlight card on the shows page (one per page, white text), primary action buttons and the floating add button, the current item in navigation, unclaimed tags, checkbox outlines, and due-date emphasis (`--brand-deep` text). Page headers SHALL NOT use a persimmon background. Persimmon SHALL NOT be used as the background of section cards, list rows, tables, or body text.

#### Scenario: Page header is not persimmon

- **WHEN** user opens the todo page
- **THEN** the page header has no persimmon background and the section cards below it are `#FFFFFF`

#### Scenario: Next show card is persimmon

- **WHEN** user opens the shows page while an upcoming performance exists
- **THEN** only the next-show card uses the `#E2673F` background

#### Scenario: Due date emphasis

- **WHEN** a todo due within three days shows its due date
- **THEN** the label text colour is `#B84D2A`

---
### Requirement: Semantic colour tokens for financial state

The system SHALL define semantic colour tokens — and use ONLY these — for financial or state semantics:

- Positive / income / settled `--success`: `#4A7C59`
- Negative / expense / unsettled `--danger`: `#C24E36`
- Partial / warning `--warning`: `#C08A3E`

Each semantic colour SHALL have a corresponding background variant (`--success-bg`, `--danger-bg`, `--warning-bg`) at alpha 0.1 for status badges and highlighted rows. Semantic colours SHALL ONLY be applied to functional cues (amount signs, settlement status, warnings) and SHALL NOT be used decoratively. Every `var(--*)` colour reference emitted by JavaScript-generated markup SHALL resolve to a token defined in `:root`.

#### Scenario: Negative amount rendered in desaturated red

- **WHEN** a net amount is negative
- **THEN** the value is rendered with colour `#C24E36`

#### Scenario: Positive amount rendered in desaturated green

- **WHEN** a net amount is positive
- **THEN** the value is rendered with colour `#4A7C59`

#### Scenario: Settled badge colour resolves

- **WHEN** the import page renders a settled-status badge using `var(--success)`
- **THEN** the badge text renders in `#4A7C59` because `--success` is defined in `:root`


<!-- @trace
source: brand-visual-redesign
updated: 2026-07-10
code:
  - .agents/skills/spectra-apply/SKILL.md
  - checklist.html
  - css/style.css
  - analytics.html
  - .agents/skills/spectra-archive/SKILL.md
  - .agents/skills/spectra-commit/SKILL.md
  - .agents/skills/spectra-drift/SKILL.md
  - .agents/skills/spectra-propose/SKILL.md
  - import.html
  - CLAUDE.md
  - .agents/skills/spectra-audit/SKILL.md
  - js/transaction.js
  - forecast.html
  - .agents/skills/spectra-discuss/SKILL.md
  - .agents/skills/spectra-ask/SKILL.md
  - index.html
  - opentix.html
  - .agents/skills/spectra-debug/SKILL.md
  - .agents/skills/spectra-ingest/SKILL.md
  - js/import.js
  - OPTIMIZATION_PLAN.md
  - AGENTS.md
  - opentix-analytics.html
  - js/analytics.js
-->

---
### Requirement: Typography with loaded webfont

All production pages SHALL load the Noto Sans TC webfont (weights 400, 500, 700) from Google Fonts with `display=swap`, and the font stack SHALL be `-apple-system, BlinkMacSystemFont, "Noto Sans TC", "Segoe UI", sans-serif`.

#### Scenario: Webfont link present on every production page

- **WHEN** any of the seven production pages (index, checklist, analytics, forecast, import, opentix, opentix-analytics) is loaded
- **THEN** its `<head>` contains a `fonts.googleapis.com` stylesheet link requesting Noto Sans TC weights 400, 500, and 700

#### Scenario: Fallback when webfont unavailable

- **WHEN** the webfont fails to load
- **THEN** text renders with the system font fallback and all functionality remains usable


<!-- @trace
source: brand-visual-redesign
updated: 2026-07-10
code:
  - .agents/skills/spectra-apply/SKILL.md
  - checklist.html
  - css/style.css
  - analytics.html
  - .agents/skills/spectra-archive/SKILL.md
  - .agents/skills/spectra-commit/SKILL.md
  - .agents/skills/spectra-drift/SKILL.md
  - .agents/skills/spectra-propose/SKILL.md
  - import.html
  - CLAUDE.md
  - .agents/skills/spectra-audit/SKILL.md
  - js/transaction.js
  - forecast.html
  - .agents/skills/spectra-discuss/SKILL.md
  - .agents/skills/spectra-ask/SKILL.md
  - index.html
  - opentix.html
  - .agents/skills/spectra-debug/SKILL.md
  - .agents/skills/spectra-ingest/SKILL.md
  - js/import.js
  - OPTIMIZATION_PLAN.md
  - AGENTS.md
  - opentix-analytics.html
  - js/analytics.js
-->

---
### Requirement: Corner radius and surface styling

Section cards SHALL use `border-radius: 24px` with `--shadow`; list rows inside a section SHALL use `--surface-2`, a `1px solid var(--line-2)` border, `border-radius: 12px`, and no shadow; inputs and buttons SHALL use `border-radius: 12px`; segmented tabs SHALL use a 12px track with 9px items; bottom sheets SHALL use `border-radius: 24px` on their top corners. Navigation SHALL be a bottom tab bar below 900px viewport width and a left sidebar card at 900px and above.

#### Scenario: Todo row inside a section

- **WHEN** user views a todo row
- **THEN** it has `#FAF8F1` background, `border-radius: 12px`, a `1px solid #F0EBDD` border, and no box-shadow

#### Scenario: Desktop sidebar

- **WHEN** the viewport is 1280px wide
- **THEN** navigation renders as a left sidebar card and the bottom tab bar is not shown


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
### Requirement: Chart colour palette

Chart colours SHALL be defined in a single named constant (`CHART_COLORS`) in `js/analytics.js`, aligned with the semantic tokens. The income ramp SHALL be the six-step green scale `#4A7C59 #5E8F6C #749F80 #8BB095 #A3C1AB #BCD2C2` (dark to light) and the expense ramp SHALL be the six-step warm red scale `#C24E36 #CB6650 #D47D6A #DD9585 #E6ADA1 #EFC6BD` (dark to light). No chart segment SHALL use a colour outside these ramps and the neutral tokens.

#### Scenario: Income chart uses green ramp

- **WHEN** the analytics page renders an income breakdown chart
- **THEN** segment colours are drawn from the six-step green ramp in order from `#4A7C59`

#### Scenario: Expense chart uses warm red ramp

- **WHEN** the analytics page renders an expense breakdown chart
- **THEN** segment colours are drawn from the six-step warm red ramp in order from `#C24E36`


<!-- @trace
source: brand-visual-redesign
updated: 2026-07-10
code:
  - .agents/skills/spectra-apply/SKILL.md
  - checklist.html
  - css/style.css
  - analytics.html
  - .agents/skills/spectra-archive/SKILL.md
  - .agents/skills/spectra-commit/SKILL.md
  - .agents/skills/spectra-drift/SKILL.md
  - .agents/skills/spectra-propose/SKILL.md
  - import.html
  - CLAUDE.md
  - .agents/skills/spectra-audit/SKILL.md
  - js/transaction.js
  - forecast.html
  - .agents/skills/spectra-discuss/SKILL.md
  - .agents/skills/spectra-ask/SKILL.md
  - index.html
  - opentix.html
  - .agents/skills/spectra-debug/SKILL.md
  - .agents/skills/spectra-ingest/SKILL.md
  - js/import.js
  - OPTIMIZATION_PLAN.md
  - AGENTS.md
  - opentix-analytics.html
  - js/analytics.js
-->

---
### Requirement: No emoji in UI chrome

The system SHALL NOT render emoji characters in UI chrome (navigation, buttons, labels, headings, static copy). Emoji present in user-entered content SHALL be preserved as entered.

#### Scenario: UI labels contain no emoji

- **WHEN** user views navigation labels, buttons, headings, and other static UI strings
- **THEN** no emoji characters appear in those strings

#### Scenario: User-entered notes preserve emoji

- **WHEN** a transaction note containing an emoji is rendered in a list
- **THEN** the emoji is displayed as entered

<!-- @trace
source: brand-visual-redesign
updated: 2026-07-10
code:
  - .agents/skills/spectra-apply/SKILL.md
  - checklist.html
  - css/style.css
  - analytics.html
  - .agents/skills/spectra-archive/SKILL.md
  - .agents/skills/spectra-commit/SKILL.md
  - .agents/skills/spectra-drift/SKILL.md
  - .agents/skills/spectra-propose/SKILL.md
  - import.html
  - CLAUDE.md
  - .agents/skills/spectra-audit/SKILL.md
  - js/transaction.js
  - forecast.html
  - .agents/skills/spectra-discuss/SKILL.md
  - .agents/skills/spectra-ask/SKILL.md
  - index.html
  - opentix.html
  - .agents/skills/spectra-debug/SKILL.md
  - .agents/skills/spectra-ingest/SKILL.md
  - js/import.js
  - OPTIMIZATION_PLAN.md
  - AGENTS.md
  - opentix-analytics.html
  - js/analytics.js
-->

---
### Requirement: Four-step type scale

All platform pages SHALL use only four text sizes: 24px for page titles and key figures, 17px for section, sheet, and card headings, 15px for body text, list item titles, buttons, and table cells, and 13px for secondary text such as dates, tags, labels, hints, chips, and navigation labels. Secondary text SHALL use `--ink-2` (`#585E52`) or darker; `--ink-3` SHALL be reserved for placeholders and disabled states. Form inputs and selects SHALL use 16px so mobile browsers do not zoom. Glyph-only controls (the floating add button, icons, and month arrows) are exempt. Monetary amounts SHALL NOT wrap inside a number. Components SHALL NOT hard-code other font sizes.

##### Example: sizes found on a page

| Page (375px) | Allowed distinct sizes |
| ------------ | ---------------------- |
| /todos | subset of 13, 15, 17, 24 (plus 16 inside inputs) |
| /finance/analytics | subset of 13, 15, 17, 24 |

#### Scenario: Audit a page

- **WHEN** every visible text element on /calendar is measured at 375px width
- **THEN** no computed font size other than 13px, 15px, 16px (inputs), 17px, or 24px is found outside glyph-only controls

#### Scenario: Large amount on a phone

- **WHEN** the yearly income is $1,678,303 and the analytics page is viewed at 375px
- **THEN** the amount renders on one line

---
### Requirement: Consistent padding and alignment

White section cards and standalone cards SHALL use 16px inner padding; section headings inside a card SHALL start at the card's content edge with no extra inset; rows nested inside a card SHALL use 12px horizontal padding so their text aligns with buttons and chips above them. Chips in one wrapped row SHALL center their content vertically.

#### Scenario: Show picker sheet

- **WHEN** the show picker sheet is open with multi-line chips, single-line chips, and the expanded list
- **THEN** single-line chips 「不掛演出」 and 「收起」 have their text vertically centred, and the expanded list's row text starts at the same x position as the chip text


<!-- @trace
source: visual-consistency
updated: 2026-10-22
code:
  - platform/app/globals.css
  - platform/components/rich-text.tsx
  - platform/lib/line/commands.ts
  - platform/app/(app)/admin/users/page.tsx
  - platform/app/(app)/calendar/page.tsx
  - platform/components/date-badge.tsx
  - platform/components/show-editor.tsx
  - platform/app/(app)/finance/log/page.tsx
  - platform/app/(app)/loading.tsx
  - platform/components/add-menu.tsx
  - platform/components/show-todos.tsx
  - platform/components/top-bar.tsx
  - platform/wrangler.toml
  - platform/lib/dates.ts
  - platform/components/tx-board.tsx
  - platform/scripts/oneoff-idea-newlines-20261005.mts
  - platform/app/(app)/shows/page.tsx
  - platform/app/(app)/finance/analytics/page.tsx
  - platform/app/(app)/finance/transactions/page.tsx
  - platform/lib/finance/data.ts
  - platform/app/liff/[[...path]]/liff-login.tsx
  - platform/components/icons.tsx
  - platform/app/(app)/shows/[id]/page.tsx
  - platform/lib/markdown.ts
  - platform/app/(app)/admin/template/page.tsx
  - platform/app/(app)/todos/page.tsx
  - platform/components/bottom-nav.tsx
  - platform/app/login/page.tsx
  - platform/app/(app)/ideas/page.tsx
  - platform/components/idea-list.tsx
  - platform/app/pending/page.tsx
  - platform/components/finance-head.tsx
  - platform/app/(app)/me/page.tsx
  - platform/app/(app)/shows/actions.ts
  - platform/components/todo-board.tsx
tests:
  - platform/lib/markdown.test.ts
  - platform/lib/line/commands.test.ts
  - platform/lib/dates.test.ts
-->

---
### Requirement: Styled select controls

Every select control SHALL share the input styling (44px minimum height, 12px radius, same border and background) with a custom chevron 14px from the right edge and no native arrow.

#### Scenario: Finance show selector

- **WHEN** a member opens 收支紀錄 on desktop
- **THEN** the show selector looks like the other inputs and its chevron sits 14px from the right edge

<!-- @trace
source: visual-consistency
updated: 2026-10-22
code:
  - platform/app/globals.css
  - platform/components/rich-text.tsx
  - platform/lib/line/commands.ts
  - platform/app/(app)/admin/users/page.tsx
  - platform/app/(app)/calendar/page.tsx
  - platform/components/date-badge.tsx
  - platform/components/show-editor.tsx
  - platform/app/(app)/finance/log/page.tsx
  - platform/app/(app)/loading.tsx
  - platform/components/add-menu.tsx
  - platform/components/show-todos.tsx
  - platform/components/top-bar.tsx
  - platform/wrangler.toml
  - platform/lib/dates.ts
  - platform/components/tx-board.tsx
  - platform/scripts/oneoff-idea-newlines-20261005.mts
  - platform/app/(app)/shows/page.tsx
  - platform/app/(app)/finance/analytics/page.tsx
  - platform/app/(app)/finance/transactions/page.tsx
  - platform/lib/finance/data.ts
  - platform/app/liff/[[...path]]/liff-login.tsx
  - platform/components/icons.tsx
  - platform/app/(app)/shows/[id]/page.tsx
  - platform/lib/markdown.ts
  - platform/app/(app)/admin/template/page.tsx
  - platform/app/(app)/todos/page.tsx
  - platform/components/bottom-nav.tsx
  - platform/app/login/page.tsx
  - platform/app/(app)/ideas/page.tsx
  - platform/components/idea-list.tsx
  - platform/app/pending/page.tsx
  - platform/components/finance-head.tsx
  - platform/app/(app)/me/page.tsx
  - platform/app/(app)/shows/actions.ts
  - platform/components/todo-board.tsx
tests:
  - platform/lib/markdown.test.ts
  - platform/lib/line/commands.test.ts
  - platform/lib/dates.test.ts
-->
