## Purpose

Captures every message in the troupe's LINE group as it happens, because LINE offers no history API, and turns explicit slash (`/`) and hash (`#`) commands into todos and ideas without any language-model call.

## ADDED Requirements

### Requirement: Group message capture

The webhook SHALL verify the LINE signature and SHALL store every text message event from the registered group with its LINE message id, group id, author `userId`, timestamp, text, mention list, and quoted message id when present. Storage SHALL be idempotent on the LINE message id. Events from groups other than the registered group SHALL be ignored. The webhook SHALL respond 200 within LINE's timeout even when downstream work fails, and failures SHALL be logged.

#### Scenario: Ordinary chat message

- **WHEN** a member sends "週六誰可以去搬道具" in the group
- **THEN** one row with that text and the member's `userId` exists in the captured messages store and no reply is sent

#### Scenario: Redelivered event

- **WHEN** LINE delivers the same message event twice
- **THEN** only one stored row exists for that message id

#### Scenario: Invalid signature

- **WHEN** a request arrives with an invalid `x-line-signature`
- **THEN** the webhook responds 401 and stores nothing

### Requirement: Ordinary chat retention

Captured messages that did not produce a todo or idea and are not referenced by any todo or idea SHALL be deleted once they are older than 14 days. Command messages and referenced messages SHALL be kept permanently. A daily job at 03:30 Asia/Taipei SHALL perform the purge through a database function that refuses any retention window shorter than 14 days and only deletes from the captured messages table.

##### Example: purge decision on 2026-10-20

| Message | Sent | Referenced by todo/idea | Kept |
| ------- | ---- | ----------------------- | ---- |
| 「週六誰可以去搬道具」 | 2026-10-01 | no | deleted |
| 「週六誰可以去搬道具」 | 2026-10-10 | no | kept (within 14 days) |
| `/買膠帶` | 2026-09-01 | yes (todo source) | kept |
| 「最後一段讓觀眾投票」 quoted by `#` | 2026-09-01 | yes (idea source) | kept |

#### Scenario: Window too short

- **WHEN** the purge function is called with a 3-day window
- **THEN** it raises an error and deletes nothing

#### Scenario: Quote of an expired message

- **WHEN** a member replies with `#` to a 20-day-old ordinary message that has been purged
- **THEN** no idea is created and the bot replies that the quoted message cannot be found

### Requirement: Slash command todo creation

A message whose trimmed text starts with half-width `/` or full-width `／` followed by non-empty text SHALL immediately create a todo with source `command`. The todo title SHALL be the text after the slash with mention text removed. Mentioned users SHALL become assignees; with no mention the todo SHALL be unassigned. The bot SHALL send a reply message (not a push) confirming title and assignees. A slash that is not the first character SHALL NOT trigger.

##### Example: parsing

| Message | Creates todo | Title | Assignee |
| ------- | ------------ | ----- | -------- |
| `/訂 10/20 的場地 @柏文` | yes | 訂 10/20 的場地 | 柏文 |
| `／買膠帶` | yes | 買膠帶 | unassigned |
| `明天 1/20 開會` | no | – | – |
| `https://example.com/a` | no | – | – |
| `/` (not a quote reply) | no (usage reply) | – | – |

#### Scenario: Command with mention

- **WHEN** a member sends `/訂 10/20 的場地 @柏文`
- **THEN** a todo "訂 10/20 的場地" assigned to 柏文 exists and the bot replies confirming it

### Requirement: Hash command idea capture

A message whose trimmed text starts with half-width `#` or full-width `＃` followed by non-empty text SHALL immediately create an idea with the text after the hash, the author, the time, a link to the captured message, and no show. The bot SHALL reply 「已存進靈感庫」. A `#` that is not the first character SHALL NOT trigger.

##### Example: parsing

| Message | Creates idea | Idea text |
| ------- | ------------ | --------- |
| `#讓觀眾投票決定結局` | yes | 讓觀眾投票決定結局 |
| `＃即興劇加計時器` | yes | 即興劇加計時器 |
| `今天 #1 的組合很好笑` | no | – |
| `#` (not a quote reply) | no (usage reply) | – |

#### Scenario: Save an idea

- **WHEN** a member sends `#讓觀眾投票決定結局`
- **THEN** an unassigned idea with that text exists and the bot replies 「已存進靈感庫」

### Requirement: Quote-reply commands

When a member uses LINE's reply feature on an earlier group message and sends a bare `/`, `／`, `#`, or `＃`, the system SHALL look up the quoted message among captured messages: a bare slash SHALL create a todo titled with the quoted text, and a bare hash SHALL create an idea with the quoted text whose author is the quoted message's author. The bot SHALL reply confirming. If the event carries no quoted message id, the bot SHALL reply with the usage hint and create nothing. If the quoted message is not in the store (sent before the bot joined, or purged after 14 days), the bot SHALL create nothing and reply that the quoted message cannot be found, suggesting `#內容` or `/內容` instead.

#### Scenario: Save someone else's idea

- **WHEN** 巧達 replies to 柏文's message "最後一段讓觀眾投票" with `#`
- **THEN** an idea "最後一段讓觀眾投票" credited to 柏文 exists and the bot confirms

#### Scenario: Quoted message not captured

- **WHEN** a member replies with `#` to a message sent before the bot joined
- **THEN** no idea is created and the bot replies that the quoted message cannot be found

### Requirement: Command usage reply

A message consisting only of `/`, `／`, `#`, or `＃` that is not a quote reply SHALL NOT create anything; the bot SHALL reply with a one-line hint describing both commands.

#### Scenario: Bare slash

- **WHEN** a member sends `/` without quoting a message
- **THEN** nothing is created and the bot replies with the usage hint
