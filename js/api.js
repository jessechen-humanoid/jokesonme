// ============================================================
// 看我笑話工作室 — API 封裝
// ============================================================

// 部署 Google Apps Script 後，將下方 URL 替換為你的 Web App URL
const API_URL = 'https://script.google.com/macros/s/AKfycbxVUewb5wFvxM1PgJBXJm36Gv8lN47UyVLijFjupH4UgMrZpVhpxGppy_YnH-pW9_2y/exec';

const API = {
  async get(action, params = {}) {
    const url = new URL(API_URL);
    url.searchParams.set('action', action);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

    const res = await fetch(url.toString());
    return res.json();
  },

  async post(action, payload = {}) {
    const url = new URL(API_URL);
    url.searchParams.set('action', action);

    const res = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(payload),
    });
    return res.json();
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

  // Setup
  setup() {
    return this.get('setup');
  },
};
