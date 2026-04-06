// ============================================================
// 看我笑話工作室 — 財務預估頁
// ============================================================

(async function () {
  checkAuth();
  renderNav('forecast');
  await loadForecast();
})();

let forecastData = null;

async function loadForecast() {
  const profitShareEl = document.getElementById('profit-share');
  profitShareEl.innerHTML = '<div class="loading">載入中...</div>';

  const res = await API.get('getForecast');
  if (!res.success) {
    profitShareEl.innerHTML = `<div class="empty-state">載入失敗：${res.error || '未知錯誤'}</div>`;
    return;
  }

  forecastData = res.data;
  renderAll();
}

function renderAll() {
  renderProfitShare(forecastData.profitShare, document.getElementById('profit-share'));
  renderBaseParams(forecastData.baseParams, document.getElementById('base-params'));
  renderVersionParams(forecastData.versionParams, document.getElementById('version-params'));
  renderSaveButton(document.getElementById('save-section'));
  renderPnlSummary(forecastData.pnl, document.getElementById('pnl-summary'));
  renderReadOnlyTable(forecastData.income, '收入計算', document.getElementById('income-calc'));
  renderReadOnlyTable(forecastData.expense, '支出計算', document.getElementById('expense-calc'));
}

// ---- 分潤規劃 (read-only) ----

function renderProfitShare(data, el) {
  if (!el || !data) return;
  el.innerHTML = `
    <div class="card">
      <div class="card-title">分潤規劃</div>
      <div class="table-wrapper"><table>
        <thead><tr>
          <th></th>
          ${data.headers.map(h => `<th style="text-align:right">${h}</th>`).join('')}
        </tr></thead>
        <tbody>
          ${data.rows.map(r => `<tr>
            <td>${escapeHtml(r.label)}</td>
            ${r.values.map(v => `<td style="text-align:right;font-weight:600">${formatNum(v)}</td>`).join('')}
          </tr>`).join('')}
        </tbody>
      </table></div>
    </div>
  `;
}

// ---- 基礎參數 (editable) ----

function renderBaseParams(data, el) {
  if (!el || !data) return;
  el.innerHTML = `
    <div class="card">
      <div class="card-title">基礎參數</div>
      <div class="table-wrapper"><table>
        <thead><tr>
          <th>參數</th><th style="text-align:right">數值</th>
        </tr></thead>
        <tbody>
          ${data.map(p => `<tr>
            <td>${escapeHtml(p.label)}</td>
            <td style="text-align:right">
              <input type="text" class="forecast-input" data-type="base" data-row="${p.row}" value="${formatInputValue(p.value)}">
            </td>
          </tr>`).join('')}
        </tbody>
      </table></div>
    </div>
  `;
}

// ---- 版本參數 (editable) ----

function renderVersionParams(data, el) {
  if (!el || !data) return;
  el.innerHTML = `
    <div class="card">
      <div class="card-title">版本參數</div>
      <div class="table-wrapper"><table>
        <thead><tr>
          <th></th>
          ${data.headers.map(h => `<th style="text-align:right">${h}</th>`).join('')}
        </tr></thead>
        <tbody>
          ${data.rows.map(r => `<tr>
            <td>${escapeHtml(r.label)}</td>
            ${r.values.map((v, i) => `<td style="text-align:right">
              <input type="text" class="forecast-input" data-type="version" data-row="${r.row}" data-col="${i}" value="${formatInputValue(v)}">
            </td>`).join('')}
          </tr>`).join('')}
        </tbody>
      </table></div>
    </div>
  `;
}

// ---- 儲存按鈕 ----

function renderSaveButton(el) {
  if (!el) return;
  el.innerHTML = `
    <div style="text-align:center;margin:24px 0">
      <button class="btn btn-primary" id="save-forecast-btn">儲存參數</button>
    </div>
  `;
  document.getElementById('save-forecast-btn').addEventListener('click', saveForecast);
}

async function saveForecast() {
  const btn = document.getElementById('save-forecast-btn');
  btn.disabled = true;
  btn.textContent = '儲存中...';

  const baseParams = [];
  const versionParams = {};

  document.querySelectorAll('.forecast-input').forEach(input => {
    const type = input.dataset.type;
    const row = Number(input.dataset.row);
    const val = parseInputValue(input.value);

    if (type === 'base') {
      baseParams.push({ row, value: val });
    } else if (type === 'version') {
      const col = Number(input.dataset.col);
      if (!versionParams[row]) versionParams[row] = { row, values: [null, null, null] };
      versionParams[row].values[col] = val;
    }
  });

  const payload = {
    baseParams,
    versionParams: Object.values(versionParams),
  };

  const res = await API.post('updateForecast', payload);
  if (!res.success) {
    alert('儲存失敗：' + (res.error || '未知錯誤'));
    btn.disabled = false;
    btn.textContent = '儲存參數';
    return;
  }

  // Re-fetch to get recalculated values
  await loadForecast();
  btn.disabled = false;
  btn.textContent = '儲存參數';
}

// ---- 損益彙總 (read-only) ----

function renderPnlSummary(data, el) {
  if (!el || !data) return;
  el.innerHTML = `
    <div class="card">
      <div class="card-title">損益彙總</div>
      <div class="table-wrapper"><table>
        <thead><tr>
          <th></th>
          ${data.headers.map(h => `<th style="text-align:right">${h}</th>`).join('')}
        </tr></thead>
        <tbody>
          ${data.rows.map(r => `<tr>
            <td>${escapeHtml(r.label)}</td>
            ${r.values.map(v => `<td style="text-align:right;font-weight:600">${formatNum(v)}</td>`).join('')}
          </tr>`).join('')}
        </tbody>
      </table></div>
    </div>
  `;
}

// ---- 收入/支出計算 (read-only) ----

function renderReadOnlyTable(data, title, el) {
  if (!el || !data) return;
  el.innerHTML = `
    <div class="card">
      <div class="card-title">${title}</div>
      <div class="table-wrapper"><table>
        <thead><tr>
          <th></th>
          ${data.headers.map(h => `<th style="text-align:right">${h}</th>`).join('')}
        </tr></thead>
        <tbody>
          ${data.rows.map(r => {
            const isTotal = r.label.includes('合計');
            return `<tr class="${isTotal ? 'totals-row' : ''}">
              <td>${escapeHtml(r.label)}</td>
              ${r.values.map(v => `<td style="text-align:right${isTotal ? ';font-weight:700' : ''}">${formatNum(v)}</td>`).join('')}
            </tr>`;
          }).join('')}
        </tbody>
      </table></div>
    </div>
  `;
}

// ---- Utilities ----

function formatNum(v) {
  if (v === null || v === undefined || v === '') return '$0';
  const num = Number(v);
  if (isNaN(num)) return String(v);
  // Check if it's a percentage (between -1 and 1 exclusive, but not 0)
  if (typeof v === 'number' && v !== 0 && Math.abs(v) < 1) {
    return (v * 100).toFixed(1) + '%';
  }
  return '$' + Math.round(num).toLocaleString();
}

function formatInputValue(v) {
  if (v === null || v === undefined || v === '') return '';
  const num = Number(v);
  if (isNaN(num)) return String(v);
  // Percentage values
  if (typeof v === 'number' && v !== 0 && Math.abs(v) <= 1 && v !== Math.round(v)) {
    return (v * 100) + '%';
  }
  return String(num);
}

function parseInputValue(str) {
  if (!str) return 0;
  str = str.trim();
  if (str.endsWith('%')) {
    return Number(str.replace('%', '')) / 100;
  }
  return Number(str) || 0;
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
