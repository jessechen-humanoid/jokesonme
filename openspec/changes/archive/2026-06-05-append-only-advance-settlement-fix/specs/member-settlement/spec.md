## ADDED Requirements

### Requirement: Append-only historical advance settlement correction

The system SHALL provide a `fixAdvanceSettlements()` function in Google Apps Script that corrects historical settlement records where advance reimbursements were incorrectly included in the profit settlement amount. The function SHALL use an append-only strategy and MUST NOT modify any existing rows in the `成員結算` sheet.

This requirement supersedes the prior `Historical advance settlement correction` behavior, which mutated existing settlement amounts in place.

The function SHALL:

1. Scan all rows in the `收支紀錄` sheet where the `advancedBy` column is non-empty AND the status column equals `已結清`.
2. Group those transactions by `advancedBy` member and compute the total cleared advance amount per member (`advanceTotal`).
3. For each member where `advanceTotal > 0`, determine the `correctionDate` as the date of that member's largest-amount existing row in the `成員結算` sheet (largest by absolute amount, ignoring any rows whose note already equals `代墊還款修正`).
4. Skip any member whose existing `成員結算` rows already contain a row with note `代墊還款修正` — these members are marked `already-corrected` and MUST NOT receive another correction row.
5. Skip any member where `advanceTotal` exceeds the sum of all that member's existing `成員結算` row amounts — these members are marked `skip-overflow` and MUST NOT receive a correction row.
6. For each remaining member, append a new row to the `成員結算` sheet with values: `[member, -advanceTotal, correctionDate, "代墊還款修正"]`.
7. Return a summary object containing `corrections` (members for which a row was appended) and `skipped` (members and their skip reason).
8. Accept an optional `dryRun: true` payload flag that, when set, returns the same summary but appends no rows.

#### Scenario: First-time correction for member with bundled advance reimbursement

- **WHEN** member 兔子 has `成員結算` rows `[兔子, 20000, 2026-03-10, 匯款]` and `[兔子, 8000, 2026-01-05, 匯款]`, has cleared advances totaling 5000 in `收支紀錄`, has no prior `代墊還款修正` row, and `fixAdvanceSettlements()` is invoked
- **THEN** a new row `[兔子, -5000, 2026-03-10, 代墊還款修正]` is appended to the `成員結算` sheet, the two existing rows remain unchanged, and the summary includes 兔子 in `corrections`

##### Example: derived state after correction

- **GIVEN** existing `成員結算` rows for 兔子:
  - `兔子, 20000, 2026-03-10, 匯款`
  - `兔子, 8000, 2026-01-05, 匯款`
- **GIVEN** cleared advances for 兔子 totaling 5000
- **WHEN** `fixAdvanceSettlements()` runs (not dry-run)
- **THEN** the `成員結算` sheet contains three rows for 兔子:
  - `兔子, 20000, 2026-03-10, 匯款` (unchanged)
  - `兔子, 8000, 2026-01-05, 匯款` (unchanged)
  - `兔子, -5000, 2026-03-10, 代墊還款修正` (appended)
- **THEN** `sum(成員結算 amounts for 兔子) = 23000`, which is the corrected `已收款淨利` value

#### Scenario: Idempotency on second invocation

- **WHEN** `fixAdvanceSettlements()` is invoked for a member who already has a `成員結算` row with note `代墊還款修正`
- **THEN** the function appends no new row for that member and includes that member in `skipped` with reason `already-corrected`

#### Scenario: Member with cleared advances exceeding total settlements

- **WHEN** member 大弋 has cleared advances totaling 50000 and existing `成員結算` row amounts summing to 30000
- **THEN** the function appends no row for 大弋 and includes 大弋 in `skipped` with reason `skip-overflow`

#### Scenario: Dry-run preserves sheet state

- **WHEN** `fixAdvanceSettlements({ dryRun: true })` is invoked
- **THEN** the function returns the same summary structure it would return for a live run, and no rows are appended to the `成員結算` sheet

#### Scenario: Member with no cleared advances

- **WHEN** member 巧達 has zero cleared advances in `收支紀錄`
- **THEN** the function appends no row for 巧達 and does not include 巧達 in either `corrections` or `skipped` (or includes them with status `no-correction-needed`, depending on representation)


### Requirement: Advance settlement correction preview

The system SHALL provide a `previewAdvanceFix()` function in Google Apps Script that returns a per-member preview of what `fixAdvanceSettlements()` would do, without modifying any sheet rows.

The function SHALL:

1. Compute the same per-member analysis as `fixAdvanceSettlements()` — settlement totals, cleared advance totals, prior `代墊還款修正` markers, and overflow checks.
2. Return a `previews` array containing exactly one entry per member listed in the system's configured member list (all 8 members), regardless of whether that member needs correction.
3. For each preview entry, include: `member`, `settlementTotal` (sum of existing `成員結算` amounts for that member, including any prior correction rows), `advanceTotal` (cleared advance sum), `correctionAmount` (the negative amount that would be appended, or 0 when no correction is needed), `correctionDate` (the date that would be used, or empty string when no correction is needed), `expectedSettledAfter` (the settlement total after applying the proposed correction), `status` (one of `needs-correction`, `no-correction-needed`, `already-corrected`, `skip-overflow`), and `reason` (human-readable text for `already-corrected` and `skip-overflow` statuses).
4. Append no rows to any sheet.

#### Scenario: Preview before correction

- **WHEN** `previewAdvanceFix()` is invoked and members 又又 and 兔子 have bundled advance reimbursements, 巧達 has no advances, 大弋 has overflow, and 傑哥 has been previously corrected
- **THEN** the response contains 8 entries with statuses respectively: 又又 `needs-correction`, 兔子 `needs-correction`, 巧達 `no-correction-needed`, 大弋 `skip-overflow`, 傑哥 `already-corrected`, and the remaining three members assigned a status reflecting their actual state

#### Scenario: Preview matches subsequent live execution

- **WHEN** `previewAdvanceFix()` returns a list of members marked `needs-correction` with specific `correctionAmount` and `correctionDate` values, and `fixAdvanceSettlements()` is invoked immediately afterward with no intervening sheet edits
- **THEN** each member's appended row matches the `correctionAmount` and `correctionDate` shown in the preview


### Requirement: Advance fix preview must precede execution in UI

The analytics page SHALL display a preview-then-confirm flow when the user triggers historical advance settlement correction. The system MUST NOT call `fixAdvanceSettlements()` for a live (non-dry-run) write until the user has explicitly confirmed the previewed corrections.

The UI flow SHALL:

1. On clicking the `修正代墊帳` button, invoke `previewAdvanceFix()` and render a modal containing a table with one row per member, showing member name, historical settlement total, cleared advance total, proposed correction amount (or status text), and expected settled amount after correction.
2. Display the modal even when no member requires correction, so the user has explicit confirmation that the data is already clean.
3. Provide a `確認執行` button that, when clicked, invokes `fixAdvanceSettlements()` (live, not dry-run) and refreshes the member earnings table afterward.
4. Provide a `取消` button that closes the modal without invoking any write action.

#### Scenario: Preview then confirm

- **WHEN** the user clicks `修正代墊帳`, the preview modal opens listing all 8 members, and the user clicks `確認執行`
- **THEN** the system invokes `fixAdvanceSettlements()` once, appends correction rows for members marked `needs-correction`, and refreshes the member earnings display

#### Scenario: Preview then cancel

- **WHEN** the user clicks `修正代墊帳`, the preview modal opens, and the user clicks `取消`
- **THEN** the modal closes and no rows are appended to the `成員結算` sheet

#### Scenario: Preview displays even when no correction is needed

- **WHEN** the user clicks `修正代墊帳` and `previewAdvanceFix()` returns every member with status `no-correction-needed` or `already-corrected`
- **THEN** the modal still opens and lists all 8 members so the user can verify the system reports nothing to do
