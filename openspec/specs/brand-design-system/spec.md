# brand-design-system Specification

## Purpose

TBD - created by archiving change 'brand-visual-redesign'. Update Purpose after archive.

## Requirements

### Requirement: Brand colour tokens

The system SHALL define the following colour tokens as CSS variables in `:root` and all UI chrome SHALL consume colours through these tokens. No other decorative colours SHALL be introduced. These tokens implement the 看我笑話 brand trio of orange, blue, and off-white chosen by Jesse on 2026-11-12 (pairing B, terracotta with navy; orange is primary and blue is secondary). The earlier persimmon direction B1 is superseded.

- Page ground `--ground`: `#F5F1E6`; secondary ground `--ground-2`: `#EDE7D9`
- Card surface `--surface`: `#FFFFFF`; list-row surface `--surface-2`: `#FAF8F2`
- Text `--ink`: `#17181C`, `--ink-2`: `#4D4F57`, `--ink-3`: `#65676F`
- Lines `--line`: `#E1DBCB`, `--line-2`: `#EEE9DC`
- Terracotta `--brand`: `#C9562C`, deep `--brand-deep`: `#9E3F1C`, tints `--brand-2`: `#EBB8A3`, `--brand-3`: `#F6DDD1`, `--brand-4`: `#FBEEE8`
- Navy `--accent`: `#1F2F6E`, tints `--accent-2`: `#A9B3D6`, `--accent-3`: `#DDE1F1`, `--accent-4`: `#EEF0F8`
- Shadow `--shadow`: `0 1px 2px rgba(23,24,28,.05), 0 8px 24px -16px rgba(23,24,28,.22)`

Text set in `--ink-2` or `--ink-3` SHALL reach a contrast ratio of at least 4.5 against `--ground`, `--surface`, and `--surface-2`. White text on `--brand` SHALL be set at font weight 700.

#### Scenario: Page ground is off-white

- **WHEN** user opens any page of the platform
- **THEN** the page `body` background is `#F5F1E6`

#### Scenario: Card renders on white surface

- **WHEN** user views a section card
- **THEN** the card background is `#FFFFFF`

#### Scenario: Faintest text stays readable

- **WHEN** secondary text is rendered in `--ink-3` on a `--ground`, `--surface`, or `--surface-2` background
- **THEN** the contrast ratio between text and background is at least 4.5

##### Example: measured contrast of the faintest text

| Text | Background | Contrast ratio |
| ---- | ---------- | -------------- |
| `#65676F` | `#F5F1E6` | 5.00 |
| `#4D4F57` | `#F5F1E6` | 7.24 |

---
### Requirement: Brand orange usage restriction

Terracotta (`--brand`) SHALL be used for exactly these purposes: the next-show highlight card (one per page, white text), primary action buttons and the floating add button, the current item in navigation (`--brand-deep` text), unclaimed tags, checkbox outlines and checked fills, the today marker in the calendar, performance markers in the team calendar and the venue calendar, the todo progress bar fill, the keyboard focus ring, and due-date emphasis (`--brand-deep` text). Page headers SHALL NOT use a terracotta background. Terracotta SHALL NOT be used as the background of section cards, list rows, tables, or body text, SHALL NOT be used for selected states of filters or option pickers, and SHALL NOT be used as a chart series colour.

#### Scenario: Page header is not terracotta

- **WHEN** user opens the todo page
- **THEN** the page header has no terracotta background and the section cards below it are `#FFFFFF`

#### Scenario: Next show card is terracotta

- **WHEN** user opens the shows page while an upcoming performance exists
- **THEN** only the next-show card uses the `#C9562C` background

#### Scenario: Due date emphasis

- **WHEN** a todo due within three days shows its due date
- **THEN** the label text colour is `#9E3F1C`

#### Scenario: Selected filter is not terracotta

- **WHEN** user selects a quick-entry preset chip on the finance inbox page
- **THEN** the selected chip background is `#1F2F6E` and no chip on the page uses a terracotta background

---
### Requirement: Semantic colour tokens for financial state

The system SHALL define semantic colour tokens — and use ONLY these — for financial or state semantics:

- Positive / income / settled `--success`: `#1F7A4D`
- Negative / expense / unsettled `--danger-fin`: `#C2382E`
- Partial / warning `--warning`: `#8A6410`

Each semantic colour SHALL have a corresponding background variant (`--success-bg`: `#E6F2EB`, `--danger-bg`: `#FBE9E6`, `--warning-bg`: `#FAF1D6`) for status badges and highlighted rows, and the semantic colour SHALL reach a contrast ratio of at least 4.5 against its own background variant. Semantic colours SHALL ONLY be applied to functional cues (amount signs, settlement status, warnings) and SHALL NOT be used decoratively. Every `var(--*)` colour reference emitted by rendered markup SHALL resolve to a token defined in `:root`.

#### Scenario: Negative amount rendered in red

- **WHEN** a net amount is negative
- **THEN** the value is rendered with colour `#C2382E`

#### Scenario: Positive amount rendered in green

- **WHEN** a net amount is positive
- **THEN** the value is rendered with colour `#1F7A4D`

#### Scenario: Settled badge colour resolves

- **WHEN** the show finance page renders a settled-status badge using `var(--success)`
- **THEN** the badge text renders in `#1F7A4D` on a `#E6F2EB` background because both tokens are defined in `:root`

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

Section cards and standalone cards SHALL use `border-radius: 20px` and `border-radius: 16px` respectively, with the sticker outline defined in "Sticker surface styling" and no blurred shadow; rows inside a section SHALL be separated by `1px solid var(--line-2)` dividers with no border box and no shadow; inputs and buttons SHALL use `border-radius: 12px`; segmented tabs SHALL use a 12px track with 9px items; bottom sheets SHALL use `border-radius: 24px` on their top corners. Navigation SHALL be a bottom tab bar below 900px viewport width and a left sidebar at 900px and above.

#### Scenario: Todo row inside a section

- **WHEN** user views a todo row inside a section card
- **THEN** the row has no border box and no box-shadow, and is separated from the next row by a `1px` line in `#EEE9DC`

#### Scenario: Desktop sidebar

- **WHEN** the viewport is 1280px wide
- **THEN** navigation renders as a left sidebar and the bottom tab bar is not shown

---
### Requirement: Chart colour palette

Chart colours on the platform SHALL be drawn only from design tokens defined in `:root`. Income bars SHALL use `--success` and expense bars SHALL use `--danger-fin`, matching amount colouring elsewhere. Categorical series (income composition parts, membership plan series) SHALL use the navy scale `--accent`, `--accent-2`, `--accent-3` and the neutral tokens `--ink-2`, `--ink-3`, assigned in a fixed order per series name. No chart segment SHALL use `--brand` or any colour literal.

#### Scenario: Income composition uses the navy scale

- **WHEN** the finance overview renders the income composition bar
- **THEN** the largest fixed part (票房) is filled with `#1F2F6E` and no segment is filled with `#C9562C`

#### Scenario: Membership chart does not use the brand colour

- **WHEN** the finance overview renders the paid-membership chart
- **THEN** the monthly-subscription bars are filled with `#1F2F6E` and the annual-subscription bars are filled with the `--ink-3` colour

#### Scenario: Monthly chart keeps semantic colours

- **WHEN** the finance overview renders the monthly income and expense chart
- **THEN** income bars are filled with `#1F7A4D` and expense bars are filled with `#C2382E`

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

---
### Requirement: Navy accent usage

Navy (`--accent`) SHALL be the single colour for selected states outside navigation. Selected filter chips (finance series filter, quick-entry presets, ticket filter, venue month buttons) SHALL render with a `--accent` background and `--ground` text. Selected options inside forms (member picks, show picker chips and rows) SHALL render with a `--accent-4` background, a `--accent-2` border, and `--accent` text. The selected day in the calendar SHALL render its day number on a `--accent` background. The 看我笑話 series badge SHALL render with a `--accent-3` background and `--accent` text. Segmented tab tracks SHALL keep their white selected pill. Navy SHALL NOT be used for primary action buttons or for positive or negative amounts.

#### Scenario: Selected filter chip is navy

- **WHEN** user selects the 看我笑話 series filter on the show finance list
- **THEN** the selected chip has background `#1F2F6E` and text `#F5F1E6`, and unselected chips keep a white background

#### Scenario: Selected form option is navy tinted

- **WHEN** user ticks a member in the transaction sheet's participant picks
- **THEN** the ticked option has background `#EEF0F8`, border `#A9B3D6`, and text `#1F2F6E`

#### Scenario: Selected calendar day is navy while today stays terracotta

- **WHEN** user selects a day other than today in the calendar
- **THEN** the selected day number sits on a `#1F2F6E` background and today's day number keeps a `#C9562C` ring

#### Scenario: Primary button stays terracotta

- **WHEN** user opens the finance overview
- **THEN** the 新增結算 button background is `#C9562C` and no primary button uses `#1F2F6E`

---
### Requirement: Sticker surface styling

The platform SHALL use a sticker look, chosen by Jesse on 2026-11-12, built from two tokens: `--sticker`: `2px solid var(--ink)` and `--pop`: `3px 3px 0 var(--ink)`. Section cards, standalone cards, table wrappers, the note composer, schedule chips, filter chips, and ghost buttons SHALL render with the `--sticker` outline and no shadow. The next-show card, primary buttons, and the floating add button SHALL render with the `--sticker` outline and the `--pop` solid offset shadow, and a pressed primary button SHALL shift by 2px toward its shadow. Filter chips SHALL be tilted by at most 2 degrees, alternating direction. Rows, tiles, and form controls inside a card (list rows, member tiles, inputs, option picks) SHALL NOT use the `--sticker` outline or the `--pop` shadow, so that, apart from buttons and filter chips, a card contains only one heavy outline. The avatar, the icon button in the top bar, and the top edge of the bottom navigation SHALL also use the `--sticker` outline. Chart colour swatches and stacked-bar segments SHALL carry a `1px` `--ink` inner outline so that light series remain distinguishable from the background. No sticker element SHALL cause horizontal page scrolling at 375px viewport width. The tilt is static and SHALL NOT animate.

#### Scenario: Section card has a sticker outline

- **WHEN** user views a section card on the finance overview
- **THEN** the card border is `2px` solid `#17181C` and its box-shadow is none

#### Scenario: Primary button pops

- **WHEN** user views the 新增結算 button
- **THEN** the button has a `2px` solid `#17181C` border and a `3px 3px 0` solid `#17181C` shadow with no blur

#### Scenario: Inner tiles stay light

- **WHEN** user views a member tile inside the 成員分潤 section
- **THEN** the tile border is `1px` and it has no offset shadow

#### Scenario: No horizontal scroll on a phone

- **WHEN** user opens the home page at 375px viewport width
- **THEN** the document scroll width equals the viewport width
