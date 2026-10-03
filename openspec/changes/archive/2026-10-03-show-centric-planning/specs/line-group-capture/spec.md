## ADDED Requirements

### Requirement: Quick-reply show buttons on confirmations

When the bot confirms a newly created idea (`#` command, including quote-reply) or todo (`/` command, including quote-reply), the confirmation reply SHALL carry quick-reply buttons derived from the pickable show list: the next show, then the following upcoming performances, at most 3 show buttons, plus a 4th button 「先放著」. Each show button SHALL be a postback action whose data is `v=1&t=<idea|todo>&id=<uuid>&show=<uuid>`, with 「先放著」 using `show=none`; the label SHALL be the show name with a leading 「看我笑話 」 removed and cut to 20 characters. When there is no upcoming performance the reply SHALL be plain text without buttons. Ledger rows SHALL never be offered. Replies remain reply-token replies, never push.

#### Scenario: Idea confirmation with buttons

- **WHEN** 柏文 sends `#讓觀眾投票決定結局` while 10 月號 (10/24) and 11 月號 (11/21) are the upcoming performances
- **THEN** the bot replies 「已存進靈感庫，要歸到哪一場？」 with buttons 「10 月號」「11 月號」「先放著」

##### Example: button composition

| Upcoming performances | Buttons |
| --------------------- | ------- |
| none | no quick reply |
| 10 月號 | 10 月號, 先放著 |
| 10 月號, 11 月號, 12 月號, 《直球》 | 10 月號, 11 月號, 12 月號, 先放著 |

#### Scenario: Todo confirmation with buttons

- **WHEN** a member sends `/買膠帶 @柏文`
- **THEN** the bot replies 「已建立待辦：買膠帶（柏文）」 with the same show buttons

### Requirement: Postback assigns the idea or todo to a show

The webhook SHALL handle `postback` events from the registered group. For data `v=1&t=idea&id=<uuid>&show=<uuid>` it SHALL set that idea's `show_id`; for `t=todo` it SHALL set that todo's `show_id`; then it SHALL reply 「已歸到「{show name}」」. For `show=none` it SHALL write nothing and reply 「好，先放在靈感庫」 (or 「好，先不掛演出」 for a todo). If the idea or todo no longer exists it SHALL reply 「這則已經不在了」. Postback data that is malformed or not version 1 SHALL be logged and ignored without a reply. Postback events SHALL NOT be stored in the captured messages table. If the group postback event carries no reply token, the write SHALL still happen and the reply SHALL be skipped.

#### Scenario: Attach to October

- **WHEN** a member taps 「10 月號」 under the idea confirmation
- **THEN** that idea's show becomes 10 月號 and the bot replies 「已歸到「看我笑話 10 月號」」

#### Scenario: Leave it

- **WHEN** a member taps 「先放著」
- **THEN** nothing is written and the bot replies 「好，先放在靈感庫」

#### Scenario: Stale button

- **WHEN** a member taps a button whose idea was deleted on the web
- **THEN** nothing is written and the bot replies 「這則已經不在了」

## MODIFIED Requirements

### Requirement: Hash command idea capture

A message whose trimmed text starts with half-width `#` or full-width `＃` followed by non-empty text SHALL immediately create an idea with the text after the hash, the author, the time, a link to the captured message, and no show. The bot SHALL reply 「已存進靈感庫，要歸到哪一場？」 with the quick-reply show buttons when an upcoming performance exists, otherwise 「已存進靈感庫」 without buttons. A `#` that is not the first character SHALL NOT trigger.

##### Example: parsing

| Message | Creates idea | Idea text |
| ------- | ------------ | --------- |
| `#讓觀眾投票決定結局` | yes | 讓觀眾投票決定結局 |
| `＃即興劇加計時器` | yes | 即興劇加計時器 |
| `今天 #1 的組合很好笑` | no | – |
| `#` (not a quote reply) | no (usage reply) | – |

#### Scenario: Save an idea

- **WHEN** a member sends `#讓觀眾投票決定結局`
- **THEN** an unassigned idea with that text exists and the bot replies with the confirmation and show buttons
