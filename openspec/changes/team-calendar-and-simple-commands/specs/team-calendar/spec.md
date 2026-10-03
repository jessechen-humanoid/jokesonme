## Purpose

Gives the troupe one month view of shows (synced read-only from the public audience calendar), internal events kept only in the platform, and todo due dates.

## ADDED Requirements

### Requirement: Calendar page with three layers

The platform SHALL provide a calendar page with a month grid and a day list for the selected day. Each day SHALL show three visually distinct layers: shows from the public calendar, internal events, and todos due that day. Times SHALL be shown in Asia/Taipei and dates in `M/D（週）` form. `admin` and `member` SHALL access it; `finance_partner` SHALL NOT.

#### Scenario: October view

- **WHEN** a member opens the calendar for 2026-10 and taps 10/17
- **THEN** the day list shows 「看我笑話｜喜劇拼盤 10 月號」 as a show with its Taipei start time, plus any internal events and todos due 10/17

### Requirement: Read-only public show calendar sync

The platform SHALL read shows from the public iCal feed of 「看我笑話演出行事曆」 and SHALL never write to that calendar. Timed events in UTC SHALL be converted to Asia/Taipei; all-day events SHALL stay on their date; recurring events SHALL be expanded within the displayed range. A successful fetch SHALL be cached for 10 minutes and stored as the last good copy; when a fetch fails, the page SHALL show the last good copy with a notice of when it was fetched, or a notice that shows could not be loaded if no copy exists.

##### Example: time conversion

| iCal DTSTART | Shown as |
| ------------ | -------- |
| `20261017T113000Z` | 10/17（六）19:30 |
| `VALUE=DATE:20261016` | 10/16（五）整天 |

#### Scenario: Feed unavailable

- **WHEN** the iCal fetch fails and a copy from 2026-10-03 14:00 exists
- **THEN** shows from that copy are displayed with 「演出資料停在 10/3（六）14:00」

### Requirement: Internal events

Internal events SHALL be stored only in the platform with date, optional time, title, optional notes, and creator, and every change SHALL be audited. Members SHALL create, edit, and delete internal events on the web.

#### Scenario: Add a meeting on the web

- **WHEN** a member adds 「討論 11 月號」 on 2026-10-12 at 19:00
- **THEN** the calendar shows it on 10/12 as an internal event and nothing is written to the public calendar
