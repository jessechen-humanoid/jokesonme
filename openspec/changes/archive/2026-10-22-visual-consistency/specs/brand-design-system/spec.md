## ADDED Requirements

### Requirement: Four-step type scale

All platform pages SHALL use only four text sizes: 22px for page titles and key figures, 16px for section, sheet, and card headings, 14px for body text, list item titles, buttons, and table cells, and 12px for secondary text such as dates, tags, labels, hints, chips, and mobile navigation labels. Form inputs and selects SHALL use 16px so mobile browsers do not zoom. Glyph-only controls (the floating add button and month arrows) are exempt. Components SHALL NOT hard-code other font sizes.

##### Example: sizes found on a page

| Page (375px) | Allowed distinct sizes |
| ------------ | ---------------------- |
| /todos | subset of 12, 14, 16, 22 (plus 16 inside inputs) |
| /finance/transactions | subset of 12, 14, 16, 22 |

#### Scenario: Audit a page

- **WHEN** every visible text element on /calendar is measured at 375px width
- **THEN** no computed font size other than 12px, 14px, 16px, or 22px is found outside glyph-only controls

### Requirement: Consistent padding and alignment

White section cards and standalone cards SHALL use 16px inner padding; section headings inside a card SHALL start at the card's content edge with no extra inset; rows nested inside a card SHALL use 12px horizontal padding so their text aligns with buttons and chips above them. Chips in one wrapped row SHALL center their content vertically.

#### Scenario: Show picker sheet

- **WHEN** the show picker sheet is open with multi-line chips, single-line chips, and the expanded list
- **THEN** single-line chips 「不掛演出」 and 「收起」 have their text vertically centred, and the expanded list's row text starts at the same x position as the chip text

### Requirement: Styled select controls

Every select control SHALL share the input styling (44px minimum height, 12px radius, same border and background) with a custom chevron 14px from the right edge and no native arrow.

#### Scenario: Finance show selector

- **WHEN** a member opens 收支紀錄 on desktop
- **THEN** the show selector looks like the other inputs and its chevron sits 14px from the right edge
