# brand-design-system Specification (delta)

## ADDED Requirements

### Requirement: Brand colour tokens

The system SHALL define the following colour tokens as CSS variables in `:root` and all UI chrome SHALL consume colours through these tokens. No other decorative colours SHALL be introduced.

- Page background `--bg`: `#FAF7F2`
- Card / table surface `--surface`: `#FFFFFF`
- Secondary surface (completed / inactive / zebra) `--surface-2`: `#F5F0E8`
- Primary text `--text-primary`: `#33302B`
- Secondary text `--text-secondary`: `#6B655C`
- Meta text `--text-muted`: `#9A938A`
- Border `--border`: `#E8E2D8`
- Border hover `--border-hover`: `#D3CBBD`
- Brand orange `--brand`: `#FF7A00`
- Deep orange `--brand-deep`: `#D96400`
- Orange tint `--brand-tint`: `#FFF1E4`

#### Scenario: Page background uses warm white

- **WHEN** user opens any production page
- **THEN** the page `body` background is `#FAF7F2` (solid, no gradient)

#### Scenario: Card renders on white surface

- **WHEN** user views a card element
- **THEN** the card background is `#FFFFFF` with a `1px solid #E8E2D8` border

### Requirement: Brand orange usage restriction

Brand orange (`--brand` / `--brand-deep`) SHALL ONLY be applied to: primary action buttons, the active state indicator in navigation, and point emphasis of key figures or statuses. Brand orange SHALL NOT be used for large area fills, body text, or decorative blocks. Orange text rendered on light backgrounds SHALL use `--brand-deep` (`#D96400`), not `--brand`, to preserve contrast.

#### Scenario: Primary button uses brand orange

- **WHEN** user views a primary action button
- **THEN** the button background is `#FF7A00` with white text, and its hover background is `#D96400`

#### Scenario: Orange text on light background uses deep orange

- **WHEN** orange-coloured text is rendered on `--bg`, `--surface`, or `--brand-tint`
- **THEN** the text colour is `#D96400`

#### Scenario: No large-area orange fill

- **WHEN** user views any page section background, table, or card
- **THEN** none of them uses `--brand` or `--brand-deep` as a fill colour

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

### Requirement: Typography with loaded webfont

All production pages SHALL load the Noto Sans TC webfont (weights 400, 500, 700) from Google Fonts with `display=swap`, and the font stack SHALL be `-apple-system, BlinkMacSystemFont, "Noto Sans TC", "Segoe UI", sans-serif`.

#### Scenario: Webfont link present on every production page

- **WHEN** any of the seven production pages (index, checklist, analytics, forecast, import, opentix, opentix-analytics) is loaded
- **THEN** its `<head>` contains a `fonts.googleapis.com` stylesheet link requesting Noto Sans TC weights 400, 500, and 700

#### Scenario: Fallback when webfont unavailable

- **WHEN** the webfont fails to load
- **THEN** text renders with the system font fallback and all functionality remains usable

### Requirement: Corner radius and surface styling

Interactive controls (buttons, inputs, selects) SHALL use `border-radius: 8px`. Cards and modals SHALL use `border-radius: 12px`. Avatars SHALL use `border-radius: 50%`. Bordered elements SHALL use `1px solid var(--border)` by default, transitioning to `var(--border-hover)` on hover where interactive. The system SHALL NOT apply `box-shadow`, `text-shadow`, gradient backgrounds, or `backdrop-filter` to any element.

#### Scenario: Button renders as rounded rectangle

- **WHEN** user views any button
- **THEN** the button has `border-radius: 8px`

#### Scenario: Card renders with large radius and no shadow

- **WHEN** user views a card
- **THEN** the card has `border-radius: 12px`, a `1px` solid border, and no box-shadow, gradient, or backdrop blur

### Requirement: Chart colour palette

Chart colours SHALL be defined in a single named constant (`CHART_COLORS`) in `js/analytics.js`, aligned with the semantic tokens. The income ramp SHALL be the six-step green scale `#4A7C59 #5E8F6C #749F80 #8BB095 #A3C1AB #BCD2C2` (dark to light) and the expense ramp SHALL be the six-step warm red scale `#C24E36 #CB6650 #D47D6A #DD9585 #E6ADA1 #EFC6BD` (dark to light). No chart segment SHALL use a colour outside these ramps and the neutral tokens.

#### Scenario: Income chart uses green ramp

- **WHEN** the analytics page renders an income breakdown chart
- **THEN** segment colours are drawn from the six-step green ramp in order from `#4A7C59`

#### Scenario: Expense chart uses warm red ramp

- **WHEN** the analytics page renders an expense breakdown chart
- **THEN** segment colours are drawn from the six-step warm red ramp in order from `#C24E36`

### Requirement: No emoji in UI chrome

The system SHALL NOT render emoji characters in UI chrome (navigation, buttons, labels, headings, static copy). Emoji present in user-entered content SHALL be preserved as entered.

#### Scenario: UI labels contain no emoji

- **WHEN** user views navigation labels, buttons, headings, and other static UI strings
- **THEN** no emoji characters appear in those strings

#### Scenario: User-entered notes preserve emoji

- **WHEN** a transaction note containing an emoji is rendered in a list
- **THEN** the emoji is displayed as entered
