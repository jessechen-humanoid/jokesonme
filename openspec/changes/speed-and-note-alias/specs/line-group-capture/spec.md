## ADDED Requirements

### Requirement: Idea keyword aliases

`筆記` and `note` (case-insensitive) SHALL behave exactly like `靈感` as the first word after `/` or `／`, including keeping line breaks and saving the quoted message when used as a bare quote reply. The keyword SHALL be followed by whitespace or the end of the message. The cheat sheet SHALL mention that `/筆記` and `/note` also work.

##### Example: aliases

| Message | Result |
| ------- | ------ |
| `/筆記 讓觀眾投票` | idea 「讓觀眾投票」 |
| `/note 讓觀眾投票` | idea 「讓觀眾投票」 |
| `/NOTE 讓觀眾投票` | idea 「讓觀眾投票」 |
| `/notebook 要買` | todo 「notebook 要買」 |
| `/筆記本要買` | todo 「筆記本要買」 |

#### Scenario: Note alias from the group

- **WHEN** a member sends `/note 讓觀眾投票`
- **THEN** an idea 「讓觀眾投票」 exists and the bot replies 「已存進靈感庫」
