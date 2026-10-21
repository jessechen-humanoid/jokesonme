## MODIFIED Requirements

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
