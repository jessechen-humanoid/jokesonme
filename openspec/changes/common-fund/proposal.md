# common-fund

## Why

看我笑話工作室決定將「純共同淨利」的 20% 提撥為「看我笑話共同基金」，作為團隊未來營運的儲備資本。目前財務分析頁面只有總淨利，沒有區分「全員共同」與「部分成員」的收支，無法正確計算基金提撥金額，也無法反映扣除基金後的成員實際分配數字。

## What Changes

1. 財務分析頁面新增「共同基金」區塊，顯示共同收入、共同支出、共同淨利、提撥 20% 金額
2. 成員年度報表「年度淨利」欄位更名為「年度分配淨利」，計算邏輯改為扣除共同基金提撥後的金額
3. 需匯款金額連動更新
4. Google Sheet 上也要能看到共同基金相關數字

## Capabilities

### New Capabilities

- `common-fund-calculation`: 從所有交易中篩選 excludedMembers 為空的交易，計算共同收入、共同支出、共同淨利，並提撥 20% 為共同基金

### Modified Capabilities

- `financial-analytics`: 新增共同基金區塊顯示
- `per-member-projected-earnings`: 「年度淨利」改為「年度分配淨利」，共同部分先扣 20% 再均分，非共同部分不受影響

## Impact

- Affected specs: `financial-analytics`, `per-member-projected-earnings`
- Affected code: `js/analytics.js`, `analytics.html`, `gas/Code.gs`
