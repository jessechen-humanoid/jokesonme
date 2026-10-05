## ADDED Requirements

### Requirement: Slash idea keeps line breaks

An idea created with `/靈感` SHALL keep the line breaks of the original LINE message. Only runs of spaces or tabs within a line SHALL be collapsed and the whole text trimmed; mention text SHALL still be removed. Todo and internal event titles SHALL remain single-line.

##### Example: multi-line idea

| Message | Saved idea text |
| ------- | --------------- |
| `/靈感 看我名場面\n題目 1. 壁咚\n題目 2. 領帶` | `看我名場面\n題目 1. 壁咚\n題目 2. 領帶` |
| `/靈感 標題\n\n  第二段` | `標題\n\n第二段` |

#### Scenario: Multi-line idea from the group

- **WHEN** a member sends a three-line message starting with `/靈感`
- **THEN** the saved idea contains the same three lines
