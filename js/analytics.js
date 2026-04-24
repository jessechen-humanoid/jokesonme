// ============================================================
// 看我笑話工作室 — 財務分析頁
// ============================================================

const PIE_COLORS_INCOME = ['#2d4d37', '#4A7C59', '#6a9879', '#8fb29a', '#b4ccba', '#d9e6dc'];
const PIE_COLORS_EXPENSE = ['#6b2820', '#B04237', '#c56d62', '#d6958d', '#e6bdb8', '#f2dbd7'];

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
  const earningsEl = document.getElementById('member-earnings');

  summaryEl.innerHTML = '<div class="loading">載入中...</div>';

  const [txRes, stRes] = await Promise.all([API.getTransactions(), API.getSettlements()]);
  if (!txRes.success) {
    summaryEl.innerHTML = '<div class="empty-state">載入失敗</div>';
    return;
  }

  const transactions = txRes.data;
  const settlements = stRes.success ? stRes.data : [];

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

  // ---- Common Fund (共同基金) ----
  const COMMON_FUND_RATE = 0.2;
  const isShared = t => !t.excludedMembers || t.excludedMembers.trim() === '';
  // paidByFund 支出不計入共同支出（避免雙扣）；保留用於計算基金已動用
  const commonIncome = transactions.filter(t => t.amount > 0 && isShared(t) && !t.paidByFund).reduce((s, t) => s + t.amount, 0);
  const commonExpense = transactions.filter(t => t.amount < 0 && isShared(t) && !t.paidByFund).reduce((s, t) => s + t.amount, 0);
  const commonNetProfit = commonIncome + commonExpense;
  const fundReserved = commonNetProfit * COMMON_FUND_RATE;
  const fundUsed = transactions.filter(t => t.amount < 0 && t.paidByFund).reduce((s, t) => s + Math.abs(t.amount), 0);
  const fundBalance = fundReserved - fundUsed;
  const distributableCommonNet = commonNetProfit * (1 - COMMON_FUND_RATE);

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

  renderCommonFund(commonIncome, commonExpense, commonNetProfit, fundReserved, fundUsed, fundBalance, document.getElementById('common-fund'));

  renderShowPnl(transactions, showPnlEl);

  renderPieChart(
    transactions.filter(t => t.amount > 0), totalIncome,
    INCOME_CATEGORIES, incomeEl, '收入佔比', 'income'
  );
  renderPieChart(
    transactions.filter(t => t.amount < 0), Math.abs(totalExpense),
    EXPENSE_CATEGORIES, expenseEl, '支出佔比', 'expense'
  );

  renderMemberEarnings(transactions, settlements, distributableCommonNet, earningsEl);
}

// ---- Common Fund ----

function renderCommonFund(income, expense, netProfit, fundReserved, fundUsed, fundBalance, el) {
  if (!el) return;
  el.innerHTML = `
    <div class="card">
      <div class="card-title">看我笑話共同基金</div>
      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-label">共同收入</div>
          <div class="stat-value positive">${formatAmount(income)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">共同支出</div>
          <div class="stat-value negative">${formatAmount(expense)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">共同淨利</div>
          <div class="stat-value ${netProfit >= 0 ? 'positive' : 'negative'}">${formatAmount(netProfit)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">提撥 20%（累積）</div>
          <div class="stat-value ${fundReserved >= 0 ? 'positive' : 'negative'}">${formatAmount(fundReserved)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">基金已動用</div>
          <div class="stat-value negative">${formatAmount(-fundUsed)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">基金餘額</div>
          <div class="stat-value ${fundBalance >= 0 ? 'positive' : 'negative'}">${formatAmount(fundBalance)}</div>
        </div>
      </div>
    </div>
  `;
}

// ---- Per-show P&L ----

let showPnlSortState = { column: 'net', direction: 'desc' };

function getDefaultDirection(column) {
  return column === 'name' ? 'asc' : 'desc';
}

function sortShows(shows, sortState) {
  const { column, direction } = sortState;
  const mul = direction === 'asc' ? 1 : -1;
  const sorted = shows.slice();
  sorted.sort((a, b) => {
    if (column === 'name') return a.name.localeCompare(b.name, 'zh-Hant') * mul;
    if (column === 'expense') return (Math.abs(a.expense) - Math.abs(b.expense)) * mul;
    return (a[column] - b[column]) * mul;
  });
  return sorted;
}

function renderShowPnl(transactions, el) {
  const showMap = {};
  transactions.forEach(t => {
    if (!showMap[t.showName]) showMap[t.showName] = { income: 0, expense: 0 };
    if (t.amount > 0) showMap[t.showName].income += t.amount;
    else showMap[t.showName].expense += t.amount;
  });

  const shows = Object.entries(showMap).map(([name, data]) => ({
    name, income: data.income, expense: data.expense, net: data.income + data.expense,
  }));

  const totals = shows.reduce((acc, s) => ({
    income: acc.income + s.income, expense: acc.expense + s.expense, net: acc.net + s.net,
  }), { income: 0, expense: 0, net: 0 });

  function renderHeader(key, label, align) {
    const active = showPnlSortState.column === key;
    const arrow = active ? (showPnlSortState.direction === 'asc' ? ' ▲' : ' ▼') : '';
    const style = [
      align === 'right' ? 'text-align:right' : '',
      'cursor:pointer',
      'user-select:none',
      active ? 'font-weight:600' : '',
    ].filter(Boolean).join(';');
    return `<th data-sort-key="${key}" style="${style}">${label}${arrow}</th>`;
  }

  function rerender() {
    const sorted = sortShows(shows, showPnlSortState);
    el.innerHTML = `
      <div class="card">
        <div class="card-title">各專案損益</div>
        <div class="table-wrapper"><table>
          <thead><tr>
            ${renderHeader('name', '專案', 'left')}
            ${renderHeader('income', '收入', 'right')}
            ${renderHeader('expense', '支出', 'right')}
            ${renderHeader('net', '淨利', 'right')}
          </tr></thead>
          <tbody>
            ${sorted.map(s => `<tr>
              <td>${escapeHtml(s.name)}</td>
              <td class="amount-positive" style="text-align:right">${formatAmount(s.income)}</td>
              <td class="amount-negative" style="text-align:right">${formatAmount(s.expense)}</td>
              <td class="${s.net >= 0 ? 'amount-positive' : 'amount-negative'}" style="text-align:right;font-weight:600">${formatAmount(s.net)}</td>
            </tr>`).join('')}
            <tr class="totals-row">
              <td>合計</td>
              <td class="amount-positive" style="text-align:right">${formatAmount(totals.income)}</td>
              <td class="amount-negative" style="text-align:right">${formatAmount(totals.expense)}</td>
              <td class="${totals.net >= 0 ? 'amount-positive' : 'amount-negative'}" style="text-align:right">${formatAmount(totals.net)}</td>
            </tr>
          </tbody>
        </table></div>
      </div>
    `;
    el.querySelectorAll('th[data-sort-key]').forEach(th => {
      th.addEventListener('click', () => handleSortClick(th.dataset.sortKey));
    });
  }

  function handleSortClick(column) {
    if (showPnlSortState.column === column) {
      showPnlSortState.direction = showPnlSortState.direction === 'asc' ? 'desc' : 'asc';
    } else {
      showPnlSortState.column = column;
      showPnlSortState.direction = getDefaultDirection(column);
    }
    rerender();
  }

  rerender();
}

// ---- Pie Chart ----

function renderPieChart(items, total, fixedCategories, el, title, type) {
  if (total === 0) {
    el.innerHTML = `<div class="card"><div class="card-title">${title}</div>
      <div style="padding:16px 0;color:var(--text-light);font-size:13px;">尚無${type === 'income' ? '收入' : '支出'}紀錄</div></div>`;
    return;
  }

  const groups = {};
  fixedCategories.forEach(c => { groups[c] = 0; });
  items.forEach(t => {
    const key = t.category || (type === 'income' ? '其他收入' : '其他支出');
    if (groups[key] !== undefined) groups[key] += Math.abs(t.amount);
    else {
      const fb = type === 'income' ? '其他收入' : '其他支出';
      groups[fb] = (groups[fb] || 0) + Math.abs(t.amount);
    }
  });

  const sorted = fixedCategories
    .map(name => ({ name, amount: groups[name], pct: groups[name] / total * 100 }))
    .filter(item => item.amount > 0)
    .sort((a, b) => b.pct - a.pct);

  const canvasId = `pie-${type}`;
  const colors = type === 'income' ? PIE_COLORS_INCOME : PIE_COLORS_EXPENSE;
  el.innerHTML = `<div class="card"><div class="card-title">${title}</div>
    <div class="pie-chart-container">
      <canvas id="${canvasId}" width="200" height="200"></canvas>
      <div class="pie-legend">
        ${sorted.map((item, i) => `<div class="pie-legend-item">
          <div class="pie-legend-color" style="background:${colors[i % colors.length]}"></div>
          <span class="pie-legend-label">${escapeHtml(item.name)}</span>
          <span class="pie-legend-value">$${item.amount.toLocaleString()} (${item.pct.toFixed(1)}%)</span>
        </div>`).join('')}
      </div>
    </div>
  </div>`;

  drawPie(canvasId, sorted, colors);
}

function drawPie(canvasId, data, colors) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const cx = 100, cy = 100, r = 90;
  const total = data.reduce((s, d) => s + d.amount, 0);
  let startAngle = -Math.PI / 2;

  data.forEach((item, i) => {
    const sliceAngle = (item.amount / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, startAngle, startAngle + sliceAngle);
    ctx.closePath();
    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();
    startAngle += sliceAngle;
  });

  // White center for donut effect
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.5, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
}

// ---- Member Earnings (5 columns + settlement) ----

function renderMemberEarnings(transactions, settlements, distributableCommonNet, el) {
  if (!el) return;

  // Split transactions into shared (all members) vs non-shared
  const isShared = t => !t.excludedMembers || t.excludedMembers.trim() === '';

  // Non-shared income per member (only transactions with excludedMembers)
  const memberNonSharedIncome = {};
  MEMBERS.forEach(m => { memberNonSharedIncome[m] = 0; });
  transactions.filter(t => t.amount > 0 && !isShared(t)).forEach(t => {
    const excluded = t.excludedMembers.split(',').map(s => s.trim()).filter(Boolean);
    const included = MEMBERS.filter(m => !excluded.includes(m));
    const share = included.length > 0 ? t.amount / included.length : 0;
    included.forEach(m => { memberNonSharedIncome[m] += share; });
  });

  // Non-shared expense per member
  const memberNonSharedExpense = {};
  MEMBERS.forEach(m => { memberNonSharedExpense[m] = 0; });
  transactions.filter(t => t.amount < 0 && !isShared(t)).forEach(t => {
    const excluded = t.excludedMembers.split(',').map(s => s.trim()).filter(Boolean);
    const included = MEMBERS.filter(m => !excluded.includes(m));
    const share = included.length > 0 ? t.amount / included.length : 0;
    included.forEach(m => { memberNonSharedExpense[m] += share; });
  });

  // Settlements per member
  const memberSettled = {};
  MEMBERS.forEach(m => { memberSettled[m] = 0; });
  settlements.forEach(s => {
    if (memberSettled[s.member] !== undefined) memberSettled[s.member] += Number(s.amount) || 0;
  });

  // Unsettled advances per member
  const memberAdvances = {};
  MEMBERS.forEach(m => { memberAdvances[m] = 0; });
  transactions.filter(t => t.advancedBy && !t.settled).forEach(t => {
    if (memberAdvances[t.advancedBy] !== undefined) memberAdvances[t.advancedBy] += Math.abs(t.amount);
  });

  const members = MEMBERS.map(m => {
    const commonShare = distributableCommonNet / MEMBERS.length;
    const nonSharedShare = memberNonSharedIncome[m] + memberNonSharedExpense[m];
    const annualNet = Math.round(commonShare + nonSharedShare);
    const settled = Math.round(memberSettled[m]);
    const unsettledNet = annualNet - settled;
    const advances = Math.round(memberAdvances[m]);
    const toPay = unsettledNet + advances;
    return { name: m, settled, unsettledNet, advances, toPay, annualNet };
  });

  el.innerHTML = `
    <div class="card">
      <div class="card-title">成員年度報表</div>
      <div class="table-wrapper"><table>
        <thead><tr>
          <th>成員</th>
          <th style="text-align:right">已收款淨利</th>
          <th style="text-align:right">未收款淨利</th>
          <th style="text-align:right">代墊未結清</th>
          <th style="text-align:right">需匯款金額</th>
          <th style="text-align:right">年度分配淨利</th>
        </tr></thead>
        <tbody>
          ${members.map(m => `<tr>
            <td>${escapeHtml(m.name)}</td>
            <td style="text-align:right;color:var(--text-light)">${formatAmount(m.settled)}</td>
            <td class="${m.unsettledNet >= 0 ? 'amount-positive' : 'amount-negative'}" style="text-align:right">${formatAmount(m.unsettledNet)}</td>
            <td style="text-align:right;${m.advances > 0 ? 'color:var(--red)' : 'color:var(--text-light)'}">${m.advances > 0 ? '$' + m.advances.toLocaleString() : '$0'}</td>
            <td class="${m.toPay >= 0 ? 'amount-positive' : 'amount-negative'}" style="text-align:right;font-weight:600">${formatAmount(m.toPay)}</td>
            <td class="${m.annualNet >= 0 ? 'amount-positive' : 'amount-negative'}" style="text-align:right;font-weight:600">${formatAmount(m.annualNet)}</td>
          </tr>`).join('')}
        </tbody>
      </table></div>
      <div style="margin-top:16px">
        <button class="btn btn-primary btn-sm" onclick="showSettlementModal()">新增結算</button>
      </div>
    </div>
  `;
}

// ---- Settlement Modal ----

function showSettlementModal() {
  let overlay = document.getElementById('modal-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'modal-overlay';
    overlay.className = 'modal-overlay';
    document.body.appendChild(overlay);
  }

  const today = new Date().toISOString().split('T')[0];
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-title">新增結算</div>
      <div class="form-group">
        <label class="form-label">成員</label>
        ${createMemberSelect('settlement-member', '', { includeEmpty: true, includeOther: false })}
      </div>
      <div class="form-group">
        <label class="form-label">金額</label>
        <input type="number" class="form-control" id="settlement-amount" min="0" placeholder="例：10000">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">日期</label>
          <input type="date" class="form-control" id="settlement-date" value="${today}">
        </div>
        <div class="form-group">
          <label class="form-label">備註（選填）</label>
          <input type="text" class="form-control" id="settlement-notes" placeholder="例：3月結算">
        </div>
      </div>
      <div class="modal-actions">
        <button class="btn btn-secondary" id="settlement-cancel">取消</button>
        <button class="btn btn-primary" id="settlement-submit">新增</button>
      </div>
    </div>
  `;
  overlay.classList.add('active');

  document.getElementById('settlement-cancel').addEventListener('click', () => overlay.classList.remove('active'));
  document.getElementById('settlement-submit').addEventListener('click', submitSettlement);
}

async function submitSettlement() {
  const member = document.getElementById('settlement-member').value;
  const amount = Number(document.getElementById('settlement-amount').value);
  const date = document.getElementById('settlement-date').value;
  const notes = document.getElementById('settlement-notes').value.trim();

  if (!member || !amount || amount <= 0) {
    alert('請選擇成員並輸入金額');
    return;
  }

  const btn = document.getElementById('settlement-submit');
  btn.disabled = true;
  btn.textContent = '送出中...';

  const res = await API.addSettlement({ member, amount, date, notes });
  if (res.success) {
    document.getElementById('modal-overlay').classList.remove('active');
    await loadAnalytics();
  } else {
    alert('新增失敗：' + (res.error || '未知錯誤'));
    btn.disabled = false;
    btn.textContent = '新增';
  }
}

// ---- Utilities ----

function formatAmountAbs(amount) {
  return '$' + Math.abs(amount).toLocaleString();
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
