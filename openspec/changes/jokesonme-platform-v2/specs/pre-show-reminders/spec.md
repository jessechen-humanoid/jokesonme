## Purpose

Uses the scarce LINE push quota only for reminders before a show, so the group sees what is still undone without daily noise.

## ADDED Requirements

### Requirement: Pre-show reminder schedule

A daily job SHALL push one message to the registered group for each show whose performance date is exactly 3 days or 1 day after today (Asia/Taipei), at 10:00 Asia/Taipei. No reminder SHALL be sent when the show has no open todos.

##### Example: schedule

| Today | Show date | Push |
| ----- | --------- | ---- |
| 10/21 | 10/24 | yes |
| 10/23 | 10/24 | yes |
| 10/22 | 10/24 | no |

#### Scenario: Three days before

- **WHEN** today is 10/21 and a show is on 10/24 with 3 open todos
- **THEN** the group receives one push listing those 3 todos

### Requirement: Reminder content with actual dates

The reminder SHALL state the show name, the performance date in `M/D（週）` form, each open todo's title, assignee or 「未認領」, and due date in `M/D（週）` form, and a LIFF link to the show's todos. It SHALL NOT use relative wording such as `D-3`.

#### Scenario: Message body

- **WHEN** the reminder for a 10/24 show is generated
- **THEN** the text contains 「10/24（六）」 and no `D-` token

### Requirement: Push only for reminders

The bot SHALL NOT send push messages except pre-show reminders; all other bot output SHALL be reply messages. Each push SHALL be recorded so monthly push usage (pushes × group members) is visible to the admin.

#### Scenario: Usage visibility

- **WHEN** two reminders were pushed this month to an 8-person group
- **THEN** the admin page shows 16 of 200 messages used
