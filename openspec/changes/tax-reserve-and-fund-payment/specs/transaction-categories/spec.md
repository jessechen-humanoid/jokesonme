## MODIFIED Requirements

### Requirement: Fixed transaction categories

The system SHALL provide a fixed set of transaction categories, separated into income and expense types.

Income categories (6):
1. 演出票房
2. 付費會員
3. 商演合作
4. 周邊商品
5. 品牌贊助
6. 其他收入

Expense categories (8):
1. 場地租借
2. 工作人員
3. 設備道具
4. 剪輯製作
5. 行政雜支
6. 平台手續
7. 稅務預留
8. 其他支出

#### Scenario: Income categories displayed when income mode selected

- **WHEN** user selects "收入" mode on the transaction form
- **THEN** the category dropdown displays exactly 6 income categories

#### Scenario: Expense categories displayed when expense mode selected

- **WHEN** user selects "支出" mode on the transaction form
- **THEN** the category dropdown displays exactly 8 expense categories

#### Scenario: 稅務預留 category available for manual selection

- **WHEN** user opens the expense category dropdown
- **THEN** "稅務預留" appears as one of the selectable options
