## MODIFIED Requirements

### Requirement: Idea library page

The platform SHALL provide a notes page labelled 「筆記」 (ideas saved from the web or by `/靈感`、`/筆記`、`/note` in LINE) with three views: 「全部」 (default; every non-archived note newest first, each with its show name when it has one), 「未分演出」 (non-archived notes without a show, with the count in the control), and 「已封存」. Each note SHALL show its text, author, time, and whether it came from LINE. The page SHALL offer an inline composer at the top that saves a note without opening a panel, optionally choosing a show before saving. Admin and members SHALL access it; `finance_partner` SHALL NOT. Explanatory copy about the LINE commands SHALL appear only in empty states.

#### Scenario: View notes

- **WHEN** a member opens the notes page
- **THEN** the 「全部」 view is selected and lists every non-archived note with author, time, and show name

#### Scenario: Empty unassigned view

- **WHEN** there are no notes without a show and the member opens 「未分演出」
- **THEN** the empty state explains that 「/筆記 內容」 in the group saves a note here

### Requirement: Assign idea to a show

Note cards SHALL NOT carry assignment buttons. Each card SHALL show one quiet show tag: the show's name when assigned, or 「選演出」 in secondary text when not. Tapping the tag SHALL open the shared show picker, through which a member SHALL move the note to another show or back to no show. The edit panel, opened by tapping the note text, SHALL allow editing the text, changing the show, and archiving; archived notes SHALL be restorable from 「已封存」. A note that leaves the current view SHALL disappear from the list immediately. Ledger rows SHALL never be offered.

#### Scenario: Assign to November show

- **WHEN** a member taps 「選演出」 on 「讓觀眾投票決定結局」 and picks 「第 2 季 11 月號」
- **THEN** the tag reads 「第 2 季 11 月號」 and the note appears on that show's page

#### Scenario: No assignment buttons

- **WHEN** a member views the notes page
- **THEN** no card shows a 「→ 下一場」 or 「其他…」 button
