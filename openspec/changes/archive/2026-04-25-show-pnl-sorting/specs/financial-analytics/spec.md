## ADDED Requirements

### Requirement: Sortable per-show P&L table columns

The per-show profit and loss table SHALL allow the user to sort rows by any of its four data columns (show name, income, expense, net profit) via clicking the column header. The totals row SHALL always remain pinned at the bottom and SHALL NOT participate in sorting.

The show name column SHALL be sorted using locale-aware string comparison to support Traditional Chinese ordering. The expense column SHALL be sorted by absolute value (since expenses are stored as negative numbers) so that descending order places the largest spending first.

Clicking the currently active sort column SHALL toggle its direction between ascending and descending. Clicking any other column SHALL activate that column using its default direction: ascending for the show name column, descending for the three numeric columns.

The active sort column SHALL be visually indicated with a direction arrow (`▲` for ascending, `▼` for descending) next to its header, and its header text SHALL be bolded. Inactive column headers SHALL NOT display an arrow.

#### Scenario: Initial table state

- **WHEN** the user opens the Financial Analytics page
- **THEN** the per-show P&L table SHALL be sorted by net profit in descending order, with the most profitable show at the top and the totals row pinned at the bottom

#### Scenario: Click inactive column header

- **WHEN** the user clicks the "收入" column header while the table is sorted by net profit
- **THEN** the table SHALL re-sort by income in descending order (income column's default direction), the arrow indicator SHALL move to the income header, and the net profit header SHALL lose its active styling

#### Scenario: Click active column header

- **WHEN** the user clicks the currently active sort column header
- **THEN** the sort direction SHALL toggle between ascending and descending, and the arrow indicator SHALL update accordingly

#### Scenario: Sort show name column with Chinese names

- **WHEN** the user clicks the "專案" column header to sort by show name
- **THEN** shows SHALL be ordered using locale-aware comparison so that Traditional Chinese show names sort correctly

#### Scenario: Sort expense column uses absolute values

- **WHEN** the user sorts the "支出" column in descending order
- **THEN** the show with the largest total spending (largest absolute expense value) SHALL appear at the top

#### Scenario: Totals row stays pinned

- **WHEN** the user sorts by any column in any direction
- **THEN** the totals row SHALL remain as the last row of the table regardless of its own aggregated values

#### Scenario: No sort state persistence across reload

- **WHEN** the user changes the sort to income ascending, then reloads the page
- **THEN** the table SHALL return to the initial state (net profit descending), discarding the prior sort choice
