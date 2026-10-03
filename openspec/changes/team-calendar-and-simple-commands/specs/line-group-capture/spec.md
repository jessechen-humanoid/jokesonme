## MODIFIED Requirements

### Requirement: Slash command todo creation

A message whose trimmed text starts with half-width `/` or full-width `／` followed by non-empty text SHALL be a command. The first word after the slash decides the type: `靈感` creates an idea, `行程` creates an internal event, `說明` replies with the cheat sheet; any other text creates a todo with source `command`. For a todo, the title SHALL be the text after the slash with mention text removed; mentioned users other than the bot SHALL become assignees; with no mention the todo SHALL be unassigned. The bot SHALL send a reply message (not a push) confirming what was created. A slash that is not the first character SHALL NOT trigger.

##### Example: parsing

| Message | Result |
| ------- | ------ |
| `/訂 10/20 的場地 @柏文` | todo 「訂 10/20 的場地」, assignee 柏文 |
| `／買膠帶` | todo 「買膠帶」, unassigned |
| `/靈感 讓觀眾投票決定結局` | idea 「讓觀眾投票決定結局」 |
| `/行程 10/12 19:00 討論 11 月號` | internal event 10/12 19:00 「討論 11 月號」 |
| `/說明` | cheat-sheet reply, nothing created |
| `/靈感會議要訂場地` | todo 「靈感會議要訂場地」 (keyword must be followed by a space or end) |
| `明天 1/20 開會` | nothing |

#### Scenario: Command with mention

- **WHEN** a member sends `/訂 10/20 的場地 @柏文`
- **THEN** a todo "訂 10/20 的場地" assigned to 柏文 exists and the bot replies confirming it

#### Scenario: Idea via slash

- **WHEN** a member sends `/靈感 讓觀眾投票決定結局`
- **THEN** an unassigned idea with that text exists and the bot replies 「已存進靈感庫」

### Requirement: Command usage reply

A message consisting only of `/`, `／`, `#`, or `＃` that is not a quote reply, or `/行程` with a missing or invalid date, SHALL NOT create anything; the bot SHALL reply with the cheat sheet. The cheat sheet SHALL present only the `/` grammar (`/內容`, `/靈感 內容`, `/行程 M/D HH:MM 內容`, `/說明`) and tag 傑瓜 for the current status; legacy `#` and quote-reply forms SHALL keep working but SHALL NOT be advertised.

#### Scenario: Bare slash

- **WHEN** a member sends `/` without quoting a message
- **THEN** nothing is created and the bot replies with the cheat sheet

#### Scenario: Cheat sheet on request

- **WHEN** a member sends `/說明`
- **THEN** the bot replies with the cheat sheet and nothing is created

## ADDED Requirements

### Requirement: Slash event creation

`/行程` followed by a date `M/D`, an optional time `HH:MM` (24-hour), and a title SHALL create an internal event and reply confirming the date in `M/D（週）` form. The year SHALL be the nearest date that is today or later in Asia/Taipei. Without a valid date, or without a title, nothing SHALL be created and the bot SHALL reply with the cheat sheet.

##### Example: year and time

| Today | Message | Event |
| ----- | ------- | ----- |
| 2026-10-03 | `/行程 10/12 19:00 討論 11 月號` | 2026-10-12 19:00 「討論 11 月號」 |
| 2026-10-03 | `/行程 1/5 排練` | 2027-01-05, no time, 「排練」 |
| 2026-10-03 | `/行程 10/3 晚上聚餐` | 2026-10-03, no time, 「晚上聚餐」 |
| 2026-10-03 | `/行程 13/40 開會` | nothing; cheat sheet |
| 2026-10-03 | `/行程 10/12` | nothing; cheat sheet |

#### Scenario: Meeting from the group

- **WHEN** a member sends `/行程 10/12 19:00 討論 11 月號` on 2026-10-03
- **THEN** an internal event on 2026-10-12 19:00 exists and the bot replies 「已記到行事曆：10/12（一）19:00 討論 11 月號」
