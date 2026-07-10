# muji-design-system Specification (delta)

## REMOVED Requirements

### Requirement: MUJI colour palette

**Reason**: The MUJI palette (background `#fafaf8`, gold accent `#c9a96e`) is replaced by the brand palette (warm white `#FAF7F2`, brand orange `#FF7A00`) per the 看我笑話 brand direction.
**Migration**: Consume the colour tokens defined in `brand-design-system` — Requirement: Brand colour tokens.

#### Scenario: MUJI palette no longer present

- **WHEN** any production page is rendered after this change
- **THEN** neither `#fafaf8` nor the gold accent `#c9a96e` appears anywhere in the stylesheet or rendered UI

### Requirement: Semantic colour exception for financial state

**Reason**: Semantic colours are re-tuned to harmonise with the warm palette and extended with defined CSS variables (fixing the previously undefined `--success` reference).
**Migration**: Use `brand-design-system` — Requirement: Semantic colour tokens for financial state (`--success #4A7C59`, `--danger #C24E36`, `--warning #C08A3E`).

#### Scenario: Old semantic red replaced

- **WHEN** a negative amount is rendered after this change
- **THEN** it uses `#C24E36` and the retired value `#B04237` no longer appears in the codebase

### Requirement: No decorative effects

**Reason**: The zero-radius rule is dropped — the new system mandates rounded rectangles (8px controls, 12px cards). The bans on shadows, gradients, and backdrop-filter are carried forward in the new spec.
**Migration**: Follow `brand-design-system` — Requirement: Corner radius and surface styling.

#### Scenario: Buttons are no longer square-cornered

- **WHEN** user views any button after this change
- **THEN** the button renders with `border-radius: 8px` instead of the retired `border-radius: 0` rule

### Requirement: Border styling

**Reason**: Border colours change with the warm palette (`#E8E2D8` default, `#D3CBBD` hover); the 1px-solid principle is carried forward.
**Migration**: Follow `brand-design-system` — Requirement: Corner radius and surface styling.

#### Scenario: Old border colours replaced

- **WHEN** user views a bordered element after this change
- **THEN** the border colour is `#E8E2D8` (hover `#D3CBBD`) and the retired values `#e8e8e5` / `#c8c8c5` no longer appear in the stylesheet

### Requirement: Typography

**Reason**: The system-font-only stack is replaced by an actually loaded Noto Sans TC webfont (400/500/700) to guarantee CJK rendering quality across platforms.
**Migration**: Follow `brand-design-system` — Requirement: Typography with loaded webfont.

#### Scenario: Webfont replaces system-only stack

- **WHEN** any production page is loaded after this change
- **THEN** its `<head>` requests Noto Sans TC from Google Fonts instead of relying solely on system fonts

### Requirement: No emoji in UI chrome

**Reason**: The rule itself is retained but moves to the new capability so `muji-design-system` can be fully retired.
**Migration**: Follow `brand-design-system` — Requirement: No emoji in UI chrome (identical behaviour).

#### Scenario: Emoji rule continues under new capability

- **WHEN** user views navigation labels, buttons, and headings after this change
- **THEN** no emoji characters appear, as governed by `brand-design-system`
