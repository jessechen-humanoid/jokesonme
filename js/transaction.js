// ============================================================
// 看我笑話工作室 — 收支紀錄頁
// ============================================================

(async function () {
  renderNav('transaction');
  await renderShowSelector('show-selector', onShowSelected);

  // Set default date to today
  const dateInput = document.getElementById('tx-date');
  if (dateInput) {
    dateInput.value = new Date().toISOString().split('T')[0];
  }

  // Render member selects
  const memberContainer = document.getElementById('tx-member-container');
  if (memberContainer) {
    memberContainer.innerHTML = createMemberSelect('tx-member', '', { includeEmpty: true, includeOther: true });
    setupMemberSelectOther('tx-member');
  }

  const recorderContainer = document.getElementById('tx-recorder-container');
  if (recorderContainer) {
    recorderContainer.innerHTML = createMemberSelect('tx-recorder', '', { includeEmpty: true, includeOther: true });
    setupMemberSelectOther('tx-recorder');
  }

  // Submit handler
  document.getElementById('tx-submit').addEventListener('click', addTransaction);
})();

let currentShow = '';

async function onShowSelected(showName) {
  currentShow = showName;
  const form = document.getElementById('add-form');
  const list = document.getElementById('transaction-list');

  if (!showName) {
    form.style.display = 'none';
    list.innerHTML = '';
    return;
  }

  form.style.display = 'block';
  await loadTransactions();
}

async function loadTransactions() {
  const list = document.getElementById('transaction-list');
  list.innerHTML = '<div class="loading">載入中...</div>';

  const res = await API.getTransactions(currentShow);
  if (!res.success) {
    list.innerHTML = '<div class="empty-state">載入失敗</div>';
    return;
  }

  const transactions = res.data;
  if (transactions.length === 0) {
    list.innerHTML = '<div class="empty-state">尚無收支紀錄，請新增第一筆</div>';
    return;
  }

  // Calculate summary
  const totalIncome = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0);
  const netProfit = totalIncome + totalExpense;

  list.innerHTML = `
    <div class="stat-grid" style="margin-bottom: 20px;">
      <div class="stat-card">
        <div class="stat-label">收入</div>
        <div class="stat-value positive">${formatAmount(totalIncome)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">支出</div>
        <div class="stat-value negative">${formatAmount(totalExpense)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">淨利</div>
        <div class="stat-value ${netProfit >= 0 ? 'positive' : 'negative'}">${formatAmount(netProfit)}</div>
      </div>
    </div>
    <div class="card">
      <div class="card-title">收支明細</div>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>項目</th>
              <th>金額</th>
              <th>墊款人</th>
              <th>日期</th>
              <th>結清</th>
            </tr>
          </thead>
          <tbody>
            ${transactions.map(t => `
              <tr class="${!t.settled && t.advancedBy ? 'unsettled' : ''}">
                <td>${escapeHtml(t.item)}</td>
                <td class="${amountClass(t.amount)}">${formatAmount(t.amount)}</td>
                <td>${escapeHtml(t.advancedBy) || '—'}</td>
                <td>${t.date || ''}</td>
                <td>
                  ${t.advancedBy
                    ? `<button class="btn-settle ${t.settled ? 'settled' : ''}" data-id="${t.id}" data-settled="${t.settled}">
                        ${t.settled ? '已結清' : '未結清'}
                       </button>`
                    : '<span style="color: var(--text-light);">—</span>'
                  }
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Bind settle buttons
  list.querySelectorAll('.btn-settle').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = Number(btn.dataset.id);
      const currentlySettled = btn.dataset.settled === 'true';
      btn.disabled = true;
      await API.updateTransaction(id, { settled: !currentlySettled });
      await loadTransactions();
    });
  });
}

async function addTransaction() {
  const item = document.getElementById('tx-item').value.trim();
  const amount = Number(document.getElementById('tx-amount').value);
  const advancedBy = getMemberValue('tx-member');
  const date = document.getElementById('tx-date').value;
  const recordedBy = getMemberValue('tx-recorder');

  if (!item || isNaN(amount) || amount === 0) {
    alert('請填寫項目名稱與金額');
    return;
  }

  const btn = document.getElementById('tx-submit');
  btn.disabled = true;
  btn.textContent = '新增中...';

  await API.addTransaction({
    showName: currentShow,
    item,
    amount,
    advancedBy,
    date,
    recordedBy,
  });

  // Reset form
  document.getElementById('tx-item').value = '';
  document.getElementById('tx-amount').value = '';
  document.getElementById('tx-date').value = new Date().toISOString().split('T')[0];
  const memberSelect = document.getElementById('tx-member');
  if (memberSelect) memberSelect.value = '';
  const recorderSelect = document.getElementById('tx-recorder');
  if (recorderSelect) recorderSelect.value = '';

  btn.disabled = false;
  btn.textContent = '新增';

  await loadTransactions();
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
