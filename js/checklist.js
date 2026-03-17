// ============================================================
// 看我笑話工作室 — 演出準備 Checklist 頁
// ============================================================

(async function () {
  renderNav('checklist');
  await renderShowSelector('show-selector', onShowSelected);
})();

let currentShow = '';
let checklistData = [];

async function onShowSelected(showName) {
  currentShow = showName;
  const content = document.getElementById('checklist-content');

  if (!showName) {
    content.innerHTML = '';
    return;
  }

  content.innerHTML = '<div class="loading">載入中...</div>';

  // Initialize checklist from template if first time
  await API.initChecklist(showName);

  // Load checklist data
  await loadChecklist();
}

async function loadChecklist() {
  const content = document.getElementById('checklist-content');
  const res = await API.getChecklist(currentShow);

  if (!res.success) {
    content.innerHTML = '<div class="empty-state">載入失敗</div>';
    return;
  }

  checklistData = res.data;

  if (checklistData.length === 0) {
    content.innerHTML = '<div class="empty-state">尚無待辦項目</div>';
    return;
  }

  // Get project names for auto-populate
  const projectNames = getProjectNames();

  // Group by category
  const categories = {};
  const categoryOrder = ['演出內容', '設備與人員', '影片製作'];
  checklistData.forEach(item => {
    const cat = item.category || '其他';
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(item);
  });

  // Sort categories in defined order, others at end
  const sortedCats = categoryOrder.filter(c => categories[c]);
  Object.keys(categories).forEach(c => {
    if (!sortedCats.includes(c)) sortedCats.push(c);
  });

  let html = '';

  sortedCats.forEach(cat => {
    const items = categories[cat];
    html += `
      <div class="card checklist-category">
        <div class="card-title">${escapeHtml(cat)}</div>
        ${items.map(item => renderChecklistItem(item, cat, projectNames)).join('')}
      </div>
    `;
  });

  // Add custom item button
  html += `
    <button class="btn btn-secondary" id="add-checklist-item-btn" style="margin-top: 8px;">
      ＋ 新增待辦事項
    </button>
    <div id="add-item-form" style="display:none; margin-top: 12px;" class="card">
      <div class="form-row-3">
        <div class="form-group">
          <label class="form-label">類別</label>
          <select class="form-control" id="new-item-category">
            <option value="演出內容">演出內容</option>
            <option value="設備與人員">設備與人員</option>
            <option value="影片製作">影片製作</option>
            <option value="自訂">自訂</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">項目名稱</label>
          <input type="text" class="form-control" id="new-item-name" placeholder="例：確認燈光">
        </div>
        <div class="form-group">
          <label class="form-label">負責人</label>
          ${createMemberSelect('new-item-assignee', '', { includeEmpty: true, includeOther: true })}
        </div>
      </div>
      <button class="btn btn-primary btn-sm" id="new-item-submit">新增</button>
      <button class="btn btn-secondary btn-sm" id="new-item-cancel" style="margin-left: 8px;">取消</button>
    </div>
  `;

  content.innerHTML = html;

  // Bind events
  bindChecklistEvents();
  bindAddItemEvents();
}

function getProjectNames() {
  // Extract project names from checklist data (企劃 1, 2, 3 items in 演出內容)
  const names = { 1: '', 2: '', 3: '' };
  checklistData.forEach(item => {
    if (item.category === '演出內容') {
      const match = item.itemName.match(/^確認企劃\s*(\d)/);
      if (match) {
        // The project name is stored in the notes or after a colon in the item name
        const colonIndex = item.itemName.indexOf('：');
        if (colonIndex > -1) {
          names[match[1]] = item.itemName.substring(colonIndex + 1).trim();
        } else {
          // Check notes for the project name
          names[match[1]] = item.notes || '';
        }
      }
    }
  });
  return names;
}

function renderChecklistItem(item, category, projectNames) {
  const statusOptions = ['未開始', '進行中', '已完成'];
  let displayName = item.itemName;

  // Auto-populate project names for video production items
  if (category === '影片製作') {
    for (let i = 1; i <= 3; i++) {
      if (item.itemName === `企劃 ${i} 剪輯說明` && projectNames[i]) {
        displayName = `「${projectNames[i]}」剪輯說明`;
      }
    }
  }

  // Check if this is a project item (企劃 1/2/3) that needs a name input
  const isProjectItem = category === '演出內容' && /^確認企劃\s*\d$/.test(item.itemName);
  const isPublicTicket = item.itemName === '公關票確認';

  let nameHtml;
  if (isProjectItem) {
    const projectNum = item.itemName.match(/\d/)[0];
    const projectName = item.notes || '';
    nameHtml = `
      <span>${escapeHtml(item.itemName)}</span>
      <input type="text" value="${escapeHtml(projectName)}" placeholder="填寫企劃名稱"
             data-id="${item.id}" data-field="project-name" data-project-num="${projectNum}">
    `;
  } else {
    nameHtml = `<span>${escapeHtml(displayName)}</span>`;
  }

  let notesHtml = '';
  if (isPublicTicket) {
    notesHtml = `
      <textarea class="notes-field" data-id="${item.id}" data-field="notes"
                placeholder="填寫公關票名單" rows="2">${escapeHtml(item.notes || '')}</textarea>
    `;
  }

  return `
    <div class="checklist-item">
      <div class="checklist-item-name">
        ${nameHtml}
      </div>
      <div class="checklist-assignee">
        <select data-id="${item.id}" data-field="assignee">
          <option value="">—</option>
          ${MEMBERS.map(m => `<option value="${m}" ${m === item.assignee ? 'selected' : ''}>${m}</option>`).join('')}
          <option value="__other__">其他</option>
        </select>
      </div>
      <div>
        <button class="status status-${item.progress}" data-id="${item.id}" data-field="progress" data-current="${item.progress}">
          ${item.progress}
        </button>
      </div>
    </div>
    ${notesHtml ? `<div style="padding: 0 12px 10px;">${notesHtml}</div>` : ''}
  `;
}

function bindChecklistEvents() {
  const content = document.getElementById('checklist-content');

  // Status toggle
  content.querySelectorAll('[data-field="progress"]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const states = ['未開始', '進行中', '已完成'];
      const currentIndex = states.indexOf(btn.dataset.current);
      const nextState = states[(currentIndex + 1) % states.length];
      const id = Number(btn.dataset.id);

      btn.className = `status status-${nextState}`;
      btn.textContent = nextState;
      btn.dataset.current = nextState;

      await API.updateChecklistItem(id, { progress: nextState });
    });
  });

  // Assignee change
  content.querySelectorAll('[data-field="assignee"]').forEach(select => {
    select.addEventListener('change', async () => {
      const id = Number(select.dataset.id);
      let value = select.value;
      if (value === '__other__') {
        value = prompt('請輸入負責人姓名：') || '';
        if (!value) {
          select.value = '';
          return;
        }
      }
      await API.updateChecklistItem(id, { assignee: value });
    });
  });

  // Project name input (stored in notes)
  content.querySelectorAll('[data-field="project-name"]').forEach(input => {
    let debounceTimer;
    input.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(async () => {
        const id = Number(input.dataset.id);
        const value = input.value.trim();
        await API.updateChecklistItem(id, { notes: value });

        // Update the corresponding video production item display
        // Reload to reflect auto-populated names
        await loadChecklist();
      }, 800);
    });
  });

  // Public ticket notes
  content.querySelectorAll('[data-field="notes"]').forEach(textarea => {
    let debounceTimer;
    textarea.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(async () => {
        const id = Number(textarea.dataset.id);
        await API.updateChecklistItem(id, { notes: textarea.value });
      }, 800);
    });
  });
}

function bindAddItemEvents() {
  const addBtn = document.getElementById('add-checklist-item-btn');
  const form = document.getElementById('add-item-form');

  addBtn.addEventListener('click', () => {
    form.style.display = 'block';
    addBtn.style.display = 'none';
    setupMemberSelectOther('new-item-assignee');
  });

  document.getElementById('new-item-cancel').addEventListener('click', () => {
    form.style.display = 'none';
    addBtn.style.display = '';
  });

  document.getElementById('new-item-submit').addEventListener('click', async () => {
    const category = document.getElementById('new-item-category').value;
    const itemName = document.getElementById('new-item-name').value.trim();
    const assignee = getMemberValue('new-item-assignee');

    if (!itemName) {
      alert('請填寫項目名稱');
      return;
    }

    await API.addChecklistItem({
      showName: currentShow,
      category,
      itemName,
      assignee,
    });

    form.style.display = 'none';
    document.getElementById('add-checklist-item-btn').style.display = '';
    await loadChecklist();
  });
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
