// ============================================================
// 看我笑話工作室 — 應援金流匯入
// ============================================================

checkAuth();
renderNav('import');

// ---- State ----

let cashflowFiles = [];     // [{ name, rows: [] }]
let eventFiles = [];        // [{ name, eventName, rows: [] }]
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
  const evZone = document.getElementById('event-zone');
  const evInput = document.getElementById('event-input');

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

  evZone.addEventListener('click', () => evInput.click());
  evZone.addEventListener('dragover', e => { e.preventDefault(); evZone.style.borderColor = 'var(--accent)'; });
  evZone.addEventListener('dragleave', () => { evZone.style.borderColor = ''; });
  evZone.addEventListener('drop', e => {
    e.preventDefault();
    evZone.style.borderColor = '';
    Array.from(e.dataTransfer.files).forEach(f => {
      if (f.name.endsWith('.xlsx')) handleEventFile(f);
    });
  });
  evInput.addEventListener('change', () => {
    Array.from(evInput.files).forEach(f => handleEventFile(f));
    evInput.value = '';
  });
}

// ---- XLSX Parsing ----

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

// ---- Event Name Extraction ----

function extractEventName(filename) {
  const base = filename.replace(/\.xlsx$/i, '');
  const match = base.match(/^\d+_(.+?)_活動報名狀態/);
  if (match) return match[1];
  return base.replace(/^\d+_/, '').replace(/_\d+筆$/, '');
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

async function handleEventFile(file) {
  if (eventFiles.some(f => f.name === file.name)) {
    alert('此檔案已上傳過：' + file.name);
    return;
  }
  try {
    const rows = await parseXlsx(file);
    const eventName = extractEventName(file.name);
    eventFiles.push({ name: file.name, eventName, rows });
    document.getElementById('event-zone').classList.add('has-file');
    renderUploadStatus();
    tryRunMatching();
  } catch (err) {
    alert('活動檔案解析失敗：' + err.message);
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

function removeEventFile(idx) {
  eventFiles.splice(idx, 1);
  if (eventFiles.length === 0) {
    document.getElementById('event-zone').classList.remove('has-file');
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
      <span class="status-badge">${merged.length} 筆 ｜ NT$${total.toLocaleString()}</span>
    </div>`;
  } else if (cashflowFiles.length === 1) {
    const cf = cashflowFiles[0];
    const total = cf.rows.reduce((s, r) => s + (Number(r['收取金額']) || 0), 0);
    const dates = cf.rows.map(r => r['建立日期'] || '').filter(Boolean).sort();
    const dateRange = dates.length ? `${dates[0].slice(0, 10)} ~ ${dates[dates.length - 1].slice(0, 10)}` : '';
    // Replace the single file item with a summary style
    html = `<div class="upload-status-item">
      <div class="status-left">✅ ${escapeHtml(cf.name)}</div>
      <span class="status-badge">${cf.rows.length} 筆 ｜ ${dateRange} ｜ NT$${total.toLocaleString()}</span>
    </div>`;
  }

  eventFiles.forEach((ef, i) => {
    html += `<div class="upload-status-item">
      <div class="status-left">🎫 ${escapeHtml(ef.eventName)} <span class="status-badge">(${ef.rows.length} 筆)</span></div>
      <button class="btn-remove" onclick="removeEventFile(${i})">移除</button>
    </div>`;
  });

  container.innerHTML = html;
}

// ---- Matching Logic ----

function parseTime(str) {
  if (!str) return null;
  const parts = str.trim().match(/(\d{4})\/(\d{2})\/(\d{2})\s+(\d{2}):(\d{2})/);
  if (!parts) return null;
  return new Date(+parts[1], +parts[2] - 1, +parts[3], +parts[4], +parts[5]);
}

function tryRunMatching() {
  if (cashflowFiles.length === 0 || eventFiles.length === 0) {
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

  const matched = {};
  const unmatched = [];
  const usedEventRows = new Set();

  const eventRowsByName = {};
  const eventRowsByEmail = {};
  eventFiles.forEach(ef => {
    ef.rows.forEach((er, idx) => {
      const key = `${ef.name}:${idx}`;
      const name = (er['購買人名稱'] || '').trim();
      const email = (er['購買人 Email'] || '').trim().toLowerCase();
      const time = parseTime(er['報名日期']);
      if (!eventRowsByName[name]) eventRowsByName[name] = [];
      eventRowsByName[name].push({ key, time, eventName: ef.eventName, email });
      if (email) {
        if (!eventRowsByEmail[email]) eventRowsByEmail[email] = [];
        eventRowsByEmail[email].push({ key, time, eventName: ef.eventName });
      }
    });
  });

  purchases.forEach(cfRow => {
    const cfName = (cfRow['付款人'] || '').trim();
    const cfEmail = (cfRow['電子郵件'] || '').trim().toLowerCase();
    const cfTime = parseTime(cfRow['付款時間']);
    let matchedEvent = null;

    if (cfTime && eventRowsByName[cfName]) {
      let bestDiff = Infinity;
      let bestEntry = null;
      eventRowsByName[cfName].forEach(entry => {
        if (usedEventRows.has(entry.key) || !entry.time) return;
        const diff = Math.abs(cfTime - entry.time) / 1000;
        if (diff <= 300 && diff < bestDiff) {
          bestDiff = diff;
          bestEntry = entry;
        }
      });
      if (bestEntry) {
        matchedEvent = bestEntry.eventName;
        usedEventRows.add(bestEntry.key);
      }
    }

    if (!matchedEvent && cfEmail && eventRowsByEmail[cfEmail]) {
      let bestDiff = Infinity;
      let bestEntry = null;
      eventRowsByEmail[cfEmail].forEach(entry => {
        if (usedEventRows.has(entry.key) || !entry.time || !cfTime) return;
        const diff = Math.abs(cfTime - entry.time) / 1000;
        if (diff < bestDiff) {
          bestDiff = diff;
          bestEntry = entry;
        }
      });
      if (bestEntry) {
        matchedEvent = bestEntry.eventName;
        usedEventRows.add(bestEntry.key);
      }
    }

    if (matchedEvent) {
      if (!matched[matchedEvent]) matched[matchedEvent] = [];
      matched[matchedEvent].push(cfRow);
    } else {
      unmatched.push(cfRow);
    }
  });

  matchResults = { membership, matched, unmatched, refunds };
  renderMappingSection();
  renderDashboard();
}

// ---- Event → Show Mapping ----

function getEventShowMap() {
  const map = {};
  eventFiles.forEach(ef => {
    const select = document.getElementById(`mapping-${ef.eventName}`);
    map[ef.eventName] = select ? select.value : ef.eventName;
  });
  return map;
}

function renderMappingSection() {
  const section = document.getElementById('mapping-section');
  const list = document.getElementById('mapping-list');
  const eventNames = [...new Set(eventFiles.map(f => f.eventName))];
  if (eventNames.length === 0) { section.style.display = 'none'; return; }

  section.style.display = '';
  list.innerHTML = eventNames.map(en => {
    const options = showsList.map(s =>
      `<option value="${escapeHtml(s.name)}">${escapeHtml(s.name)}</option>`
    ).join('');
    return `<div class="mapping-row">
      <span>${escapeHtml(en)}</span>
      <span class="mapping-arrow">→</span>
      <select id="mapping-${en}" onchange="renderDashboard()">
        <option value="${escapeHtml(en)}">${escapeHtml(en)}（保持原名）</option>
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
  const showMap = getEventShowMap();
  const { membership, matched, unmatched, refunds } = matchResults;
  document.getElementById('dashboard-section').style.display = '';

  const allRows = getMergedCashflowRows().filter(r => r['金流狀態'] !== '撥款後退款');
  const totalRevenue = allRows.reduce((s, r) => s + (Number(r['收取金額']) || 0), 0);
  const totalFees = allRows.reduce((s, r) => s + (Number(r['手續費']) || 0), 0);
  const totalNet = allRows.reduce((s, r) => s + (Number(r['實際收取金額']) || 0), 0);

  document.getElementById('import-stats').innerHTML = `
    <div class="stat-card"><div class="stat-label">收取金額</div><div class="stat-value positive">NT$${totalRevenue.toLocaleString()}</div></div>
    <div class="stat-card"><div class="stat-label">平台手續費</div><div class="stat-value negative">-NT$${totalFees.toLocaleString()}</div></div>
    <div class="stat-card"><div class="stat-label">實際收取</div><div class="stat-value positive">NT$${totalNet.toLocaleString()}</div></div>
  `;

  let breakdownHtml = `<table class="import-breakdown-table">
    <thead><tr><th>來源</th><th>筆數</th><th>收取金額</th><th>手續費</th><th>實際收取</th></tr></thead><tbody>`;
  const groups = [];

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
      <td class="amount-positive">NT$${mAmt.toLocaleString()}</td><td class="amount-negative">-NT$${mFee.toLocaleString()}</td><td>NT$${mNet.toLocaleString()}</td></tr>`;
    groups.push({ showName: '會員與其他收支', category: '付費會員', amount: mAmt, fee: mFee, notes: `應援匯入：${detail.join('、')}` });
  }

  Object.entries(matched).forEach(([eventName, rows]) => {
    const showName = showMap[eventName] || eventName;
    const eAmt = rows.reduce((s, r) => s + (Number(r['收取金額']) || 0), 0);
    const eFee = rows.reduce((s, r) => s + (Number(r['手續費']) || 0), 0);
    const eNet = rows.reduce((s, r) => s + (Number(r['實際收取金額']) || 0), 0);
    const types = {};
    rows.forEach(r => {
      const item = r['品項數量'] || '未知';
      const typeName = item.replace(/（.+$/, '').replace(/\s*x\s*\d+$/i, '').trim();
      if (!types[typeName]) types[typeName] = 0;
      types[typeName]++;
    });
    const typeStr = Object.entries(types).map(([t, c]) => `${t}×${c}`).join('、');
    breakdownHtml += `<tr>
      <td>🎫 ${escapeHtml(showName)}</td><td>${rows.length}</td>
      <td class="amount-positive">NT$${eAmt.toLocaleString()}</td><td class="amount-negative">-NT$${eFee.toLocaleString()}</td><td>NT$${eNet.toLocaleString()}</td></tr>`;
    groups.push({ showName, category: '演出票房', amount: eAmt, fee: eFee, notes: `應援匯入：${typeStr}` });
  });

  if (refunds.length > 0) {
    const rAmt = refunds.reduce((s, r) => s + (Number(r['退款金額']) || 0), 0);
    breakdownHtml += `<tr><td>↩️ 退款（不匯入）</td><td>${refunds.length}</td><td colspan="3" class="amount-negative">-NT$${rAmt.toLocaleString()}</td></tr>`;
  }

  breakdownHtml += `<tr class="totals-row"><td>合計</td><td>${allRows.length}</td>
    <td class="amount-positive">NT$${totalRevenue.toLocaleString()}</td><td class="amount-negative">-NT$${totalFees.toLocaleString()}</td><td>NT$${totalNet.toLocaleString()}</td></tr>`;
  breakdownHtml += '</tbody></table>';
  document.getElementById('breakdown-list').innerHTML = breakdownHtml;
  window._importGroups = groups;
  renderUnmatched(unmatched, showMap);
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
      <div class="unmatched-info">${escapeHtml(r['付款人'] || '')} ｜ ${r['付款時間'] || ''} ｜ NT$${Number(r['收取金額'] || 0).toLocaleString()} ｜ ${escapeHtml(item)}</div>
      <select id="unmatched-${i}" onchange="onUnmatchedAssign()"><option value="">— 選擇演出 —</option>${showOptions}</select>
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
  const assignments = getUnmatchedAssignments();
  const unresolved = assignments.filter(a => !a.showName).length;
  if (unresolved > 0) {
    btn.disabled = true;
    hint.textContent = `還有 ${unresolved} 筆未配對項目需要指定演出`;
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
    transactions.push({ showName, category: '演出票房', notes: `應援匯入（手動指定）：${g.items.length}筆`, amount: g.amount, date: today, recordedBy: '應援匯入' });
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
