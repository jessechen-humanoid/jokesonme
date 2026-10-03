## MODIFIED Requirements

### Requirement: Brand colour tokens

The system SHALL define the following colour tokens as CSS variables in `:root` and all UI chrome SHALL consume colours through these tokens. No other decorative colours SHALL be introduced. These tokens implement visual direction C 「橘色品牌感」 chosen by Jesse on 2026-10-03 (mockup: `.spectra/design-cache/jokesonme-platform-v2/directions.html`); the warm-white background is retired.

- Page background `--bg`: `#F3F3F1`
- Card / table surface `--surface`: `#FFFFFF`
- Secondary surface (completed / inactive / zebra) `--surface-2`: `#EDEDEA`
- Primary text and ink fills (active chip, floating add button) `--ink`: `#1B1B1B`
- Secondary text `--text-secondary`: `#55554F`
- Meta text `--text-muted`: `#77776F`
- Border `--border`: `#E4E4E0`
- Border hover `--border-hover`: `#CFCFC9`
- Brand orange `--brand`: `#FF7A00`
- Deep orange `--brand-deep`: `#D96400`
- Orange tint `--brand-tint`: `#FFE2C4`

#### Scenario: Page background is neutral light grey

- **WHEN** user opens any page of the new platform
- **THEN** the page `body` background is `#F3F3F1` (solid, no gradient)

#### Scenario: Card renders on white surface

- **WHEN** user views a card element
- **THEN** the card background is `#FFFFFF`

### Requirement: Brand orange usage restriction

Brand orange (`--brand`) SHALL be used for exactly these purposes: the page header block at the top of each page (one per page, full width, bottom corners rounded 28px), primary action buttons, the active indicator in the bottom navigation, and key-figure emphasis. Due dates SHALL be emphasised with `--brand-tint` background and `--ink` text. Brand orange SHALL NOT be used as the background of cards, list rows, tables, or body text. Orange text rendered on light backgrounds SHALL use `--brand-deep` (`#D96400`).

#### Scenario: Header block is orange

- **WHEN** user opens the todo page
- **THEN** the top header block background is `#FF7A00` and the list cards below it are `#FFFFFF`

#### Scenario: Orange text on light background uses deep orange

- **WHEN** orange-coloured text is rendered on `--bg`, `--surface`, or `--brand-tint`
- **THEN** the text colour is `#D96400`

#### Scenario: Due date emphasis

- **WHEN** a todo shows its due date
- **THEN** the label has `#FFE2C4` background and `#1B1B1B` text

### Requirement: Corner radius and surface styling

Inputs and buttons SHALL use `border-radius: 8px`; filter chips SHALL use a full pill radius (`999px`); cards and list rows SHALL use `border-radius: 16px`; the floating add button SHALL use `border-radius: 18px`; modals and bottom sheets SHALL use `border-radius: 20px` on their top corners; avatars SHALL use `border-radius: 50%`. Cards SHALL NOT have borders; separation comes from the white surface on the grey page background. The system SHALL NOT apply `box-shadow`, `text-shadow`, gradient backgrounds, or `backdrop-filter` to any element.

#### Scenario: Todo row is a borderless rounded card

- **WHEN** user views a todo row
- **THEN** it has a `#FFFFFF` background, `border-radius: 16px`, no border, and no box-shadow

#### Scenario: Filter chip is a pill

- **WHEN** user views the 「我的待辦」 filter chip
- **THEN** it has `border-radius: 999px`
