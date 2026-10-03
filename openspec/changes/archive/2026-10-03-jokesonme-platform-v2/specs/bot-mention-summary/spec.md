## Purpose

Lets anyone in the LINE group ask the bot who still has to do what, by mentioning it, using only free reply messages; the platform sends no push messages at all.

## ADDED Requirements

### Requirement: Mention summary reply

When a text message in the registered group mentions the bot and is not a `/` or `#` command, the bot SHALL reply (reply API, not push) with the open todos grouped by assignee, each line showing the todo title and its due date in `M/D（週）前` form, followed by a 「未認領」 group and a LIFF link to the todo page. If the message also mentions other people, the reply SHALL list only those people's todos. If there are no open todos, the reply SHALL say so. Each person SHALL show at most 5 todos, nearest due date first, with a 「…還有 N 件」 line for the rest.

##### Example: reply body

| Open todos | Reply contains |
| ---------- | -------------- |
| 大弋: Rundown 製作 due 2026-10-19; unassigned: 公關票確認 due 2026-10-21 | 「大弋」 then 「・Rundown 製作 10/19（一）前」, 「未認領」 then 「・公關票確認 10/21（三）前」 |
| none | 「目前沒有未完成的待辦」 |

#### Scenario: Ask the bot

- **WHEN** a member sends 「@傑瓜 這週誰要做什麼」
- **THEN** the bot replies with every member's open todos and the unclaimed ones, and no push message is sent

#### Scenario: Ask about one person

- **WHEN** a member sends 「@傑瓜 @柏文」
- **THEN** the reply lists only 柏文's open todos

### Requirement: No push messages

The bot SHALL NOT send push, multicast, or broadcast messages; every bot message SHALL be a reply to a group message, so monthly LINE message quota is never consumed.

#### Scenario: Quota untouched

- **WHEN** the platform has run for a month with members using commands and mentions
- **THEN** LINE's quota consumption endpoint reports 0 messages used by the bot
