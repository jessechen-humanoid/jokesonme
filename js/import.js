// ============================================================
// 看我笑話工作室 — 應援金流匯入
// ============================================================

checkAuth();
renderNav('import');

// ---- State ----

let cashflowFiles = [];     // [{ name, rows: [] }]
let orderFiles = [];         // [{ name, orderType: 'ticket'|'merchandise', rows: [] }]
let matchResults = null;
let showsList = [];

// ---- Init ----

(async function init() {
  const res = await API.getShows();
  if (res.success) showsList = res.data;
  setupUploadZones();
})();

// ---- Upload Zones ----

function setupUploadZones() {
  const cfZone = document.getElementById('cashflow-zone');
  const cfInput = document.getElementById('cashflow-input');
  const orderZone = document.getElementById('order-zone');
  const orderInput = document.getElementById('order-input');

  cfZone.addEventListener('click', () => cfInput.click());
  cfZone.addEventListener('dragover', e => { e.preventDefault(); cfZone.style.borderColor = 'var(--accent)'; });
  cfZone.addEventListener('dragleave', () => { cfZone.style.borderColor = ''; });
  cfZone.addEventListener('drop', e => {
    e.preventDefault();
    cfZone.style.borderColor = '';
    Array.from(e.dataTransfer.files).forEach(f => {
      if (f.name.endsWith('.xlsx')) handleCashflowFile(f);
    });
  });
  cfInput.addEventListener('change', () => {
    Array.from(cfInput.files).forEach(f => handleCashflowFile(f));
    cfInput.value = '';
  });

  orderZone.addEventListener('click', () => orderInput.click());
  orderZone.addEventListener('dragover', e => { e.preventDefault(); orderZone.style.borderColor = 'var(--accent)'; });
  orderZone.addEventListener('dragleave', () => { orderZone.style.borderColor = ''; });
  orderZone.addEventListener('drop', e => {
    e.preventDefault();
    orderZone.style.borderColor = '';
    Array.from(e.dataTransfer.files).forEach(f => {
      if (f.name.endsWith('.csv')) handleOrderFile(f);
    });
  });
  orderInput.addEventListener('change', () => {
    Array.from(orderInput.files).forEach(f => handleOrderFile(f));
    orderInput.value = '';
  });
}

// ---- File Parsing ----

function parseXlsx(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'array' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { raw: false });
        resolve(rows);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

function parseCsv(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'string' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { raw: false });
        resolve(rows);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

// ---- Order Type Detection ----

function detectOrderType(filename) {
  if (filename.includes('票券訂單')) return 'ticket';
  if (filename.includes('應援訂單')) return 'merchandise';
  return 'ticket'; // default
}

// ---- Cashflow Deduplication ----

function getMergedCashflowRows() {
  const seen = new Set();
  const merged = [];
  cashflowFiles.forEach(cf => {
    cf.rows.forEach(r => {
      const id = r['金流編號'] || '';
      if (id && seen.has(id)) return;
      if (id) seen.add(id);
      merged.push(r);
    });
  });
  return merged;
}

// ---- File Handlers ----

async function handleCashflowFile(file) {
  if (cashflowFiles.some(f => f.name === file.name)) {
    alert('此檔案已上傳過：' + file.name);
    return;
  }
  try {
    const rows = await parseXlsx(file);
    cashflowFiles.push({ name: file.name, rows });
    document.getElementById('cashflow-zone').classList.add('has-file');
    renderUploadStatus();
    tryRunMatching();
  } catch (err) {
    alert('撥款明細解析失敗：' + err.message);
  }
}

async function handleOrderFile(file) {
  if (orderFiles.some(f => f.name === file.name)) {
    alert('此檔案已上傳過：' + file.name);
    return;
  }
  try {
    const rows = await parseCsv(file);
    const orderType = detectOrderType(file.name);
    orderFiles.push({ name: file.name, orderType, rows });
    document.getElementById('order-zone').classList.add('has-file');
    renderUploadStatus();
    tryRunMatching();
  } catch (err) {
    alert('訂單檔案解析失敗：' + err.message);
  }
}

function removeCashflowFile(idx) {
  cashflowFiles.splice(idx, 1);
  if (cashflowFiles.length === 0) {
    document.getElementById('cashflow-zone').classList.remove('has-file');
  }
  renderUploadStatus();
  tryRunMatching();
}

function removeOrderFile(idx) {
  orderFiles.splice(idx, 1);
  if (orderFiles.length === 0) {
    document.getElementById('order-zone').classList.remove('has-file');
  }
  renderUploadStatus();
  tryRunMatching();
}

// ---- Upload Status Display ----

function renderUploadStatus() {
  const container = document.getElementById('upload-status');
  let html = '';

  cashflowFiles.forEach((cf, i) => {
    const dates = cf.rows.map(r => r['建立日期'] || '').filter(Boolean).sort();
    const dateRange = dates.length ? `${dates[0].slice(0, 10)} ~ ${dates[dates.length - 1].slice(0, 10)}` : '';
    html += `<div class="upload-status-item">
      <div class="status-left">📄 ${escapeHtml(cf.name)} <span class="status-badge">(${cf.rows.length} 筆 ｜ ${dateRange})</span></div>
      <button class="btn-remove" onclick="removeCashflowFile(${i})">移除</button>
    </div>`;
  });

  if (cashflowFiles.length > 1) {
    const merged = getMergedCashflowRows();
    const total = merged.reduce((s, r) => s + (Number(r['收取金額']) || 0), 0);
    html += `<div class="upload-status-item">
      <div class="status-left">✅ 合併後（去重）</div>
      <span class="status-badge">${merged.length} 筆 ｜ $${total.toLocaleString()}</span>
    </div>`;
  } else if (cashflowFiles.length === 1) {
    const cf = cashflowFiles[0];
    const total = cf.rows.reduce((s, r) => s + (Number(r['收取金額']) || 0), 0);
    const dates = cf.rows.map(r => r['建立日期'] || '').filter(Boolean).sort();
    const dateRange = dates.length ? `${dates[0].slice(0, 10)} ~ ${dates[dates.length - 1].slice(0, 10)}` : '';
    html = `<div class="upload-status-item">
      <div class="status-left">✅ ${escapeHtml(cf.name)}</div>
      <span class="status-badge">${cf.rows.length} 筆 ｜ ${dateRange} ｜ $${total.toLocaleString()}</span>
    </div>`;
  }

  orderFiles.forEach((of, i) => {
    const icon = of.orderType === 'ticket' ? '🎫' : '🛍️';
    html += `<div class="upload-status-item">
      <div class="status-left">${icon} ${escapeHtml(of.name)} <span class="status-badge">(${of.rows.length} 筆)</span></div>
      <button class="btn-remove" onclick="removeOrderFile(${i})">移除</button>
    </div>`;
  });

  container.innerHTML = html;
}

// ---- Order Index ----

function extractItemName(rawField) {
  if (!rawField) return '未知';
  // Remove leading/trailing whitespace, then strip " x N" quantity suffix
  return rawField.trim().replace(/\s*x\s*\d+$/i, '').trim();
}

function extractGroupName(itemName) {
  // Strip seat-specific info (e.g., "B25 高腳圓桌位" → just the ticket category)
  // Pattern: " B{number} {seat type}" at any position
  return itemName.replace(/\s+B\d+\s+\S+$/, '').trim();
}

function buildOrderIndex(orderFiles) {
  const index = new Map();
  orderFiles.forEach(of => {
    of.rows.forEach(r => {
      const orderId = (r['訂單編號'] || '').trim();
      if (!orderId) return;
      let itemName;
      if (of.orderType === 'ticket') {
        itemName = extractItemName(r['票券名稱及數量']);
      } else {
        itemName = extractItemName(r['訂購商品名稱及數量']);
      }
      const groupName = extractGroupName(itemName);
      index.set(orderId, { orderType: of.orderType, itemName, groupName, sourceFile: of.name });
    });
  });
  return index;
}

// ---- Matching Logic ----

function tryRunMatching() {
  if (cashflowFiles.length === 0 || orderFiles.length === 0) {
    matchResults = null;
    document.getElementById('mapping-section').style.display = 'none';
    document.getElementById('dashboard-section').style.display = 'none';
    return;
  }
  runMatching();
}

function runMatching() {
  const rows = getMergedCashflowRows();
  const membership = [];
  const refunds = [];
  const purchases = [];

  rows.forEach(r => {
    if (r['金流狀態'] === '撥款後退款') {
      refunds.push(r);
    } else if (r['金流類型'] === '定期定額會費') {
      membership.push(r);
    } else if (r['金流類型'] === '單筆購買') {
      purchases.push(r);
    }
  });

  const orderIndex = buildOrderIndex(orderFiles);
  const byName = {};
  const unmatched = [];

  purchases.forEach(cfRow => {
    const orderId = (cfRow['訂單編號'] || '').trim();
    const match = orderIndex.get(orderId);
    if (match) {
      const name = match.groupName;
      if (!byName[name]) byName[name] = { orderType: match.orderType, rows: [] };
      byName[name].rows.push(cfRow);
    } else {
      unmatched.push(cfRow);
    }
  });

  matchResults = { membership, byName, unmatched, refunds };
  renderMappingSection();
  renderDashboard();
}

// ---- Ticket/Merchandise → Project Mapping ----

function getNameProjectMap() {
  const map = {};
  if (!matchResults) return map;
  Object.keys(matchResults.byName).forEach(name => {
    const select = document.getElementById(`mapping-${CSS.escape(name)}`);
    map[name] = select ? select.value : name;
  });
  return map;
}

function renderMappingSection() {
  const section = document.getElementById('mapping-section');
  const list = document.getElementById('mapping-list');
  const names = Object.keys(matchResults.byName);
  if (names.length === 0) { section.style.display = 'none'; return; }

  section.style.display = '';
  list.innerHTML = names.map(name => {
    const info = matchResults.byName[name];
    const icon = info.orderType === 'ticket' ? '🎫' : '🛍️';
    const count = info.rows.length;
    const options = showsList.map(s =>
      `<option value="${escapeHtml(s.name)}">${escapeHtml(s.name)}</option>`
    ).join('');
    return `<div class="mapping-row">
      <span>${icon} ${escapeHtml(name)} <span class="status-badge">(${count} 筆)</span></span>
      <span class="mapping-arrow">→</span>
      <select id="mapping-${CSS.escape(name)}" onchange="renderDashboard()">
        <option value="">— 選擇專案 —</option>
        ${options}
      </select>
    </div>`;
  }).join('');
}

function escapeHtml(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

// ---- Dashboard ----

function renderDashboard() {
  if (!matchResults) return;
  const nameProjectMap = getNameProjectMap();
  const { membership, byName, unmatched, refunds } = matchResults;
  document.getElementById('dashboard-section').style.display = '';

  const allRows = getMergedCashflowRows().filter(r => r['金流狀態'] !== '撥款後退款');
  const totalRevenue = allRows.reduce((s, r) => s + (Number(r['收取金額']) || 0), 0);
  const totalFees = allRows.reduce((s, r) => s + (Number(r['手續費']) || 0), 0);
  const totalNet = allRows.reduce((s, r) => s + (Number(r['實際收取金額']) || 0), 0);

  document.getElementById('import-stats').innerHTML = `
    <div class="stat-card"><div class="stat-label">收取金額</div><div class="stat-value positive">$${totalRevenue.toLocaleString()}</div></div>
    <div class="stat-card"><div class="stat-label">平台手續費</div><div class="stat-value negative">-$${totalFees.toLocaleString()}</div></div>
    <div class="stat-card"><div class="stat-label">實際收取</div><div class="stat-value positive">$${totalNet.toLocaleString()}</div></div>
  `;

  let breakdownHtml = `<table class="import-breakdown-table">
    <thead><tr><th>來源</th><th>筆數</th><th>收取金額</th><th>手續費</th><th>實際收取</th></tr></thead><tbody>`;
  const groups = [];

  // Membership
  if (membership.length > 0) {
    const mAmt = membership.reduce((s, r) => s + (Number(r['收取金額']) || 0), 0);
    const mFee = membership.reduce((s, r) => s + (Number(r['手續費']) || 0), 0);
    const mNet = membership.reduce((s, r) => s + (Number(r['實際收取金額']) || 0), 0);
    const plan149 = membership.filter(r => Number(r['收取金額']) === 149);
    const plan1699 = membership.filter(r => Number(r['收取金額']) === 1699);
    let detail = [];
    if (plan149.length) detail.push(`149元×${plan149.length}`);
    if (plan1699.length) detail.push(`1,699元×${plan1699.length}`);
    breakdownHtml += `<tr>
      <td>💳 付費會員（${detail.join('、')}）</td><td>${membership.length}</td>
      <td class="amount-positive">$${mAmt.toLocaleString()}</td><td class="amount-negative">-$${mFee.toLocaleString()}</td><td>$${mNet.toLocaleString()}</td></tr>`;
    groups.push({ showName: '看我笑話會員', category: '付費會員', amount: mAmt, fee: mFee, notes: `應援匯入：${detail.join('、')}` });
  }

  // Group byName entries by project
  const projectGroups = {};
  Object.entries(byName).forEach(([name, info]) => {
    const projectName = nameProjectMap[name] || name;
    if (!projectName) return; // not yet mapped
    if (!projectGroups[projectName]) projectGroups[projectName] = { ticket: [], merchandise: [] };
    if (info.orderType === 'ticket') {
      projectGroups[projectName].ticket.push({ name, rows: info.rows });
    } else {
      projectGroups[projectName].merchandise.push({ name, rows: info.rows });
    }
  });

  // Render ticket groups
  Object.entries(projectGroups).forEach(([projectName, pg]) => {
    if (pg.ticket.length > 0) {
      const allTicketRows = pg.ticket.flatMap(t => t.rows);
      const eAmt = allTicketRows.reduce((s, r) => s + (Number(r['收取金額']) || 0), 0);
      const eFee = allTicketRows.reduce((s, r) => s + (Number(r['手續費']) || 0), 0);
      const eNet = allTicketRows.reduce((s, r) => s + (Number(r['實際收取金額']) || 0), 0);
      const typeStr = pg.ticket.map(t => `${t.name}×${t.rows.length}`).join('、');
      breakdownHtml += `<tr>
        <td>🎫 ${escapeHtml(projectName)}</td><td>${allTicketRows.length}</td>
        <td class="amount-positive">$${eAmt.toLocaleString()}</td><td class="amount-negative">-$${eFee.toLocaleString()}</td><td>$${eNet.toLocaleString()}</td></tr>`;
      groups.push({ showName: projectName, category: '演出票房', amount: eAmt, fee: eFee, notes: `應援匯入：${typeStr}` });
    }
    if (pg.merchandise.length > 0) {
      const allMerchRows = pg.merchandise.flatMap(m => m.rows);
      const mAmt = allMerchRows.reduce((s, r) => s + (Number(r['收取金額']) || 0), 0);
      const mFee = allMerchRows.reduce((s, r) => s + (Number(r['手續費']) || 0), 0);
      const mNet = allMerchRows.reduce((s, r) => s + (Number(r['實際收取金額']) || 0), 0);
      const typeStr = pg.merchandise.map(m => `${m.name}×${m.rows.length}`).join('、');
      breakdownHtml += `<tr>
        <td>🛍️ ${escapeHtml(projectName)}</td><td>${allMerchRows.length}</td>
        <td class="amount-positive">$${mAmt.toLocaleString()}</td><td class="amount-negative">-$${mFee.toLocaleString()}</td><td>$${mNet.toLocaleString()}</td></tr>`;
      groups.push({ showName: projectName, category: '周邊商品', amount: mAmt, fee: mFee, notes: `應援匯入：${typeStr}` });
    }
  });

  // Refunds
  if (refunds.length > 0) {
    const rAmt = refunds.reduce((s, r) => s + (Number(r['退款金額']) || 0), 0);
    breakdownHtml += `<tr><td>↩️ 退款（不匯入）</td><td>${refunds.length}</td><td colspan="3" class="amount-negative">-$${rAmt.toLocaleString()}</td></tr>`;
  }

  breakdownHtml += `<tr class="totals-row"><td>合計</td><td>${allRows.length}</td>
    <td class="amount-positive">$${totalRevenue.toLocaleString()}</td><td class="amount-negative">-$${totalFees.toLocaleString()}</td><td>$${totalNet.toLocaleString()}</td></tr>`;
  breakdownHtml += '</tbody></table>';
  document.getElementById('breakdown-list').innerHTML = breakdownHtml;
  window._importGroups = groups;
  renderUnmatched(unmatched);
  updateImportButton();
}

// ---- Unmatched Items ----

function renderUnmatched(unmatched) {
  const section = document.getElementById('unmatched-section');
  const list = document.getElementById('unmatched-list');
  if (unmatched.length === 0) { section.style.display = 'none'; return; }

  section.style.display = '';
  const showOptions = showsList.map(s => `<option value="${escapeHtml(s.name)}">${escapeHtml(s.name)}</option>`).join('');
  list.innerHTML = unmatched.map((r, i) => {
    const item = r['品項數量'] || '';
    return `<div class="unmatched-row">
      <div class="unmatched-info">${escapeHtml(r['付款人'] || '')} ｜ ${r['付款時間'] || ''} ｜ $${Number(r['收取金額'] || 0).toLocaleString()} ｜ ${escapeHtml(item)}</div>
      <select id="unmatched-${i}" onchange="onUnmatchedAssign()"><option value="">— 選擇專案 —</option>${showOptions}</select>
    </div>`;
  }).join('');
}

function onUnmatchedAssign() { updateImportButton(); }

function getUnmatchedAssignments() {
  if (!matchResults) return [];
  return matchResults.unmatched.map((r, i) => {
    const select = document.getElementById(`unmatched-${i}`);
    return { row: r, showName: select ? select.value : '' };
  });
}

// ---- Import Button ----

function updateImportButton() {
  const actions = document.getElementById('import-actions');
  const btn = document.getElementById('btn-import');
  const hint = document.getElementById('import-hint');
  actions.style.display = '';
  if (!matchResults) { btn.disabled = true; return; }

  // Check if all mapping selects have a value
  const nameProjectMap = getNameProjectMap();
  const unmappedNames = Object.keys(matchResults.byName).filter(name => !nameProjectMap[name]);

  const assignments = getUnmatchedAssignments();
  const unresolved = assignments.filter(a => !a.showName).length;

  if (unmappedNames.length > 0) {
    btn.disabled = true;
    hint.textContent = `還有 ${unmappedNames.length} 個票券／商品名稱需要對應專案`;
  } else if (unresolved > 0) {
    btn.disabled = true;
    hint.textContent = `還有 ${unresolved} 筆未配對項目需要指定專案`;
  } else {
    btn.disabled = false;
    hint.textContent = '';
  }
  btn.onclick = doImport;
}

// ---- Batch Import ----

async function doImport() {
  const btn = document.getElementById('btn-import');
  btn.disabled = true;
  btn.textContent = '匯入中...';
  const groups = window._importGroups || [];
  const today = new Date().toISOString().split('T')[0];
  const transactions = [];

  groups.forEach(g => {
    transactions.push({ showName: g.showName, category: g.category, notes: g.notes, amount: g.amount, date: today, recordedBy: '應援匯入' });
    if (g.fee > 0) {
      transactions.push({ showName: g.showName, category: '平台手續', notes: '應援手續費', amount: -g.fee, date: today, recordedBy: '應援匯入' });
    }
  });

  // Manual assignments for unmatched items
  const assignments = getUnmatchedAssignments();
  const manualGroups = {};
  assignments.forEach(a => {
    if (!a.showName) return;
    if (!manualGroups[a.showName]) manualGroups[a.showName] = { amount: 0, fee: 0, items: [] };
    manualGroups[a.showName].amount += Number(a.row['收取金額']) || 0;
    manualGroups[a.showName].fee += Number(a.row['手續費']) || 0;
    manualGroups[a.showName].items.push(a.row['品項數量'] || '未知');
  });
  Object.entries(manualGroups).forEach(([showName, g]) => {
    // Determine category based on item content (default to 演出票房)
    const category = '演出票房';
    transactions.push({ showName, category, notes: `應援匯入（手動指定）：${g.items.length}筆`, amount: g.amount, date: today, recordedBy: '應援匯入' });
    if (g.fee > 0) {
      transactions.push({ showName, category: '平台手續', notes: '應援手續費（手動指定）', amount: -g.fee, date: today, recordedBy: '應援匯入' });
    }
  });

  try {
    const res = await API.batchImportTransactions(transactions);
    if (res.success) {
      btn.textContent = `✅ 已匯入 ${res.data.count} 筆`;
      btn.classList.add('btn-secondary');
      btn.classList.remove('btn-primary');
    } else {
      alert('匯入失敗：' + (res.error || '未知錯誤'));
      btn.disabled = false;
      btn.textContent = '匯入到 Google Sheets';
    }
  } catch (err) {
    alert('匯入錯誤：' + err.message);
    btn.disabled = false;
    btn.textContent = '匯入到 Google Sheets';
  }
}
