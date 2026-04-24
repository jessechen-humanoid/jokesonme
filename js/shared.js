// ============================================================
// 看我笑話工作室 — 共用元件
// ============================================================

// ---- Password Gate ----

function checkAuth() {
  if (sessionStorage.getItem('authenticated') === 'true') return;

  const overlay = document.createElement('div');
  overlay.className = 'auth-overlay';
  overlay.innerHTML = `
    <div class="auth-box">
      <div class="auth-title">看我笑話工作室</div>
      <div class="auth-subtitle">請輸入密碼以繼續</div>
      <input type="password" class="form-control auth-input" id="auth-password" placeholder="密碼">
      <div class="auth-error" id="auth-error"></div>
      <button class="btn btn-primary auth-btn" id="auth-submit">進入</button>
    </div>
  `;
  document.body.appendChild(overlay);

  const input = document.getElementById('auth-password');
  const error = document.getElementById('auth-error');
  const submit = document.getElementById('auth-submit');

  function tryAuth() {
    if (input.value === 'joke0321') {
      sessionStorage.setItem('authenticated', 'true');
      overlay.remove();
    } else {
      error.textContent = '密碼錯誤，請重試';
      input.value = '';
      input.focus();
    }
  }

  submit.addEventListener('click', tryAuth);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') tryAuth();
  });

  input.focus();
}

const MEMBERS = ['傑哥', '柏文', '巧達', '芭樂', '又又', '兔子', '大弋', '竹節蟲'];

const INCOME_CATEGORIES = ['演出票房', '付費會員', '商演合作', '周邊商品', '品牌贊助', '其他收入'];
const EXPENSE_CATEGORIES = ['場地租借', '工作人員', '設備道具', '剪輯製作', '行政雜支', '平台手續', '稅務預留', '其他支出'];

// ---- Navigation ----

function renderNav(activePage) {
  const pages = [
    { id: 'transaction', label: '收支紀錄', href: 'index.html' },
    { id: 'checklist', label: '演出準備', href: 'checklist.html' },
    { id: 'analytics', label: '財務分析', href: 'analytics.html' },
    { id: 'forecast', label: '財務預估', href: 'forecast.html' },
    { id: 'import', label: '應援匯入', href: 'import.html' },
    { id: 'opentix', label: '追蹤演出', href: 'opentix.html' },
    { id: 'opentix-analytics', label: '追蹤售票', href: 'opentix-analytics.html' },
  ];

  const nav = document.querySelector('.nav');
  if (!nav) return;

  nav.innerHTML = `
    <a class="nav-brand" href="index.html">看我笑話工作室</a>
    <div class="nav-links">
      ${pages.map(p => `
        <a class="nav-link ${p.id === activePage ? 'active' : ''}" href="${p.href}">${p.label}</a>
      `).join('')}
    </div>
  `;
}

// ---- Show Selector ----

let showsCache = null;

async function loadShows() {
  if (showsCache) return showsCache;
  const res = await API.getShows();
  if (res.success) {
    showsCache = res.data;
    return showsCache;
  }
  return [];
}

function invalidateShowsCache() {
  showsCache = null;
}

async function renderShowSelector(containerId, onChange) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '<div class="loading">載入專案清單中...</div>';

  const shows = await loadShows();

  container.innerHTML = `
    <select class="show-select" id="show-select">
      <option value="">— 請選擇專案 —</option>
      ${shows.map(s => `<option value="${s.name}">${s.name}</option>`).join('')}
      <option value="__add_new__">＋ 新增一個專案</option>
    </select>
  `;

  const select = document.getElementById('show-select');
  select.addEventListener('change', async () => {
    if (select.value === '__add_new__') {
      select.value = '';
      showAddShowModal(async (newName) => {
        if (!newName) return;
        const res = await API.addShow(newName);
        if (res.success) {
          invalidateShowsCache();
          await renderShowSelector(containerId, onChange);
          const newSelect = document.getElementById('show-select');
          newSelect.value = newName;
          sessionStorage.setItem('selectedShow', newName);
          if (onChange) onChange(newName);
        }
      });
      return;
    }
    sessionStorage.setItem('selectedShow', select.value);
    if (onChange) onChange(select.value);
  });

  // Restore previously selected show from sessionStorage
  const saved = sessionStorage.getItem('selectedShow');
  if (saved && select.querySelector(`option[value="${CSS.escape(saved)}"]`)) {
    select.value = saved;
    if (onChange) onChange(saved);
  }
}

// ---- Add Show Modal ----

function showAddShowModal(callback) {
  let overlay = document.getElementById('modal-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'modal-overlay';
    overlay.className = 'modal-overlay';
    document.body.appendChild(overlay);
  }

  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-title">新增專案</div>
      <div class="form-group">
        <label class="form-label">專案名稱</label>
        <input type="text" class="form-control" id="new-show-name" placeholder="例：看我笑話 7 月號">
      </div>
      <div class="modal-actions">
        <button class="btn btn-secondary" id="modal-cancel">取消</button>
        <button class="btn btn-primary" id="modal-confirm">新增</button>
      </div>
    </div>
  `;

  overlay.classList.add('active');

  const input = document.getElementById('new-show-name');
  input.focus();

  document.getElementById('modal-cancel').addEventListener('click', () => {
    overlay.classList.remove('active');
  });

  document.getElementById('modal-confirm').addEventListener('click', () => {
    const name = input.value.trim();
    overlay.classList.remove('active');
    callback(name);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const name = input.value.trim();
      overlay.classList.remove('active');
      callback(name);
    }
  });
}

// ---- Member Dropdown ----

function createMemberSelect(id, selectedValue, options = {}) {
  const includeEmpty = options.includeEmpty !== false;
  const includeOther = options.includeOther !== false;

  let html = `<select class="form-control" id="${id}">`;
  if (includeEmpty) {
    html += `<option value="">— 請選擇 —</option>`;
  }
  MEMBERS.forEach(m => {
    html += `<option value="${m}" ${m === selectedValue ? 'selected' : ''}>${m}</option>`;
  });
  if (includeOther) {
    html += `<option value="__other__">其他</option>`;
  }
  html += `</select>`;

  if (includeOther) {
    html += `<input type="text" class="form-control member-other-input" id="${id}-other" placeholder="請輸入姓名">`;
  }

  return html;
}

function setupMemberSelectOther(id) {
  const select = document.getElementById(id);
  const otherInput = document.getElementById(`${id}-other`);
  if (!select || !otherInput) return;

  select.addEventListener('change', () => {
    if (select.value === '__other__') {
      otherInput.classList.add('active');
      otherInput.focus();
    } else {
      otherInput.classList.remove('active');
      otherInput.value = '';
    }
  });
}

function getMemberValue(id) {
  const select = document.getElementById(id);
  if (!select) return '';
  if (select.value === '__other__') {
    const otherInput = document.getElementById(`${id}-other`);
    return otherInput ? otherInput.value.trim() : '';
  }
  return select.value;
}

// ---- Member Checkbox Grid (Income Allocation) ----

function createMemberCheckboxGrid(containerId, excludedMembers) {
  const excluded = excludedMembers ? excludedMembers.split(',').map(s => s.trim()) : [];
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="checkbox-grid">
      ${MEMBERS.map(m => `
        <label class="checkbox-item">
          <input type="checkbox" value="${m}" ${excluded.includes(m) ? '' : 'checked'}>
          <span>${m}</span>
        </label>
      `).join('')}
    </div>
  `;
}

function getExcludedMembers(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return '';
  const checkboxes = container.querySelectorAll('input[type="checkbox"]');
  const excluded = [];
  checkboxes.forEach(cb => {
    if (!cb.checked) excluded.push(cb.value);
  });
  return excluded.join(',');
}

// ---- Category Select ----

function createCategorySelect(id, type, selectedValue) {
  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  return `<select class="form-control" id="${id}">
    <option value="">— 請選擇分類 —</option>
    ${categories.map(c => `<option value="${c}" ${c === selectedValue ? 'selected' : ''}>${c}</option>`).join('')}
  </select>`;
}

function updateCategorySelect(id, type, selectedValue) {
  const container = document.getElementById(id);
  if (!container) return;
  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  container.innerHTML = `<option value="">— 請選擇分類 —</option>` +
    categories.map(c => `<option value="${c}" ${c === selectedValue ? 'selected' : ''}>${c}</option>`).join('');
}

// ---- Utilities ----

function formatAmount(amount) {
  const num = Number(amount);
  const formatted = '$' + Math.abs(num).toLocaleString();
  if (num > 0) return `+${formatted}`;
  if (num < 0) return `-${formatted}`;
  return formatted;
}

function amountClass(amount) {
  const num = Number(amount);
  if (num > 0) return 'amount-positive';
  if (num < 0) return 'amount-negative';
  return '';
}
