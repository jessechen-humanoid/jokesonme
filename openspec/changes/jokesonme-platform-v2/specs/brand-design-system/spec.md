## MODIFIED Requirements

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

### Requirement: Brand orange usage restriction

Persimmon (`--brand`) SHALL be used for exactly these purposes: the title card at the top of each page (one per page, white text), primary action buttons and the floating add button, the current item in navigation, unclaimed tags, checkbox outlines, and due-date emphasis (`--brand-deep` text). Persimmon SHALL NOT be used as the background of section cards, list rows, tables, or body text.

#### Scenario: Title card is persimmon

- **WHEN** user opens the todo page
- **THEN** the top title card background is `#E2673F` and the section cards below it are `#FFFFFF`

#### Scenario: Due date emphasis

- **WHEN** a todo shows its due date
- **THEN** the label text colour is `#B84D2A`

### Requirement: Corner radius and surface styling

Section cards SHALL use `border-radius: 24px` with `--shadow`; list rows inside a section SHALL use `--surface-2`, a `1px solid var(--line-2)` border, `border-radius: 12px`, and no shadow; inputs and buttons SHALL use `border-radius: 12px`; segmented tabs SHALL use a 12px track with 9px items; bottom sheets SHALL use `border-radius: 24px` on their top corners. Navigation SHALL be a bottom tab bar below 900px viewport width and a left sidebar card at 900px and above.

#### Scenario: Todo row inside a section

- **WHEN** user views a todo row
- **THEN** it has `#FAF8F1` background, `border-radius: 12px`, a `1px solid #F0EBDD` border, and no box-shadow

#### Scenario: Desktop sidebar

- **WHEN** the viewport is 1280px wide
- **THEN** navigation renders as a left sidebar card and the bottom tab bar is not shown
