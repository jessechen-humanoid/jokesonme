// 讓舊的 import.js 在新平台上運作：提供它需要的全域函式，API 改打新平台。
// escapeHtml / formatAmount / MEMBERS 與舊 js/shared.js 相同。
window.MEMBERS = ['傑哥', '柏文', '巧達', '芭樂', '又又', '兔子', '大弋', '竹節蟲'];
window.escapeHtml = function (str) {
  if (str === null || str === undefined) return '';
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
};
window.formatAmount = function (amount) {
  const num = Number(amount);
  const formatted = '$' + Math.abs(num).toLocaleString();
  if (num > 0) return `+${formatted}`;
  if (num < 0) return `-${formatted}`;
  return formatted;
};
window.API = {
  async getShows() {
    const res = await fetch('/api/finance/import', { credentials: 'same-origin' });
    return res.json();
  },
  async batchImportTransactions(transactions) {
    const res = await fetch('/api/finance/import', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactions }),
    });
    return res.json();
  },
};
