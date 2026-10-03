## Purpose

Makes the platform comfortable on phones, since everyone except Jesse uses it on mobile, and settles the new visual direction through a choice between candidates.

## ADDED Requirements

### Requirement: Mobile-first layout

Every page SHALL be designed for a 375px-wide viewport first: no horizontal page scroll at 375px, tap targets at least 44px, primary navigation reachable with one thumb. Wider viewports SHALL only widen the layout. Wide finance tables SHALL scroll inside their own container.

#### Scenario: Phone width

- **WHEN** any page is rendered at 375×812
- **THEN** `document.documentElement.scrollWidth` equals the viewport width

### Requirement: Visual direction selection

Before pages are styled, 2–3 visually distinct directions built on the brand orange and without the warm-white background SHALL be presented as phone mockups of the todo page; the chosen direction SHALL be recorded as a `brand-design-system` delta via ingest before page styling proceeds.

#### Scenario: Direction chosen

- **WHEN** Jesse picks a direction
- **THEN** its tokens are captured in the change's `brand-design-system` delta spec and all pages use them
