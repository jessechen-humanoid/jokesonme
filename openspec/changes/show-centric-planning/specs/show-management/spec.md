## ADDED Requirements

### Requirement: Show kind

Every row in the `shows` table SHALL carry a `kind` of `performance` or `ledger`, not null, defaulting to `performance`. `ledger` rows are finance-only buckets (membership, channel, merchandise, common fund) and SHALL never be offered on planning pages (todos, ideas, show pages) or in LINE replies; `performance` rows SHALL be offered on both planning and finance pages. Shows created through the platform UI SHALL always be `performance`; `ledger` rows SHALL only be created by migration or database maintenance.

#### Scenario: Migration classifies existing rows

- **WHEN** migration 0009 runs on the production data of 2026-10-03
- **THEN** exactly these 7 rows become `ledger`: 看我笑話會員, 會員與其他收支, 共同基金支出, 看我笑話頻道, 看我笑話商演 / 業配合作, 看我笑話小卡盲包 大阪和服篇, 看我笑話小卡盲包 現代問題研究中心篇; the other 22 rows stay `performance`

#### Scenario: New show from the UI

- **WHEN** a member creates 「第 3 季 1 月號」 from the shows page
- **THEN** the stored row has kind `performance`

### Requirement: Archive a show

A member SHALL be able to mark a performance as archived (已演出／歸檔) and back to active from the show's edit panel. Archived shows SHALL leave the 「接下來」 list and the next-show shortcuts but SHALL remain visible under 「更多」 and on finance pages, and their todos and ideas SHALL stay attached.

#### Scenario: Archive a past month

- **WHEN** a member archives 「看我笑話 6 月號」
- **THEN** it no longer appears under 「接下來」 or as a quick-reply button, still appears under 「更多…」 and in the finance project selector, and its transactions are unchanged

## MODIFIED Requirements

### Requirement: Show list shared across pages

The system SHALL maintain a single `shows` table as the source for every page. Each show SHALL have name, type (`monthly`, `special`, or `other`), kind (`performance` or `ledger`), optional performance date, and status (`active` or `archived`). Finance pages SHALL read the full list. Planning pages (todos, ideas, show pages) and LINE replies SHALL read only `performance` rows through the pickable show list rule.

#### Scenario: Finance sees all, planning sees performances

- **WHEN** the table holds 22 `performance` rows and 7 `ledger` rows
- **THEN** the transactions page selector lists 29 and the todo form's show picker lists only the 22 performances
