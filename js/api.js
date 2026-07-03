// ============================================================
// 看我笑話工作室 — API 封裝
// ============================================================

// 部署 Google Apps Script 後，將下方 URL 替換為你的 Web App URL
const API_URL = 'https://script.google.com/macros/s/AKfycbxVUewb5wFvxM1PgJBXJm36Gv8lN47UyVLijFjupH4UgMrZpVhpxGppy_YnH-pW9_2y/exec';

// 讀取登入後存於 sessionStorage 的 API token（由 shared.js 的密碼閘門寫入）
function getApiToken() {
  try { return sessionStorage.getItem('apiToken') || ''; } catch (_) { return ''; }
}

// 後端回傳 unauthorized 時：清除失效 token 並重新顯示密碼閘門
function handleUnauthorized(data) {
  if (data && data.success === false && data.error === 'unauthorized') {
    try { sessionStorage.removeItem('apiToken'); } catch (_) {}
    if (typeof showAuthGate === 'function') showAuthGate();
  }
  return data;
}

// 統一的請求包裝：逾時、非 2xx、網路錯誤、JSON 解析失敗一律正規化為
// { success: false, error }，讓呼叫端只需檢查 success。GAS 冷啟動慢，逾時取 30 秒。
async function safeFetchJson(url, options) {
  try {
    const res = await fetch(url, Object.assign({ signal: AbortSignal.timeout(30000) }, options || {}));
    if (!res.ok) return { success: false, error: '網路錯誤，請重試' };
    return handleUnauthorized(await res.json());
  } catch (_) {
    return { success: false, error: '網路錯誤，請重試' };
  }
}

const API = {
  async get(action, params = {}) {
    const url = new URL(API_URL);
    url.searchParams.set('action', action);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    const token = getApiToken();
    if (token) url.searchParams.set('token', token);

    return safeFetchJson(url.toString());
  },

  async post(action, payload = {}) {
    const url = new URL(API_URL);
    url.searchParams.set('action', action);

    const body = { ...payload };
    const token = getApiToken();
    if (token) body.token = token;

    return safeFetchJson(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(body),
    });
  },

  // Auth
  verifyPassword(password) {
    return this.post('verifyPassword', { password });
  },

  // Show Management
  getShows() {
    return this.get('getShows');
  },

  addShow(name) {
    return this.post('addShow', { name });
  },

  // Transactions
  getTransactions(showName) {
    return this.get('getTransactions', showName ? { show: showName } : {});
  },

  addTransaction(data) {
    return this.post('addTransaction', data);
  },

  updateTransaction(id, updates) {
    return this.post('updateTransaction', { id, ...updates });
  },

  deleteTransaction(id) {
    return this.post('deleteTransaction', { id });
  },

  // Checklist
  getChecklist(showName) {
    return this.get('getChecklist', { show: showName });
  },

  initChecklist(showName) {
    return this.post('initChecklist', { showName });
  },

  updateChecklistItem(id, updates) {
    return this.post('updateChecklistItem', { id, ...updates });
  },

  addChecklistItem(data) {
    return this.post('addChecklistItem', data);
  },

  // Settlements
  getSettlements() {
    return this.get('getSettlements');
  },

  addSettlement(data) {
    return this.post('addSettlement', data);
  },

  // Advance reimbursement ledger (代墊還款帳本)
  getAdvanceReimbursements() {
    return this.get('getAdvanceReimbursements');
  },

  addAdvanceReimbursement(data) {
    return this.post('addAdvanceReimbursement', data);
  },

  // Import
  batchImportTransactions(transactions) {
    return this.post('batchImportTransactions', { transactions });
  },
};
