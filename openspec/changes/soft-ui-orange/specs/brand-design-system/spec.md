## MODIFIED Requirements

### Requirement: Brand colour tokens

The system SHALL define the following colour tokens as CSS variables in `:root` and all UI chrome SHALL consume colours through these tokens. No other decorative colours SHALL be introduced. These tokens implement the Soft UI direction chosen by Jesse on 2026-11-12: an ivory ground, softly raised ivory surfaces, charcoal text, and orange as the single accent colour. The earlier terracotta-with-navy pairing is superseded and the `--accent` navy tokens SHALL NOT exist.

- Page ground `--ground`: `#F2EFE8`; secondary ground `--ground-2`: `#E9E5DC`
- Raised surface `--surface`: `#F8F6F1`; recessed surface `--surface-2`: `#EFECE5`
- Text `--ink`: `#2A2C33`, `--ink-2`: `#555862`, `--ink-3`: `#63666F`
- Lines `--line`: `#E2DED4`, `--line-2`: `#EAE6DD`
- Orange `--brand`: `#DD5A1C`, deep `--brand-deep`: `#A8400F`, tints `--brand-2`: `#F2B28C`, `--brand-3`: `#F9DAC6`, `--brand-4`: `#FCECE1`
- Mist `--mist`: `#D5D9E0`
- Shadows `--raise`: `-6px -6px 14px rgba(255,255,255,.95), 8px 10px 20px rgba(160,148,126,.26)`; `--raise-sm`: `-3px -3px 8px rgba(255,255,255,.95), 4px 5px 10px rgba(160,148,126,.24)`; `--press`: `inset 2px 2px 5px rgba(160,148,126,.30), inset -2px -2px 5px rgba(255,255,255,.95)`

Text set in `--ink-2` or `--ink-3` SHALL reach a contrast ratio of at least 4.5 against `--ground`, `--ground-2`, `--surface`, and `--surface-2`. White text on `--brand` SHALL be set at font weight 700.

#### Scenario: Page ground is ivory

- **WHEN** user opens any page of the platform
- **THEN** the page `body` background is `#F2EFE8`

#### Scenario: Card renders on a raised ivory surface

- **WHEN** user views a section card
- **THEN** the card background is `#F8F6F1`

#### Scenario: Faintest text stays readable

- **WHEN** secondary text is rendered in `--ink-3` on a `--ground`, `--ground-2`, `--surface`, or `--surface-2` background
- **THEN** the contrast ratio between text and background is at least 4.5

##### Example: measured contrast of the faintest text

| Text | Background | Contrast ratio |
| ---- | ---------- | -------------- |
| `#63666F` | `#EFECE5` | 4.86 |
| `#63666F` | `#E9E5DC` | 4.56 |
| `#63666F` | `#F2EFE8` | 5.00 |

### Requirement: Brand orange usage restriction

Orange (`--brand` and its tints) SHALL be the single accent colour of the platform. It SHALL be used for: the next-show highlight card (one per page, white text), primary action buttons and the floating add button, the current item in navigation and the selected segment of segmented tabs (`--brand-deep` text), selected filter chips (`--brand` background, white text), selected options inside forms (`--brand-4` background, `--brand-deep` text), the selected day and the today marker in the calendar, performance markers in the team calendar and the venue calendar, unclaimed tags, checkbox fills, the progress bar fill, the keyboard focus ring, chart series, and due-date emphasis (`--brand-deep` text). Page headers SHALL NOT use an orange background. Orange SHALL NOT be used as the background of section cards, list rows, or tables, and SHALL NOT be used for positive or negative amounts.

#### Scenario: Page header is not orange

- **WHEN** user opens the todo page
- **THEN** the page header has no orange background and the section cards below it are `#F8F6F1`

#### Scenario: Next show card is orange

- **WHEN** user opens the shows page while an upcoming performance exists
- **THEN** only the next-show card uses the `#DD5A1C` background

#### Scenario: Due date emphasis

- **WHEN** a todo due within three days shows its due date
- **THEN** the label text colour is `#A8400F`

#### Scenario: Selected filter chip is orange

- **WHEN** user selects a series filter on the show finance list
- **THEN** the selected chip has background `#DD5A1C` and white text, and no element on the page uses a navy colour

### Requirement: Corner radius and surface styling

Section cards SHALL use `border-radius: 26px` and standalone cards `border-radius: 22px`, both styled as defined in "Soft surface styling"; rows inside a section SHALL be separated by `1px solid var(--line-2)` dividers with no border box and no shadow; buttons, single-line inputs, selects, filter chips, badges, and segmented tabs SHALL be pill shaped (`border-radius: 999px`); multi-line text areas SHALL use `border-radius: 20px`; bottom sheets SHALL use `border-radius: 24px` on their top corners. Navigation SHALL be a floating rounded bar at the bottom of the screen below 900px viewport width and a floating rounded sidebar at 900px and above, and every navigation item SHALL show its icon together with its label at both widths.

#### Scenario: Todo row inside a section

- **WHEN** user views a todo row inside a section card
- **THEN** the row has no border box and no box-shadow, and is separated from the next row by a `1px` line in `#EAE6DD`

#### Scenario: Desktop sidebar

- **WHEN** the viewport is 1280px wide
- **THEN** navigation renders as a left sidebar and the bottom bar is not shown

#### Scenario: Bottom navigation keeps its icons

- **WHEN** user views the bottom navigation at 375px viewport width
- **THEN** each of the five items shows an icon above its label, and the bar has rounded corners and does not touch the left, right, or bottom edge of the screen

### Requirement: Chart colour palette

Chart colours on the platform SHALL be drawn only from design tokens defined in `:root`. Income bars SHALL use `--success` and expense bars SHALL use `--danger-fin`, matching amount colouring elsewhere. Categorical series (income composition parts, membership plan series) SHALL use the orange scale `--brand`, `--brand-2`, the neutral tokens `--ink-2`, `--ink-3`, and `--mist`, assigned in a fixed order per series name. No chart segment SHALL use a colour literal.

#### Scenario: Income composition uses the orange scale

- **WHEN** the finance overview renders the income composition bar
- **THEN** the largest fixed part (票房) is filled with `#DD5A1C` and the 會員 part with `#F2B28C`

#### Scenario: Membership chart colours

- **WHEN** the finance overview renders the paid-membership chart
- **THEN** the monthly-subscription bars are filled with `#DD5A1C` and the annual-subscription bars are filled with the `--ink-3` colour

#### Scenario: Monthly chart keeps semantic colours

- **WHEN** the finance overview renders the monthly income and expense chart
- **THEN** income bars are filled with `#1F7A4D` and expense bars are filled with `#C2382E`

## ADDED Requirements

### Requirement: Soft surface styling

The platform SHALL use a soft, raised look built from the shadow tokens `--raise`, `--raise-sm`, and `--press`, and SHALL NOT draw dark outlines around surfaces. Section cards, table wrappers, and the navigation bar SHALL render on `--surface` with the `--raise` shadow and no border. Standalone cards, the note composer, schedule chips, unselected filter chips, ghost buttons, the avatar, and icon buttons SHALL render on `--surface` with the `--raise-sm` shadow and no border. Inputs, selects, text areas, segmented tab tracks, progress tracks, and unchecked checkboxes SHALL render on `--surface-2` with the inset `--press` shadow, so that they read as recessed. The selected segment of a segmented tab SHALL render raised on `--surface`. Primary buttons, the floating add button, and the next-show card SHALL render on `--brand` with a soft orange-tinted drop shadow and no border. Tiles and rows nested inside a card (member tiles, calendar items, summary cells) SHALL render flat on `--surface-2` with no shadow. No element SHALL cause horizontal page scrolling at 375px viewport width.

#### Scenario: Section card is raised without an outline

- **WHEN** user views a section card on the finance overview
- **THEN** the card has no border and its box-shadow is the `--raise` value

#### Scenario: Input is recessed

- **WHEN** user views a text input in the transaction sheet
- **THEN** the input has no border, a `#EFECE5` background, and an inset box-shadow

#### Scenario: Primary button is a soft orange pill

- **WHEN** user views the 新增結算 button
- **THEN** the button has `border-radius: 999px`, background `#DD5A1C`, no border, and a blurred orange-tinted shadow

#### Scenario: No horizontal scroll on a phone

- **WHEN** user opens the home page at 375px viewport width
- **THEN** the document scroll width equals the viewport width

## REMOVED Requirements

### Requirement: Navy accent usage

**Reason**: Jesse chose a single-accent Soft UI on 2026-11-12; selected states now use orange, so the navy `--accent` tokens no longer exist.

**Migration**: Selected-state rules are covered by "Brand orange usage restriction"; chart series are covered by "Chart colour palette".

#### Scenario: Navy is no longer used

- **WHEN** user selects a filter chip, a form option, or a calendar day
- **THEN** the selected element is styled with orange tokens and no navy colour appears

### Requirement: Sticker surface styling

**Reason**: The sticker look (2px ink outlines and solid offset shadows) shipped on 2026-11-12 and was replaced the same day by the Soft UI direction.

**Migration**: Surface styling is covered by "Soft surface styling"; the `--sticker` and `--pop` tokens are deleted.

#### Scenario: Sticker outlines are gone

- **WHEN** user views any card or button
- **THEN** it has no `2px` ink outline and no solid offset shadow
