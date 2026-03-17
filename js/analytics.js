// ============================================================
// 看我笑話工作室 — 財務分析頁
// ============================================================

(async function () {
  renderNav('analytics');
  await loadAnalytics();
})();

async function loadAnalytics() {
  const summaryEl = document.getElementById('summary-stats');
  const showPnlEl = document.getElementById('show-pnl');
  const incomeEl = document.getElementById('income-breakdown');
  const expenseEl = document.getElementById('expense-breakdown');
  const unsettledEl = document.getElementById('unsettled-advances');
  const monthlyEl = document.getElementById('monthly-breakdown');

  summaryEl.innerHTML = '<div class="loading">載入中...</div>';

  const res = await API.getTransactions();
  if (!res.success) {
    summaryEl.innerHTML = '<div class="empty-state">載入失敗</div>';
    return;
  }

  const transactions = res.data;
  if (transactions.length === 0) {
    summaryEl.innerHTML = '<div class="empty-state">尚無收支紀錄</div>';
    showPnlEl.innerHTML = '';
    incomeEl.innerHTML = '';
    expenseEl.innerHTML = '';
    unsettledEl.innerHTML = '';
    monthlyEl.innerHTML = '';
    return;
  }

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

  // ---- Income Breakdown ----
  renderBreakdown(
    transactions.filter(t => t.amount > 0),
    totalIncome,
    incomeEl,
    '收入佔比',
    'income'
  );

  // ---- Expense Breakdown ----
  renderBreakdown(
    transactions.filter(t => t.amount < 0),
    Math.abs(totalExpense),
    expenseEl,
    '支出佔比',
    'expense'
  );

  // ---- Unsettled Advances ----
  renderUnsettled(transactions, unsettledEl);

  // ---- Monthly Breakdown ----
  renderMonthly(transactions, monthlyEl);
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

  el.innerHTML = `
    <div class="card">
      <div class="card-title">各檔演出損益</div>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>演出</th>
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
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderBreakdown(items, total, el, title, type) {
  if (items.length === 0 || total === 0) {
    el.innerHTML = '';
    return;
  }

  // Group by item name
  const groups = {};
  items.forEach(t => {
    const key = t.item || '未分類';
    if (!groups[key]) groups[key] = 0;
    groups[key] += Math.abs(t.amount);
  });

  const sorted = Object.entries(groups)
    .map(([name, amount]) => ({ name, amount, pct: (amount / total * 100) }))
    .sort((a, b) => b.amount - a.amount);

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

function renderUnsettled(transactions, el) {
  const unsettled = transactions.filter(t => !t.settled && t.advancedBy);

  if (unsettled.length === 0) {
    el.innerHTML = `
      <div class="card">
        <div class="card-title">墊款未結清</div>
        <div class="empty-state">所有墊款已結清</div>
      </div>
    `;
    return;
  }

  // Group by person
  const personMap = {};
  unsettled.forEach(t => {
    if (!personMap[t.advancedBy]) personMap[t.advancedBy] = { total: 0, items: [] };
    personMap[t.advancedBy].total += Math.abs(t.amount);
    personMap[t.advancedBy].items.push(t);
  });

  const persons = Object.entries(personMap)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.total - a.total);

  el.innerHTML = `
    <div class="card">
      <div class="card-title">墊款未結清</div>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>墊款人</th>
              <th style="text-align:right">未結清金額</th>
              <th>明細</th>
            </tr>
          </thead>
          <tbody>
            ${persons.map(p => `
              <tr>
                <td>${escapeHtml(p.name)}</td>
                <td class="amount-negative" style="text-align:right; font-weight:600;">NT$${p.total.toLocaleString()}</td>
                <td style="font-size:12px; color:var(--text-light);">
                  ${p.items.map(i => escapeHtml(i.item)).join('、')}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderMonthly(transactions, el) {
  // Group by month
  const monthMap = {};
  transactions.forEach(t => {
    const date = t.date || '';
    const month = date.substring(0, 7) || '未知';
    if (!monthMap[month]) monthMap[month] = { income: 0, expense: 0 };
    if (t.amount > 0) {
      monthMap[month].income += t.amount;
    } else {
      monthMap[month].expense += t.amount;
    }
  });

  const months = Object.entries(monthMap)
    .map(([month, data]) => ({
      month,
      income: data.income,
      expense: data.expense,
      net: data.income + data.expense,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  el.innerHTML = `
    <div class="card">
      <div class="card-title">月度淨利</div>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>月份</th>
              <th style="text-align:right">收入</th>
              <th style="text-align:right">支出</th>
              <th style="text-align:right">淨利</th>
            </tr>
          </thead>
          <tbody>
            ${months.map(m => `
              <tr>
                <td>${m.month}</td>
                <td class="amount-positive" style="text-align:right">${formatAmount(m.income)}</td>
                <td class="amount-negative" style="text-align:right">${formatAmount(m.expense)}</td>
                <td class="${m.net >= 0 ? 'amount-positive' : 'amount-negative'}" style="text-align:right; font-weight:600;">
                  ${formatAmount(m.net)}
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
