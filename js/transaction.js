// ============================================================
// 看我笑話工作室 — 收支紀錄頁
// ============================================================

(async function () {
  checkAuth();
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

  // Render default category select (expense)
  const categoryContainer = document.getElementById('tx-category-container');
  if (categoryContainer) {
    categoryContainer.innerHTML = createCategorySelect('tx-category', 'expense', '');
  }

  // Initialize allocation checkbox grid (default all checked)
  createMemberCheckboxGrid('tx-allocation-container', '');

  // Toggle buttons
  const toggleBtns = document.querySelectorAll('#tx-type-toggle .toggle-btn');
  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      toggleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTxType = btn.dataset.type;
      updateCategorySelect('tx-category', currentTxType === 'income' ? 'income' : 'expense', '');
      toggleAllocationFields();
    });
  });

  // Submit handler
  document.getElementById('tx-submit').addEventListener('click', submitTransaction);

  // Cancel edit handler
  document.getElementById('tx-cancel').addEventListener('click', cancelEdit);

  // Close action menus on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.tx-actions')) {
      document.querySelectorAll('.action-menu.open').forEach(m => m.classList.remove('open'));
    }
  });
})();

let currentShow = '';
let currentTxType = 'expense';
let editingId = null;

function toggleAllocationFields() {
  const memberGroup = document.getElementById('tx-member-group');
  const allocationGroup = document.getElementById('tx-allocation-group');
  if (currentTxType === 'income') {
    memberGroup.style.display = 'none';
    allocationGroup.style.display = 'block';
  } else {
    memberGroup.style.display = 'block';
    allocationGroup.style.display = 'none';
  }
}

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
  cancelEdit();
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

  // Legacy compatibility: map v1 data
  transactions.forEach(t => {
    if (!t.category && t.item) {
      t.category = t.amount >= 0 ? '其他收入' : '其他支出';
      t.notes = t.item;
    }
  });

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
              <th>分類</th>
              <th>備註</th>
              <th>金額</th>
              <th>分配/墊款</th>
              <th>日期</th>
              <th>結清</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${transactions.map(t => `
              <tr class="${!t.settled && t.advancedBy ? 'unsettled' : ''}" data-id="${t.id}">
                <td>${escapeHtml(t.category || '')}</td>
                <td>${escapeHtml(t.notes || '')}</td>
                <td class="${amountClass(t.amount)}">${formatAmount(t.amount)}</td>
                <td>${formatAllocCell(t)}</td>
                <td>${t.date || ''}</td>
                <td>
                  ${t.advancedBy
                    ? `<button class="btn-settle ${t.settled ? 'settled' : ''}" data-id="${t.id}" data-settled="${t.settled}">
                        ${t.settled ? '已結清' : '未結清'}
                       </button>`
                    : '<span style="color: var(--text-light);">—</span>'
                  }
                </td>
                <td>
                  <div class="tx-actions">
                    <button class="btn-actions" data-id="${t.id}">⋯</button>
                    <div class="action-menu" id="menu-${t.id}">
                      <button class="action-menu-item btn-edit" data-id="${t.id}" data-category="${escapeAttr(t.category || '')}" data-notes="${escapeAttr(t.notes || '')}" data-amount="${t.amount}" data-advanced-by="${escapeAttr(t.advancedBy || '')}" data-excluded-members="${escapeAttr(t.excludedMembers || '')}" data-date="${t.date || ''}" data-recorded-by="${escapeAttr(t.recordedBy || '')}">編輯</button>
                      <button class="action-menu-item danger btn-delete" data-id="${t.id}">刪除</button>
                    </div>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Bind settle buttons (Optimistic UI)
  list.querySelectorAll('.btn-settle').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = Number(btn.dataset.id);
      const currentlySettled = btn.dataset.settled === 'true';
      const newSettled = !currentlySettled;

      // Optimistic update
      btn.textContent = newSettled ? '已結清' : '未結清';
      btn.classList.toggle('settled', newSettled);
      btn.dataset.settled = String(newSettled);
      const row = btn.closest('tr');
      if (row) row.classList.toggle('unsettled', !newSettled);

      // Background API call
      try {
        const res = await API.updateTransaction(id, { settled: newSettled });
        if (!res.success) throw new Error(res.error);
      } catch (e) {
        // Rollback
        btn.textContent = currentlySettled ? '已結清' : '未結清';
        btn.classList.toggle('settled', currentlySettled);
        btn.dataset.settled = String(currentlySettled);
        if (row) row.classList.toggle('unsettled', !currentlySettled && !!btn.closest('tr'));
        alert('更新結清狀態失敗，請重試');
      }
    });
  });

  // Bind action menu toggle
  list.querySelectorAll('.btn-actions').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const menu = document.getElementById(`menu-${btn.dataset.id}`);
      // Close other menus
      document.querySelectorAll('.action-menu.open').forEach(m => {
        if (m !== menu) m.classList.remove('open');
      });
      menu.classList.toggle('open');
    });
  });

  // Bind edit buttons
  list.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', () => {
      const data = btn.dataset;
      startEdit(Number(data.id), data.category, data.notes, Number(data.amount), data.advancedBy, data.excludedMembers, data.date, data.recordedBy);
      document.querySelectorAll('.action-menu.open').forEach(m => m.classList.remove('open'));
    });
  });

  // Bind delete buttons
  list.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', async () => {
      document.querySelectorAll('.action-menu.open').forEach(m => m.classList.remove('open'));
      if (!confirm('確定要刪除這筆紀錄嗎？')) return;
      const id = Number(btn.dataset.id);
      const res = await API.deleteTransaction(id);
      if (res.success) {
        await loadTransactions();
      } else {
        alert('刪除失敗：' + (res.error || '未知錯誤'));
      }
    });
  });
}

function startEdit(id, category, notes, amount, advancedBy, excludedMembers, date, recordedBy) {
  editingId = id;
  const isIncome = amount > 0;

  // Set toggle
  currentTxType = isIncome ? 'income' : 'expense';
  const toggleBtns = document.querySelectorAll('#tx-type-toggle .toggle-btn');
  toggleBtns.forEach(b => {
    b.classList.toggle('active', b.dataset.type === currentTxType);
  });

  // Toggle allocation/member fields
  toggleAllocationFields();

  // Set category
  updateCategorySelect('tx-category', isIncome ? 'income' : 'expense', category);

  // Set notes
  document.getElementById('tx-notes').value = notes || '';

  // Set amount (always positive in the field)
  document.getElementById('tx-amount').value = Math.abs(amount);

  // Set member or allocation
  if (isIncome) {
    createMemberCheckboxGrid('tx-allocation-container', excludedMembers || '');
  } else {
    setMemberValue('tx-member', advancedBy);
  }

  // Set date
  document.getElementById('tx-date').value = date || '';

  // Set recorder
  setMemberValue('tx-recorder', recordedBy);

  // Update UI
  document.getElementById('form-title').textContent = '編輯收支';
  document.getElementById('tx-submit').textContent = '更新';
  document.getElementById('tx-cancel').style.display = 'inline-block';

  // Scroll to form
  document.getElementById('add-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function cancelEdit() {
  editingId = null;

  // Reset toggle to expense
  currentTxType = 'expense';
  const toggleBtns = document.querySelectorAll('#tx-type-toggle .toggle-btn');
  toggleBtns.forEach(b => {
    b.classList.toggle('active', b.dataset.type === 'expense');
  });

  // Reset allocation/member fields
  toggleAllocationFields();
  createMemberCheckboxGrid('tx-allocation-container', '');

  // Reset category
  updateCategorySelect('tx-category', 'expense', '');

  // Reset fields
  document.getElementById('tx-notes').value = '';
  document.getElementById('tx-amount').value = '';
  document.getElementById('tx-date').value = new Date().toISOString().split('T')[0];

  const memberSelect = document.getElementById('tx-member');
  if (memberSelect) memberSelect.value = '';
  const memberOther = document.getElementById('tx-member-other');
  if (memberOther) { memberOther.value = ''; memberOther.classList.remove('active'); }

  const recorderSelect = document.getElementById('tx-recorder');
  if (recorderSelect) recorderSelect.value = '';
  const recorderOther = document.getElementById('tx-recorder-other');
  if (recorderOther) { recorderOther.value = ''; recorderOther.classList.remove('active'); }

  // Update UI
  document.getElementById('form-title').textContent = '新增收支';
  document.getElementById('tx-submit').textContent = '新增';
  document.getElementById('tx-cancel').style.display = 'none';
}

function setMemberValue(id, value) {
  const select = document.getElementById(id);
  const otherInput = document.getElementById(`${id}-other`);
  if (!select) return;

  if (!value) {
    select.value = '';
    if (otherInput) { otherInput.value = ''; otherInput.classList.remove('active'); }
    return;
  }

  // Check if value is in MEMBERS list
  const isKnownMember = MEMBERS.includes(value);
  if (isKnownMember) {
    select.value = value;
    if (otherInput) { otherInput.value = ''; otherInput.classList.remove('active'); }
  } else {
    select.value = '__other__';
    if (otherInput) { otherInput.value = value; otherInput.classList.add('active'); }
  }
}

async function submitTransaction() {
  const category = document.getElementById('tx-category').value;
  const notes = document.getElementById('tx-notes').value.trim();
  const rawAmount = Number(document.getElementById('tx-amount').value);
  const isIncome = currentTxType === 'income';
  const advancedBy = isIncome ? '' : getMemberValue('tx-member');
  const excludedMembers = isIncome ? getExcludedMembers('tx-allocation-container') : '';
  const date = document.getElementById('tx-date').value;
  const recordedBy = getMemberValue('tx-recorder');

  if (!category || isNaN(rawAmount) || rawAmount <= 0) {
    alert('請選擇分類並填寫金額（正數）');
    return;
  }

  // Apply sign based on toggle
  const amount = isIncome ? rawAmount : -rawAmount;

  const btn = document.getElementById('tx-submit');
  btn.disabled = true;
  btn.textContent = editingId ? '更新中...' : '新增中...';

  if (editingId) {
    // Update existing
    await API.updateTransaction(editingId, {
      category,
      notes,
      amount,
      advancedBy,
      excludedMembers,
      date,
      recordedBy,
    });
    cancelEdit();
  } else {
    // Add new
    await API.addTransaction({
      showName: currentShow,
      category,
      notes,
      amount,
      advancedBy,
      excludedMembers,
      date,
      recordedBy,
    });

    // Reset form (keep toggle and date)
    updateCategorySelect('tx-category', isIncome ? 'income' : 'expense', '');
    document.getElementById('tx-notes').value = '';
    document.getElementById('tx-amount').value = '';
    document.getElementById('tx-date').value = new Date().toISOString().split('T')[0];
    if (isIncome) {
      createMemberCheckboxGrid('tx-allocation-container', '');
    } else {
      const memberSelect = document.getElementById('tx-member');
      if (memberSelect) memberSelect.value = '';
    }
    const recorderSelect = document.getElementById('tx-recorder');
    if (recorderSelect) recorderSelect.value = '';
  }

  btn.disabled = false;
  btn.textContent = '新增';

  await loadTransactions();
}

function formatAllocCell(t) {
  if (t.amount > 0) {
    // Income
    if (!t.excludedMembers) return '全員';
    const excluded = t.excludedMembers.split(',').map(s => s.trim());
    const included = MEMBERS.filter(m => !excluded.includes(m));
    const count = included.length;
    return `<span class="alloc-cell">${count}/${MEMBERS.length} 人<span class="alloc-tooltip">${included.join('、')}</span></span>`;
  }
  // Expense
  if (t.advancedBy) return escapeHtml(t.advancedBy) + '(墊)';
  return '—';
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function escapeAttr(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
