// ============================================================
// 看我笑話工作室 — API 封裝
// ============================================================

// ============================================================
// 2026-10-03 已搬到新平台（jokesonme-platform-v2）：舊頁面一律只顯示搬家提示，
// 不再對 Google Apps Script 發出任何請求。要復原舊平台，把 MIGRATED 改成 false。
// ============================================================
const MIGRATED = true;
const NEW_PLATFORM_URL = 'https://liff.line.me/2011842910-Qgeq0VDs';
const OPENTIX_TRACKER_URL = 'https://opentix-tracker.vercel.app/';

if (MIGRATED) {
  const showMovedNotice = () => {
    document.title = '看我笑話｜已搬到新平台';
    document.body.innerHTML = `
      <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:#F3F3F1;font-family:'Noto Sans TC',sans-serif;color:#1B1B1B">
        <div style="max-width:420px;width:100%;background:#fff;border-radius:16px;padding:24px">
          <div style="font-size:24px;font-weight:900;margin-bottom:8px">看我笑話平台搬家了</div>
          <p style="line-height:1.7;color:#55554F;margin:0 0 20px">收支、財務分析、應援匯入、待辦都已經搬到新平台，用 LINE 帳號登入。這個舊網站不再更新。</p>
          <a href="${NEW_PLATFORM_URL}" style="display:flex;justify-content:center;align-items:center;min-height:48px;border-radius:8px;background:#FF7A00;color:#1B1B1B;font-weight:700;text-decoration:none;margin-bottom:10px">打開新平台</a>
          <a href="${OPENTIX_TRACKER_URL}" style="display:flex;justify-content:center;align-items:center;min-height:44px;border-radius:8px;background:#EDEDEA;color:#1B1B1B;font-weight:700;text-decoration:none">OpenTix 票房追蹤（尚未搬家）</a>
        </div>
      </div>`;
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', showMovedNotice);
  else showMovedNotice();
}

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
  if (MIGRATED) return { success: false, error: '已搬到新平台' };
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
