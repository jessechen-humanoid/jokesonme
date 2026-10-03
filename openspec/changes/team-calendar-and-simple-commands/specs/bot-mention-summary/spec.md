## MODIFIED Requirements

### Requirement: Mention summary reply

When a text message in the registered group mentions the bot and is not a `/` or `#` command, the bot SHALL reply (reply API, not push) with, first, the important dates in the next 14 days including today (shows from the public calendar and internal events, each as `M/D（週）` plus `HH:MM` when timed, earliest first, at most 10 lines), then the open todos grouped by assignee, each line showing the todo title and its due date in `M/D（週）前` form, followed by a 「未認領」 group and a LIFF link to the todo page. If the message also mentions other people, the todo section SHALL list only those people's todos. If there are no dates or no open todos, that section SHALL say so. Each person SHALL show at most 5 todos, nearest due date first, with a 「…還有 N 件」 line for the rest.

##### Example: reply body

| Data | Reply contains |
| ---- | -------------- |
| show 10/17 19:30 「看我笑話｜喜劇拼盤 10 月號」, event 10/12 19:00 「討論 11 月號」 | 「【接下來 14 天】」 then 「・10/12（一）19:00 討論 11 月號」 then 「・10/17（六）19:30 看我笑話｜喜劇拼盤 10 月號」 |
| 大弋: Rundown 製作 due 2026-10-19; unassigned: 公關票確認 due 2026-10-21 | 「大弋」 then 「・Rundown 製作 10/19（一）前」, 「未認領」 then 「・公關票確認 10/21（三）前」 |
| no todos | 「目前沒有未完成的待辦」 |

#### Scenario: Ask the bot

- **WHEN** a member sends 「@傑瓜 這週誰要做什麼」
- **THEN** the bot replies with the next 14 days' shows and events, then every member's open todos and the unclaimed ones, and no push message is sent

#### Scenario: Ask about one person

- **WHEN** a member sends 「@傑瓜 @柏文」
- **THEN** the todo section lists only 柏文's open todos
