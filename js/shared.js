// ============================================================
// 看我笑話工作室 — 共用元件
// ============================================================

const MEMBERS = ['傑哥', '柏文', '巧達', '芭樂', '又又', '兔子', '大弋', '竹節蟲'];

// ---- Navigation ----

function renderNav(activePage) {
  const pages = [
    { id: 'transaction', label: '收支紀錄', href: 'index.html' },
    { id: 'checklist', label: '演出準備', href: 'checklist.html' },
    { id: 'analytics', label: '財務分析', href: 'analytics.html' },
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

  container.innerHTML = '<div class="loading">載入演出清單中...</div>';

  const shows = await loadShows();

  container.innerHTML = `
    <select class="show-select" id="show-select">
      <option value="">— 請選擇演出 —</option>
      ${shows.map(s => `<option value="${s.name}">${s.name}</option>`).join('')}
      <option value="__add_new__">＋ 新增一檔演出</option>
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
          if (onChange) onChange(newName);
        }
      });
      return;
    }
    if (onChange) onChange(select.value);
  });
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
      <div class="modal-title">新增演出</div>
      <div class="form-group">
        <label class="form-label">演出名稱</label>
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

// ---- Utilities ----

function formatAmount(amount) {
  const num = Number(amount);
  const formatted = 'NT$' + Math.abs(num).toLocaleString();
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
