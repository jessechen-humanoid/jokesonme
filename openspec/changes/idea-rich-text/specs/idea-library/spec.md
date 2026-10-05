## ADDED Requirements

### Requirement: Idea text renders Markdown

Idea cards SHALL render idea text as a safe Markdown subset: headings (`#`, `##`, `###` at line start followed by a space), `**bold**`, `*italic*`, inline `` `code` ``, unordered lists (`- ` or `* `), ordered lists (`1. `), blockquotes (`> `), horizontal rules (a line of three or more `-`), `[text](https://…)` links, and bare `http(s)` URLs as links. Line breaks inside a paragraph SHALL be kept. Any other text, including raw HTML, SHALL be shown as plain text. Rendering SHALL use only the four-step type scale. The edit sheet SHALL show the raw text.

##### Example: parsing

| Idea text | Rendered as |
| --------- | ----------- |
| `## 規則\n- 兩隊輪流\n- **限時** 1 分鐘` | heading 「規則」, list of 2 items, second has bold 「限時」 |
| `第一行\n第二行` | one paragraph with a line break |
| `<b>x</b>` | the literal text `<b>x</b>` |
| `-` | the literal text `-` (not an empty list item) |

#### Scenario: Open the idea library

- **WHEN** a member opens 靈感 and an idea contains `- 題目 1` and `- 題目 2` on separate lines
- **THEN** the card shows a two-item bulleted list
