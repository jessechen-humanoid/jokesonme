## REMOVED Requirements

### Requirement: Frosted glass card style

**Reason**: Replaced by MUJI design system. Cards now use flat background with solid border and no effects.

**Migration**: All card styling now follows the `Border styling`, `MUJI colour palette`, and `No decorative effects` requirements in the new `muji-design-system` capability.

#### Scenario: Cards no longer render with glass effect after removal

- **WHEN** this change is applied and user views any card element
- **THEN** the card has no backdrop blur, no semi-transparent background, and no box shadow

### Requirement: Gradient background

**Reason**: Replaced by MUJI solid background.

**Migration**: Page background is set to solid `#fafaf8` per the `MUJI colour palette` requirement in `muji-design-system`.

#### Scenario: Background no longer shows gradient after removal

- **WHEN** this change is applied and user opens any page
- **THEN** the background is a solid colour and no gradient is visible

### Requirement: Frosted glass navigation bar

**Reason**: Replaced by flat navigation under the `No decorative effects` requirement in `muji-design-system`.

**Migration**: Navigation bar uses solid background `#fafaf8` and a `1px solid #e8e8e5` bottom border.

#### Scenario: Navigation bar no longer blurs content behind it

- **WHEN** this change is applied and user scrolls any page
- **THEN** content behind the navigation bar is hidden (not blurred) by a solid bar

### Requirement: Glassmorphism fallback

**Reason**: The new design does not use `backdrop-filter` at all, so fallback is not applicable.

**Migration**: No fallback required — all browsers render the same flat design.

#### Scenario: No fallback path exists after removal

- **WHEN** this change is applied and a browser without `backdrop-filter` support opens the page
- **THEN** the page renders identically to browsers with support, because no glass effect is used anywhere
