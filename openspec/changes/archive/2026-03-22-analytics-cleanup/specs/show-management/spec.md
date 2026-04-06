## MODIFIED Requirements

### Requirement: Default project list

The system SHALL initialize the project list with the following default projects in this order:

1. 周邊商品收支
2. 看我笑話年度大會｜看我畫大餅
3. 看我笑話第 2 季 Opening Party
4. 看我笑話 4 月號
5. 看我笑話 5 月號
6. 看我笑話 6 月號
7. 看我笑話 7 月號
8. 看我笑話 8 月號
9. 看我笑話 9 月號
10. 看我笑話 10 月號
11. 看我笑話 11 月號
12. 看我笑話 12 月號
13. 看我笑話第 2 季 After Party

The project "會員與其他收支" SHALL NOT be included in the default list.

#### Scenario: Default projects created on setup

- **WHEN** the system initializes a fresh project list
- **THEN** the projects are created in the order listed above without "會員與其他收支"
