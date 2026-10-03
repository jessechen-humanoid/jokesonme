## Purpose

Gives each show a structured program sheet (start time plus ordered segments) so the troupe can compute cue times automatically, copy a rundown table into Google Docs, and hand the program to Claude for further customisation without any LLM API call.

## ADDED Requirements

### Requirement: Program sheet data

Each performance show SHALL have one program sheet consisting of a start time (default 19:00) and an ordered list of segments. Each segment SHALL have a non-blank name, a type, a duration in whole minutes from 0 to 600, and optional content, props, sound, and projection text. Every change SHALL be audited and deletions SHALL be soft deletes.

#### Scenario: Add a segment

- **WHEN** a member adds segment 「又兔了」 of type 「漫才」 lasting 7 minutes to the 10 月號 program
- **THEN** the segment appears at the end of the program and an audit row records the member as actor

#### Scenario: Invalid duration

- **WHEN** a member saves a segment with duration 「-5」 or 「abc」
- **THEN** nothing is saved and the form shows an error

### Requirement: Program sheet editing page

The platform SHALL provide a mobile-first program page per show where `admin` and `member` set the start time, add, edit, delete, and move segments up or down. `finance_partner` SHALL NOT access it. When the show has no segments, the page SHALL offer copying the whole program (start time and segments) from another show that has a program; when the show already has segments, copying SHALL NOT be offered and SHALL be rejected by the server.

#### Scenario: Reorder

- **WHEN** a member taps 「上移」 on the third segment
- **THEN** it becomes the second segment and the former second becomes third

#### Scenario: Copy from last month

- **WHEN** the 11 月號 program is empty and a member copies from 10 月號
- **THEN** 11 月號 gets the same start time and the same segments in the same order, and 10 月號 is unchanged

### Requirement: Rundown copy

The program page SHALL copy a rundown table to the clipboard with columns 節目順序, 時間, 預計時間點, 內容, 道具, 音效, 投影, as both an HTML table and tab-separated plain text. Cue times SHALL accumulate from the start time by each segment's duration. Each non-empty content line SHALL become a bullet.

#### Scenario: Paste into Google Docs

- **WHEN** a member taps 「複製 Rundown」 and pastes into a Google Doc
- **THEN** a table with the seven columns appears, one row per segment, with cue times filled in

##### Example: cue times

| Start | Segments (minutes) | 預計時間點 |
| ----- | ------------------ | ---------- |
| 19:00 | 觀眾進場 30, 開場 5, Talking 10 | 19:00 - 19:30, 19:30 - 19:35, 19:35 - 19:45 |
| 23:50 | A 20 | 23:50 - 24:10 |
| 19:30 | 中場 0 | 19:30 - 19:30 |

##### Example: row cells

| Segment | 節目順序 cell | 時間 cell | 內容 cell |
| ------- | ------------- | --------- | --------- |
| name 又兔了, type 漫才, 7 min, content 「接下來讓我們歡迎 — 又兔了！」 | 又兔了 / 漫才 (two lines) | 7 min | • 接下來讓我們歡迎 — 又兔了！ |
| name 開場, type empty, 5 min | 開場 | 5 min | (empty) |

### Requirement: Copy for Claude

The program page SHALL copy a plain-text prompt containing the show name, performance date, every segment with its cue time, type, content, props, sound, and projection, followed by a short instruction asking Claude to draft slide text for each segment. The platform SHALL NOT call any language model API.

#### Scenario: Prompt contents

- **WHEN** a member taps 「複製給 Claude」 on a program with 3 segments
- **THEN** the clipboard text contains all 3 segment names with their cue times and ends with the slide-drafting instruction
