# liquid-glass-ui Specification

## Purpose

TBD - created by archiving change 'platform-v2'. Update Purpose after archive.

## Requirements

### Requirement: Frosted glass card style

All card elements SHALL use a frosted glass (glassmorphism) visual style with semi-transparent background (`rgba(255,255,255,0.55)`), backdrop blur (`backdrop-filter: blur(20px)`), and a subtle white border (`1px solid rgba(255,255,255,0.3)`). Border radius SHALL be 16px. Box shadow SHALL use a soft spread (`0 8px 32px rgba(0,0,0,0.08)`).

#### Scenario: Card appears with glass effect

- **WHEN** user views any card element on the page
- **THEN** the card has a semi-transparent background with visible backdrop blur effect


<!-- @trace
source: platform-v2
updated: 2026-03-17
code:
  - index.html
  - js/analytics.js
  - CLAUDE.md
  - js/checklist.js
  - .DS_Store
  - js/transaction.js
  - js/api.js
  - js/shared.js
  - gas/Code.gs
  - css/style.css
-->

---
### Requirement: Gradient background

The page background SHALL use a soft gradient instead of a solid color. The gradient SHALL blend pastel tones (e.g., light purple to light blue to light pink) to provide visual depth behind the frosted glass cards.

#### Scenario: Background gradient visible

- **WHEN** user opens any page
- **THEN** the background displays a soft multi-color gradient


<!-- @trace
source: platform-v2
updated: 2026-03-17
code:
  - index.html
  - js/analytics.js
  - CLAUDE.md
  - js/checklist.js
  - .DS_Store
  - js/transaction.js
  - js/api.js
  - js/shared.js
  - gas/Code.gs
  - css/style.css
-->

---
### Requirement: Frosted glass navigation bar

The sticky navigation bar SHALL use the same frosted glass effect as cards, ensuring content scrolling behind the navigation is visible through the blur.

#### Scenario: Navigation blur on scroll

- **WHEN** user scrolls the page content
- **THEN** the content is visible through the navigation bar with a blurred effect


<!-- @trace
source: platform-v2
updated: 2026-03-17
code:
  - index.html
  - js/analytics.js
  - CLAUDE.md
  - js/checklist.js
  - .DS_Store
  - js/transaction.js
  - js/api.js
  - js/shared.js
  - gas/Code.gs
  - css/style.css
-->

---
### Requirement: Glassmorphism fallback

For browsers that do not support `backdrop-filter`, the system SHALL fall back to a solid white background (`rgba(255,255,255,0.95)`) so that all content remains readable.

#### Scenario: Fallback on unsupported browser

- **WHEN** a browser does not support backdrop-filter
- **THEN** cards and navigation display with a near-opaque white background

<!-- @trace
source: platform-v2
updated: 2026-03-17
code:
  - index.html
  - js/analytics.js
  - CLAUDE.md
  - js/checklist.js
  - .DS_Store
  - js/transaction.js
  - js/api.js
  - js/shared.js
  - gas/Code.gs
  - css/style.css
-->