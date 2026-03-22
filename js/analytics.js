// ============================================================
// 看我笑話工作室 — 財務分析頁
// ============================================================

(async function () {
  checkAuth();
  renderNav('analytics');
  await loadAnalytics();
})();

async function loadAnalytics() {
  const summaryEl = document.getElementById('summary-stats');
  const showPnlEl = document.getElementById('show-pnl');
  const incomeEl = document.getElementById('income-breakdown');
  const expenseEl = document.getElementById('expense-breakdown');
  const unsettledEl = document.getElementById('unsettled-advances');
  const earningsEl = document.getElementById('member-earnings');

  summaryEl.innerHTML = '<div class="loading">載入中...</div>';

  const res = await API.getTransactions();
  if (!res.success) {
    summaryEl.innerHTML = '<div class="empty-state">載入失敗</div>';
    return;
  }

  const transactions = res.data;

  // Legacy compatibility
  transactions.forEach(t => {
    if (!t.category && t.item) {
      t.category = t.amount >= 0 ? '其他收入' : '其他支出';
      t.notes = t.item;
    }
  });

  // ---- Year Summary ----
  const totalIncome = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0);
  const netProfit = totalIncome + totalExpense;

  summaryEl.innerHTML = `
    <div class="stat-grid">
      <div class="stat-card">
        <div class="stat-label">年度總收入</div>
        <div class="stat-value positive">${formatAmount(totalIncome)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">年度總支出</div>
        <div class="stat-value negative">${formatAmount(totalExpense)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">年度淨利</div>
        <div class="stat-value ${netProfit >= 0 ? 'positive' : 'negative'}">${formatAmount(netProfit)}</div>
      </div>
    </div>
  `;

  // ---- Per-show P&L ----
  renderShowPnl(transactions, showPnlEl);

  // ---- Income Breakdown by Category ----
  renderCategoryBreakdown(
    transactions.filter(t => t.amount > 0),
    totalIncome,
    INCOME_CATEGORIES,
    incomeEl,
    '收入佔比',
    'income'
  );

  // ---- Expense Breakdown by Category ----
  renderCategoryBreakdown(
    transactions.filter(t => t.amount < 0),
    Math.abs(totalExpense),
    EXPENSE_CATEGORIES,
    expenseEl,
    '支出佔比',
    'expense'
  );

  // ---- Advance Payments Overview ----
  renderAdvances(transactions, unsettledEl);

  // ---- Per-member Projected Net Earnings ----
  renderMemberEarnings(transactions, earningsEl);
}

function renderShowPnl(transactions, el) {
  const showMap = {};
  transactions.forEach(t => {
    if (!showMap[t.showName]) {
      showMap[t.showName] = { income: 0, expense: 0 };
    }
    if (t.amount > 0) {
      showMap[t.showName].income += t.amount;
    } else {
      showMap[t.showName].expense += t.amount;
    }
  });

  const shows = Object.entries(showMap).map(([name, data]) => ({
    name,
    income: data.income,
    expense: data.expense,
    net: data.income + data.expense,
  }));

  const totals = shows.reduce((acc, s) => ({
    income: acc.income + s.income,
    expense: acc.expense + s.expense,
    net: acc.net + s.net,
  }), { income: 0, expense: 0, net: 0 });

  el.innerHTML = `
    <div class="card">
      <div class="card-title">各專案損益</div>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>專案</th>
              <th style="text-align:right">收入</th>
              <th style="text-align:right">支出</th>
              <th style="text-align:right">淨利</th>
            </tr>
          </thead>
          <tbody>
            ${shows.map(s => `
              <tr>
                <td>${escapeHtml(s.name)}</td>
                <td class="amount-positive" style="text-align:right">${formatAmount(s.income)}</td>
                <td class="amount-negative" style="text-align:right">${formatAmount(s.expense)}</td>
                <td class="${s.net >= 0 ? 'amount-positive' : 'amount-negative'}" style="text-align:right; font-weight:600;">
                  ${formatAmount(s.net)}
                </td>
              </tr>
            `).join('')}
            <tr class="totals-row">
              <td>合計</td>
              <td class="amount-positive" style="text-align:right">${formatAmount(totals.income)}</td>
              <td class="amount-negative" style="text-align:right">${formatAmount(totals.expense)}</td>
              <td class="${totals.net >= 0 ? 'amount-positive' : 'amount-negative'}" style="text-align:right">
                ${formatAmount(totals.net)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderCategoryBreakdown(items, total, fixedCategories, el, title, type) {
  if (total === 0) {
    el.innerHTML = `
      <div class="card">
        <div class="card-title">${title}</div>
        <div style="padding: 16px 0; color: var(--text-light); font-size: 13px;">尚無${type === 'income' ? '收入' : '支出'}紀錄</div>
      </div>
    `;
    return;
  }

  // Aggregate by fixed category
  const groups = {};
  fixedCategories.forEach(c => { groups[c] = 0; });

  items.forEach(t => {
    const key = t.category || (type === 'income' ? '其他收入' : '其他支出');
    if (groups[key] !== undefined) {
      groups[key] += Math.abs(t.amount);
    } else {
      // Unknown category falls into "其他"
      const fallback = type === 'income' ? '其他收入' : '其他支出';
      groups[fallback] = (groups[fallback] || 0) + Math.abs(t.amount);
    }
  });

  const sorted = fixedCategories
    .map(name => ({ name, amount: groups[name], pct: (groups[name] / total * 100) }))
    .filter(item => item.amount > 0);

  el.innerHTML = `
    <div class="card">
      <div class="card-title">${title}</div>
      ${sorted.map(item => `
        <div class="breakdown-bar">
          <div class="breakdown-label" title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</div>
          <div class="breakdown-track">
            <div class="breakdown-fill ${type}" style="width: ${item.pct}%"></div>
          </div>
          <div class="breakdown-amount">${formatAmountAbs(item.amount)}</div>
          <div class="breakdown-pct">${item.pct.toFixed(1)}%</div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderAdvances(transactions, el) {
  const advanceTx = transactions.filter(t => t.advancedBy);

  if (advanceTx.length === 0) {
    el.innerHTML = `
      <div class="card">
        <div class="card-title">代墊追蹤</div>
        <div class="empty-state">目前沒有代墊紀錄</div>
      </div>
    `;
    return;
  }

  // Group by person
  const personMap = {};
  advanceTx.forEach(t => {
    if (!personMap[t.advancedBy]) personMap[t.advancedBy] = { unsettled: 0, settled: 0 };
    const amt = Math.abs(t.amount);
    if (t.settled) {
      personMap[t.advancedBy].settled += amt;
    } else {
      personMap[t.advancedBy].unsettled += amt;
    }
  });

  const persons = Object.entries(personMap)
    .map(([name, data]) => ({ name, unsettled: data.unsettled, settled: data.settled, total: data.unsettled + data.settled }))
    .sort((a, b) => b.total - a.total);

  const grandTotal = persons.reduce((acc, p) => ({
    unsettled: acc.unsettled + p.unsettled,
    settled: acc.settled + p.settled,
    total: acc.total + p.total,
  }), { unsettled: 0, settled: 0, total: 0 });

  el.innerHTML = `
    <div class="card">
      <div class="card-title">代墊追蹤</div>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>墊款人</th>
              <th style="text-align:right">未結清金額</th>
              <th style="text-align:right">已結清金額</th>
              <th style="text-align:right">總計</th>
            </tr>
          </thead>
          <tbody>
            ${persons.map(p => `
              <tr>
                <td>${escapeHtml(p.name)}</td>
                <td class="amount-negative" style="text-align:right">NT$${p.unsettled.toLocaleString()}</td>
                <td style="text-align:right; color: var(--text-light);">NT$${p.settled.toLocaleString()}</td>
                <td style="text-align:right; font-weight:600;">NT$${p.total.toLocaleString()}</td>
              </tr>
            `).join('')}
            <tr class="totals-row">
              <td>合計</td>
              <td class="amount-negative" style="text-align:right">NT$${grandTotal.unsettled.toLocaleString()}</td>
              <td style="text-align:right; color: var(--text-light);">NT$${grandTotal.settled.toLocaleString()}</td>
              <td style="text-align:right">NT$${grandTotal.total.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderMemberEarnings(transactions, el) {
  if (!el) return;

  const totalExpense = transactions.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0);
  const expensePerMember = totalExpense / MEMBERS.length;

  // Calculate each member's allocated income
  const memberIncome = {};
  MEMBERS.forEach(m => { memberIncome[m] = 0; });

  transactions.filter(t => t.amount > 0).forEach(t => {
    const excluded = t.excludedMembers ? t.excludedMembers.split(',').map(s => s.trim()).filter(Boolean) : [];
    const included = MEMBERS.filter(m => !excluded.includes(m));
    const share = included.length > 0 ? t.amount / included.length : 0;
    included.forEach(m => { memberIncome[m] += share; });
  });

  const members = MEMBERS.map(m => ({
    name: m,
    net: memberIncome[m] + expensePerMember,
  }));

  el.innerHTML = `
    <div class="card">
      <div class="card-title">成員年度預估淨收入</div>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>成員</th>
              <th style="text-align:right">預估淨收入</th>
            </tr>
          </thead>
          <tbody>
            ${members.map(m => `
              <tr>
                <td>${escapeHtml(m.name)}</td>
                <td class="${m.net >= 0 ? 'amount-positive' : 'amount-negative'}" style="text-align:right; font-weight:600;">
                  ${formatAmount(Math.round(m.net))}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function formatAmountAbs(amount) {
  return 'NT$' + Math.abs(amount).toLocaleString();
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
