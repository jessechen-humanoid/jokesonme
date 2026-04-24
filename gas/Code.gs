// ============================================================
// 看我笑話工作室 — Google Apps Script API
// ============================================================

const SPREADSHEET_ID = '1sM-ST9lTjvCk7a0ppjSX48-zvhSOc16oYXEaVp3qisI';

const SHEET_NAMES = {
  SHOWS: '專案清單',
  TRANSACTIONS: '收支紀錄',
  CHECKLIST: 'Checklist',
  TEMPLATE: 'Checklist模板',
  SETTLEMENTS: '成員結算',
};

// 稅率常數（所有收入依此比例自動提列稅務預留支出）
const TAX_RESERVE_RATE = 0.03;
const TAX_RESERVE_CATEGORY = '稅務預留';
const FUND_SHOW_NAME = '共同基金支出';
const SYSTEM_RECORDER = '系統';

// 交易 sheet 欄位索引（1-based for sheet API, 0-based for array）
// 1=專案名稱, 2=分類, 3=備註, 4=金額, 5=墊款人, 6=排除成員, 7=結清狀態, 8=日期, 9=登記人, 10=由共同基金支付, 11=系統自動
const TX_COL = {
  SHOW: 1, CATEGORY: 2, NOTES: 3, AMOUNT: 4, ADVANCED_BY: 5,
  EXCLUDED: 6, SETTLED: 7, DATE: 8, RECORDER: 9, PAID_BY_FUND: 10, AUTO_GENERATED: 11,
};
const TX_HEADERS = ['專案名稱', '分類', '備註', '金額', '墊款人', '排除成員', '結清狀態', '日期', '登記人', '由共同基金支付', '系統自動'];

const DEFAULT_SHOWS = [
  '周邊商品收支',
  '看我笑話年度大會｜看我畫大餅',
  '看我笑話第 2 季 Opening Party',
  '看我笑話 4 月號',
  '看我笑話 5 月號',
  '看我笑話 6 月號',
  '看我笑話 7 月號',
  '看我笑話 8 月號',
  '看我笑話 9 月號',
  '看我笑話 10 月號',
  '看我笑話 11 月號',
  '看我笑話 12 月號',
  '看我笑話第 2 季 After Party',
  FUND_SHOW_NAME,
];

const CHECKLIST_TEMPLATE = [
  // [類別, 項目名稱, 預設負責人]
  ['演出內容', '確認本月期間限定作品邀約與內容', ''],
  ['演出內容', '確認本月演出組合與段子長度', ''],
  ['演出內容', '確認企劃 1', ''],
  ['演出內容', '確認企劃 2', ''],
  ['演出內容', '確認企劃 3', ''],
  ['演出內容', '演出簡報製作', '傑哥'],
  ['演出內容', '簡報放所有成員的演出宣傳', '傑哥'],
  ['演出內容', 'Rundown 製作', '大弋'],
  ['演出內容', '標記所有音樂／音效 cue 點', '大弋'],
  ['演出內容', '演後問卷製作', '傑哥'],
  ['演出內容', '公關票確認', '傑哥'],
  ['設備與人員', '麥克風租借確認', '大弋'],
  ['設備與人員', 'DV 租借確認（記憶卡、腳本、電池）', '芭樂'],
  ['設備與人員', '燈音控人員確認', '大弋'],
  ['設備與人員', '拍攝人員確認', '兔子'],
  ['設備與人員', '周邊商品人員確認', ''],
  ['設備與人員', '本月期間限定組合明信片繪製', '柏文'],
  ['設備與人員', '明信片送印', ''],
  ['設備與人員', '明信片取件', ''],
  ['影片製作', '影片檔案提供給剪輯師', ''],
  ['影片製作', '企劃 1 剪輯說明', ''],
  ['影片製作', '企劃 2 剪輯說明', ''],
  ['影片製作', '企劃 3 剪輯說明', ''],
];

// ============================================================
// Helper: get or create sheet
// ============================================================

function getSpreadsheet() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function getOrCreateSheet(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (headers && headers.length > 0) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    }
  }
  return sheet;
}

// ============================================================
// Setup: initialize sheets with default data
// ============================================================

function setupSheets() {
  const ss = getSpreadsheet();

  // 專案清單
  const showSheet = getOrCreateSheet(ss, SHEET_NAMES.SHOWS, ['專案名稱', '建立日期', '狀態']);
  if (showSheet.getLastRow() <= 1) {
    const now = new Date().toISOString().split('T')[0];
    const rows = DEFAULT_SHOWS.map(name => [name, now, '進行中']);
    showSheet.getRange(2, 1, rows.length, 3).setValues(rows);
  }

  // 收支紀錄
  getOrCreateSheet(ss, SHEET_NAMES.TRANSACTIONS, TX_HEADERS);

  // Checklist
  getOrCreateSheet(ss, SHEET_NAMES.CHECKLIST, ['專案名稱', '類別', '項目名稱', '負責人', '進度', '備註']);

  // Checklist模板
  const tmplSheet = getOrCreateSheet(ss, SHEET_NAMES.TEMPLATE, ['類別', '項目名稱', '預設負責人']);
  if (tmplSheet.getLastRow() <= 1) {
    tmplSheet.getRange(2, 1, CHECKLIST_TEMPLATE.length, 3).setValues(CHECKLIST_TEMPLATE);
  }

  // 成員結算
  getOrCreateSheet(ss, SHEET_NAMES.SETTLEMENTS, ['成員', '金額', '日期', '備註']);

  return { success: true, data: 'Setup complete' };
}

// ============================================================
// Router
// ============================================================

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  const params = e.parameter || {};
  const action = params.action || '';

  let postData = {};
  if (e.postData) {
    try {
      postData = JSON.parse(e.postData.contents);
    } catch (_) {
      postData = {};
    }
  }

  let result;
  try {
    switch (action) {
      case 'setup':
        result = setupSheets();
        break;
      case 'getShows':
        result = getShows();
        break;
      case 'addShow':
        result = addShow(postData);
        break;
      case 'getTransactions':
        result = getTransactions(params);
        break;
      case 'addTransaction':
        result = addTransaction(postData);
        break;
      case 'updateTransaction':
        result = updateTransaction(postData);
        break;
      case 'deleteTransaction':
        result = deleteTransaction(postData);
        break;
      case 'getChecklist':
        result = getChecklist(params);
        break;
      case 'initChecklist':
        result = initChecklist(postData);
        break;
      case 'updateChecklistItem':
        result = updateChecklistItem(postData);
        break;
      case 'addChecklistItem':
        result = addChecklistItem(postData);
        break;
      case 'batchImportTransactions':
        result = batchImportTransactions(postData);
        break;
      case 'migrateRenameShowToProject':
        result = migrateRenameShowToProject();
        break;
      case 'migrateAnalyticsCleanup':
        result = migrateAnalyticsCleanup();
        break;
      case 'migrateTaxAndFundSetup':
        result = migrateTaxAndFundSetup();
        break;
      case 'getSettlements':
        result = getSettlements();
        break;
      case 'addSettlement':
        result = addSettlement(postData);
        break;
      case 'getCommonFund':
        result = getCommonFund();
        break;
      case 'getForecast':
        result = getForecast();
        break;
      case 'updateForecast':
        result = updateForecast(postData);
        break;
      default:
        result = { success: false, error: '未知的 action: ' + action };
    }
  } catch (err) {
    result = { success: false, error: err.message };
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================================
// Show Management
// ============================================================

function getShows() {
  const ss = getSpreadsheet();
  const sheet = getOrCreateSheet(ss, SHEET_NAMES.SHOWS, ['專案名稱', '建立日期', '狀態']);
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return { success: true, data: [] };
  }
  const data = sheet.getRange(2, 1, lastRow - 1, 3).getValues();
  const shows = data.map((row, i) => ({
    id: i + 2,
    name: row[0],
    createdDate: row[1],
    status: row[2],
  }));
  return { success: true, data: shows };
}

function addShow(payload) {
  const name = (payload.name || '').trim();
  if (!name) {
    return { success: false, error: '專案名稱不可為空' };
  }
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.SHOWS);
  const now = new Date().toISOString().split('T')[0];
  sheet.appendRow([name, now, '進行中']);
  return { success: true, data: { name: name } };
}

// ============================================================
// Transaction Management
// ============================================================

function getTransactions(params) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.TRANSACTIONS);
  if (!sheet) return { success: true, data: [] };
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return { success: true, data: [] };

  const numCols = Math.max(sheet.getLastColumn(), 11);
  const data = sheet.getRange(2, 1, lastRow - 1, numCols).getValues();
  let transactions = data.map((row, i) => ({
    id: i + 2,
    showName: row[0],
    category: row[1],
    notes: row[2],
    amount: row[3],
    advancedBy: row[4],
    excludedMembers: row[5] || '',
    settled: row[6] === '已結清',
    date: row[7],
    recordedBy: row[8],
    paidByFund: row[9] === true || row[9] === 'TRUE' || row[9] === 'true',
    autoGenerated: row[10] === true || row[10] === 'TRUE' || row[10] === 'true',
  }));

  const showFilter = params.show || '';
  if (showFilter) {
    transactions = transactions.filter(t => t.showName === showFilter);
  }

  return { success: true, data: transactions };
}

function addTransaction(payload) {
  return addTransactionInternal(payload, false);
}

function addTransactionInternal(payload, isInternal) {
  const showName = (payload.showName || '').trim();
  const category = (payload.category || '').trim();
  const notes = (payload.notes || '').trim();
  const amount = Number(payload.amount);
  if (!showName || !category || isNaN(amount)) {
    return { success: false, error: '專案名稱、分類、金額為必填' };
  }
  const autoGenerated = !!payload.autoGenerated;
  if (autoGenerated && !isInternal) {
    return { success: false, error: '系統自動交易只能由系統產生' };
  }

  // 規則強制：收入不能 paidByFund；paidByFund 支出的 excludedMembers 強制為空
  const isIncome = amount > 0;
  let paidByFund = !!payload.paidByFund;
  if (isIncome) paidByFund = false;
  let excludedMembers = (payload.excludedMembers || '').trim();
  if (paidByFund) excludedMembers = '';

  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.TRANSACTIONS);
  const advancedBy = paidByFund ? '' : (payload.advancedBy || '').trim();
  const settled = advancedBy ? '未結清' : '已結清';
  const date = payload.date || new Date().toISOString().split('T')[0];
  const recordedBy = (payload.recordedBy || '').trim();

  sheet.appendRow([
    showName, category, notes, amount, advancedBy, excludedMembers,
    settled, date, recordedBy, paidByFund, autoGenerated,
  ]);

  if (!isInternal) {
    recalcTaxReserveForShow(showName);
  }
  return { success: true, data: { category: category, amount: amount } };
}

function updateTransaction(payload) {
  return updateTransactionInternal(payload, false);
}

function updateTransactionInternal(payload, isInternal) {
  const rowId = Number(payload.id);
  if (!rowId || rowId < 2) {
    return { success: false, error: '無效的交易 ID' };
  }
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.TRANSACTIONS);
  const rowData = sheet.getRange(rowId, 1, 1, sheet.getLastColumn()).getValues()[0];
  const currentAutoGenerated = rowData[TX_COL.AUTO_GENERATED - 1] === true
    || rowData[TX_COL.AUTO_GENERATED - 1] === 'TRUE' || rowData[TX_COL.AUTO_GENERATED - 1] === 'true';
  if (currentAutoGenerated && !isInternal) {
    return { success: false, error: '系統自動產生的稅務預留不可編輯' };
  }

  const showName = rowData[TX_COL.SHOW - 1];
  const currentAmount = rowData[TX_COL.AMOUNT - 1];

  if (payload.category !== undefined) {
    sheet.getRange(rowId, TX_COL.CATEGORY).setValue(payload.category);
  }
  if (payload.notes !== undefined) {
    sheet.getRange(rowId, TX_COL.NOTES).setValue(payload.notes);
  }
  if (payload.amount !== undefined) {
    sheet.getRange(rowId, TX_COL.AMOUNT).setValue(Number(payload.amount));
  }
  if (payload.advancedBy !== undefined) {
    sheet.getRange(rowId, TX_COL.ADVANCED_BY).setValue(payload.advancedBy);
  }
  if (payload.excludedMembers !== undefined) {
    sheet.getRange(rowId, TX_COL.EXCLUDED).setValue(payload.excludedMembers);
  }
  if (payload.settled !== undefined) {
    const status = payload.settled ? '已結清' : '未結清';
    sheet.getRange(rowId, TX_COL.SETTLED).setValue(status);
  }
  if (payload.date !== undefined) {
    sheet.getRange(rowId, TX_COL.DATE).setValue(payload.date);
  }
  if (payload.recordedBy !== undefined) {
    sheet.getRange(rowId, TX_COL.RECORDER).setValue(payload.recordedBy);
  }
  if (payload.paidByFund !== undefined) {
    const newAmount = payload.amount !== undefined ? Number(payload.amount) : currentAmount;
    const paidByFund = newAmount > 0 ? false : !!payload.paidByFund;
    sheet.getRange(rowId, TX_COL.PAID_BY_FUND).setValue(paidByFund);
    if (paidByFund) {
      sheet.getRange(rowId, TX_COL.EXCLUDED).setValue('');
      sheet.getRange(rowId, TX_COL.ADVANCED_BY).setValue('');
      sheet.getRange(rowId, TX_COL.SETTLED).setValue('已結清');
    }
  }

  if (!isInternal) {
    recalcTaxReserveForShow(showName);
    if (payload.showName && payload.showName !== showName) {
      recalcTaxReserveForShow(payload.showName);
    }
  }
  return { success: true, data: { id: rowId } };
}

function deleteTransaction(payload) {
  return deleteTransactionInternal(payload, false);
}

function deleteTransactionInternal(payload, isInternal) {
  const rowId = Number(payload.id);
  if (!rowId || rowId < 2) {
    return { success: false, error: '無效的交易 ID' };
  }
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.TRANSACTIONS);
  if (rowId > sheet.getLastRow()) {
    return { success: false, error: '找不到該筆交易' };
  }
  const rowData = sheet.getRange(rowId, 1, 1, sheet.getLastColumn()).getValues()[0];
  const currentAutoGenerated = rowData[TX_COL.AUTO_GENERATED - 1] === true
    || rowData[TX_COL.AUTO_GENERATED - 1] === 'TRUE' || rowData[TX_COL.AUTO_GENERATED - 1] === 'true';
  if (currentAutoGenerated && !isInternal) {
    return { success: false, error: '系統自動產生的稅務預留不可刪除' };
  }
  const showName = rowData[TX_COL.SHOW - 1];
  sheet.deleteRow(rowId);

  if (!isInternal) {
    recalcTaxReserveForShow(showName);
  }
  return { success: true, data: { id: rowId } };
}

// ============================================================
// Tax Reserve：每個 show × 每個 excludedMembers 分組自動建立一筆支出
// ============================================================

function recalcTaxReserveForShow(showName) {
  if (!showName || showName === FUND_SHOW_NAME) return;
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.TRANSACTIONS);
  if (!sheet) return;
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return;

  const numCols = Math.max(sheet.getLastColumn(), 11);
  const data = sheet.getRange(2, 1, lastRow - 1, numCols).getValues();

  // Step 1: 刪除既有 autoGenerated + 稅務預留 rows（bottom-up 刪除避免 index 錯位）
  const rowsToDelete = [];
  data.forEach((row, i) => {
    if (row[TX_COL.SHOW - 1] !== showName) return;
    if (row[TX_COL.CATEGORY - 1] !== TAX_RESERVE_CATEGORY) return;
    const auto = row[TX_COL.AUTO_GENERATED - 1];
    if (auto === true || auto === 'TRUE' || auto === 'true') {
      rowsToDelete.push(i + 2);
    }
  });
  rowsToDelete.sort((a, b) => b - a).forEach(r => sheet.deleteRow(r));

  // Step 2: 重新讀取 + 依 excludedMembers 分組收入
  const lastRow2 = sheet.getLastRow();
  if (lastRow2 <= 1) return;
  const data2 = sheet.getRange(2, 1, lastRow2 - 1, numCols).getValues();

  const groups = {}; // key: excludedMembers string, value: { total, latestDate }
  data2.forEach(row => {
    if (row[TX_COL.SHOW - 1] !== showName) return;
    const amount = Number(row[TX_COL.AMOUNT - 1]) || 0;
    if (amount <= 0) return; // 只看收入
    const key = (row[TX_COL.EXCLUDED - 1] || '').toString().trim();
    const dateVal = row[TX_COL.DATE - 1];
    if (!groups[key]) groups[key] = { total: 0, latestDate: dateVal };
    groups[key].total += amount;
    if (dateVal && (!groups[key].latestDate || dateVal > groups[key].latestDate)) {
      groups[key].latestDate = dateVal;
    }
  });

  // Step 3: 為每組寫入一筆 autoGenerated 稅務預留
  Object.keys(groups).forEach(key => {
    const reserveAmount = Math.round(groups[key].total * TAX_RESERVE_RATE);
    if (reserveAmount <= 0) return;
    const date = groups[key].latestDate || new Date().toISOString().split('T')[0];
    const dateStr = (date instanceof Date) ? Utilities.formatDate(date, 'Asia/Taipei', 'yyyy-MM-dd') : date;
    sheet.appendRow([
      showName, TAX_RESERVE_CATEGORY,
      '系統自動：營所稅預留 3%', -reserveAmount,
      '', key, '已結清', dateStr, SYSTEM_RECORDER, false, true,
    ]);
  });
}

// ============================================================
// Checklist Management
// ============================================================

function getChecklist(params) {
  const showName = params.show || '';
  if (!showName) {
    return { success: false, error: '請指定專案名稱' };
  }
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.CHECKLIST);
  if (!sheet) return { success: true, data: [] };
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return { success: true, data: [] };

  const data = sheet.getRange(2, 1, lastRow - 1, 6).getValues();
  const items = [];
  data.forEach((row, i) => {
    if (row[0] === showName) {
      items.push({
        id: i + 2,
        showName: row[0],
        category: row[1],
        itemName: row[2],
        assignee: row[3],
        progress: row[4],
        notes: row[5],
      });
    }
  });

  return { success: true, data: items };
}

function initChecklist(payload) {
  const showName = (payload.showName || '').trim();
  if (!showName) {
    return { success: false, error: '請指定專案名稱' };
  }

  const ss = getSpreadsheet();
  const sheet = getOrCreateSheet(ss, SHEET_NAMES.CHECKLIST, ['專案名稱', '類別', '項目名稱', '負責人', '進度', '備註']);

  // Check if already initialized
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    const existingData = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    const hasItems = existingData.some(row => row[0] === showName);
    if (hasItems) {
      return { success: true, data: { message: '已存在，略過初始化' } };
    }
  }

  // Copy from template
  const tmplSheet = ss.getSheetByName(SHEET_NAMES.TEMPLATE);
  if (!tmplSheet || tmplSheet.getLastRow() <= 1) {
    return { success: false, error: 'Checklist模板不存在或為空' };
  }
  const tmplData = tmplSheet.getRange(2, 1, tmplSheet.getLastRow() - 1, 3).getValues();
  const rows = tmplData.map(row => [showName, row[0], row[1], row[2], '未開始', '']);
  sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, 6).setValues(rows);

  return { success: true, data: { showName: showName, itemCount: rows.length } };
}

function updateChecklistItem(payload) {
  const rowId = Number(payload.id);
  if (!rowId || rowId < 2) {
    return { success: false, error: '無效的項目 ID' };
  }
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.CHECKLIST);

  if (payload.assignee !== undefined) {
    sheet.getRange(rowId, 4).setValue(payload.assignee);
  }
  if (payload.progress !== undefined) {
    sheet.getRange(rowId, 5).setValue(payload.progress);
  }
  if (payload.notes !== undefined) {
    sheet.getRange(rowId, 6).setValue(payload.notes);
  }
  if (payload.itemName !== undefined) {
    sheet.getRange(rowId, 3).setValue(payload.itemName);
  }

  return { success: true, data: { id: rowId } };
}

function addChecklistItem(payload) {
  const showName = (payload.showName || '').trim();
  const category = (payload.category || '').trim();
  const itemName = (payload.itemName || '').trim();
  if (!showName || !itemName) {
    return { success: false, error: '專案名稱與項目名稱為必填' };
  }
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.CHECKLIST);
  const assignee = (payload.assignee || '').trim();
  sheet.appendRow([showName, category || '自訂', itemName, assignee, '未開始', '']);
  return { success: true, data: { itemName: itemName } };
}

// ============================================================
// Batch Import (應援匯入)
// ============================================================

function batchImportTransactions(payload) {
  const transactions = payload.transactions;
  if (!Array.isArray(transactions) || transactions.length === 0) {
    return { success: false, error: '沒有要匯入的交易資料' };
  }
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.TRANSACTIONS);

  // Headers: 專案名稱, 分類, 備註, 金額, 墊款人, 排除成員, 結清狀態, 日期, 登記人, 由共同基金支付, 系統自動
  const rows = transactions.map(t => [
    (t.showName || '').trim(),
    (t.category || '').trim(),
    (t.notes || '').trim(),
    Number(t.amount) || 0,
    '',           // 墊款人 (empty for imports)
    '',           // 排除成員
    '已結清',     // 結清狀態
    t.date || new Date().toISOString().split('T')[0],
    (t.recordedBy || '應援匯入').trim(),
    false,        // 由共同基金支付
    false,        // 系統自動
  ]);

  sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, 11).setValues(rows);

  // 重算所有受影響 show 的稅務預留
  const affectedShows = {};
  rows.forEach(r => { if (r[0]) affectedShows[r[0]] = true; });
  Object.keys(affectedShows).forEach(s => recalcTaxReserveForShow(s));

  return { success: true, data: { count: rows.length } };
}

// ============================================================
// Data Migration: 演出 → 專案
// ============================================================

function migrateRenameShowToProject() {
  const ss = getSpreadsheet();
  let updated = 0;

  // 1. Rename sheet tab 演出清單 → 專案清單
  const oldSheet = ss.getSheetByName('演出清單');
  if (oldSheet) {
    oldSheet.setName('專案清單');
  }

  // 2. Rename sheet header 演出名稱 → 專案名稱
  const showSheet = ss.getSheetByName('專案清單');
  if (showSheet && showSheet.getRange(1, 1).getValue() === '演出名稱') {
    showSheet.getRange(1, 1).setValue('專案名稱');
  }

  // 3. Rename transaction sheet header
  const txSheet = ss.getSheetByName(SHEET_NAMES.TRANSACTIONS);
  if (txSheet && txSheet.getRange(1, 1).getValue() === '演出名稱') {
    txSheet.getRange(1, 1).setValue('專案名稱');
  }

  // 4. Rename checklist sheet header
  const clSheet = ss.getSheetByName(SHEET_NAMES.CHECKLIST);
  if (clSheet && clSheet.getRange(1, 1).getValue() === '演出名稱') {
    clSheet.getRange(1, 1).setValue('專案名稱');
  }

  // 5. Move membership records from 會員與其他收支 → 看我笑話會員
  if (txSheet) {
    const lastRow = txSheet.getLastRow();
    if (lastRow > 1) {
      const data = txSheet.getRange(2, 1, lastRow - 1, 2).getValues();
      data.forEach((row, i) => {
        if (row[0] === '會員與其他收支' && row[1] === '付費會員') {
          txSheet.getRange(i + 2, 1).setValue('看我笑話會員');
          updated++;
        }
      });
    }
  }

  return { success: true, data: { sheetRenamed: !!oldSheet, recordsUpdated: updated } };
}

// ============================================================
// Data Migration: Analytics Cleanup
// ============================================================

function migrateAnalyticsCleanup() {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.SHOWS);
  if (!sheet) return { success: true, data: { message: 'Sheet not found' } };

  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return { success: true, data: { message: 'No data' } };

  const data = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  let removedRow = null;
  let bigCakeRow = null;
  let openingPartyRow = null;

  // Find rows (scan from bottom for safe deletion)
  data.forEach((row, i) => {
    const name = row[0];
    if (name === '會員與其他收支') removedRow = i + 2;
    if (name.includes('看我畫大餅') || name.includes('年度大會')) bigCakeRow = i + 2;
    if (name.includes('Opening Party')) openingPartyRow = i + 2;
  });

  // 1. Delete 會員與其他收支
  let deleted = false;
  if (removedRow) {
    sheet.deleteRow(removedRow);
    deleted = true;
    // Adjust row indices after deletion
    if (bigCakeRow && bigCakeRow > removedRow) bigCakeRow--;
    if (openingPartyRow && openingPartyRow > removedRow) openingPartyRow--;
  }

  // 2. Move 畫大餅 before Opening Party (if not already)
  let moved = false;
  if (bigCakeRow && openingPartyRow && bigCakeRow > openingPartyRow) {
    const rowData = sheet.getRange(bigCakeRow, 1, 1, sheet.getLastColumn()).getValues();
    sheet.deleteRow(bigCakeRow);
    sheet.insertRowBefore(openingPartyRow);
    sheet.getRange(openingPartyRow, 1, 1, rowData[0].length).setValues(rowData);
    moved = true;
  }

  return { success: true, data: { deleted, moved } };
}

// ============================================================
// Member Settlements (成員結算)
// ============================================================

function getSettlements() {
  const ss = getSpreadsheet();
  const sheet = getOrCreateSheet(ss, SHEET_NAMES.SETTLEMENTS, ['成員', '金額', '日期', '備註']);
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return { success: true, data: [] };

  const data = sheet.getRange(2, 1, lastRow - 1, 4).getValues();
  const settlements = data.map((row, i) => ({
    id: i + 2,
    member: row[0],
    amount: row[1],
    date: row[2],
    notes: row[3],
  }));
  return { success: true, data: settlements };
}

function getCommonFund() {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.TRANSACTIONS);
  const emptyResult = {
    commonIncome: 0, commonExpense: 0, commonNetProfit: 0, commonFund: 0,
    fundReserved: 0, fundUsed: 0, fundBalance: 0,
  };
  if (!sheet) return { success: true, data: emptyResult };
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return { success: true, data: emptyResult };

  const numCols = Math.max(sheet.getLastColumn(), 11);
  const data = sheet.getRange(2, 1, lastRow - 1, numCols).getValues();
  let commonIncome = 0;
  let commonExpense = 0;
  let fundUsed = 0;
  data.forEach(row => {
    const amount = Number(row[TX_COL.AMOUNT - 1]) || 0;
    const excludedMembers = (row[TX_COL.EXCLUDED - 1] || '').toString().trim();
    const paidByFund = row[TX_COL.PAID_BY_FUND - 1] === true
      || row[TX_COL.PAID_BY_FUND - 1] === 'TRUE' || row[TX_COL.PAID_BY_FUND - 1] === 'true';

    // paidByFund 支出不計入共同支出（避免雙扣）
    if (paidByFund && amount < 0) {
      fundUsed += Math.abs(amount);
      return;
    }
    if (excludedMembers === '') {
      if (amount > 0) commonIncome += amount;
      else commonExpense += amount;
    }
  });

  const commonNetProfit = commonIncome + commonExpense;
  const fundReserved = commonNetProfit * 0.2;
  const fundBalance = fundReserved - fundUsed;

  // Write summary to 共同基金 sheet
  const fundSheet = getOrCreateSheet(ss, '共同基金', ['項目', '金額']);
  fundSheet.getRange(2, 1, 6, 2).setValues([
    ['共同收入', commonIncome],
    ['共同支出', commonExpense],
    ['共同淨利', commonNetProfit],
    ['提撥 20%（基金累積）', fundReserved],
    ['基金已動用', fundUsed],
    ['基金餘額', fundBalance],
  ]);

  return {
    success: true,
    data: {
      commonIncome, commonExpense, commonNetProfit,
      commonFund: fundReserved,
      fundReserved, fundUsed, fundBalance,
    },
  };
}

function addSettlement(payload) {
  const member = (payload.member || '').trim();
  const amount = Number(payload.amount);
  if (!member || isNaN(amount) || amount <= 0) {
    return { success: false, error: '成員和金額為必填' };
  }
  const ss = getSpreadsheet();
  const sheet = getOrCreateSheet(ss, SHEET_NAMES.SETTLEMENTS, ['成員', '金額', '日期', '備註']);
  const date = payload.date || new Date().toISOString().split('T')[0];
  const notes = (payload.notes || '').trim();
  sheet.appendRow([member, amount, date, notes]);

  // Auto-settle all unsettled advances for this member
  const txSheet = ss.getSheetByName(SHEET_NAMES.TRANSACTIONS);
  let settledCount = 0;
  if (txSheet) {
    const lastRow = txSheet.getLastRow();
    if (lastRow > 1) {
      const data = txSheet.getRange(2, 5, lastRow - 1, 3).getValues(); // cols 5-7: 墊款人, 排除成員, 結清狀態
      data.forEach((row, i) => {
        if (row[0] === member && row[2] === '未結清') {
          txSheet.getRange(i + 2, 7).setValue('已結清');
          settledCount++;
        }
      });
    }
  }

  return { success: true, data: { member, amount, advancesSettled: settledCount } };
}

// ============================================================
// Forecast (財務預估)
// ============================================================

function getForecast() {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName('財務預估');
  if (!sheet) return { success: false, error: '找不到「財務預估」工作表' };

  const data = sheet.getRange('A1:G69').getValues();

  function readRows(startRow, endRow, cols) {
    const rows = [];
    for (let r = startRow - 1; r < endRow; r++) {
      const label = data[r][0];
      if (!label) continue;
      if (cols === 1) {
        rows.push({ row: r + 1, label: label, value: data[r][1] });
      } else {
        rows.push({ row: r + 1, label: label, values: [data[r][1], data[r][2], data[r][3]] });
      }
    }
    return rows;
  }

  // 基礎參數 (row 4-19, single value in col B)
  const baseParams = [];
  for (let r = 3; r < 19; r++) {
    const label = data[r][0];
    if (!label) continue;
    baseParams.push({ row: r + 1, label: label, value: data[r][1], extraD: data[r][3], extraE: data[r][4] });
  }

  // 版本參數 (row 22-31, three columns B/C/D)
  const versionParams = {
    headers: ['保守版', '基礎版', '激進版'],
    rows: readRows(22, 31, 3)
  };

  // 收入計算 (row 36-47)
  const income = {
    headers: ['保守版', '基礎版', '激進版'],
    rows: readRows(36, 47, 3)
  };

  // 支出計算 (row 51-58)
  const expense = {
    headers: ['保守版', '基礎版', '激進版'],
    rows: readRows(51, 58, 3)
  };

  // 損益彙總 (row 62-63)
  const pnl = {
    headers: ['保守版', '基礎版', '激進版'],
    rows: readRows(62, 63, 3)
  };

  // 分潤規劃 (row 67-69)
  const profitShare = {
    headers: ['保守版', '基礎版', '激進版'],
    rows: readRows(67, 69, 3)
  };

  return {
    success: true,
    data: { baseParams, versionParams, income, expense, pnl, profitShare }
  };
}

function updateForecast(payload) {
  const baseParams = payload.baseParams;
  const versionParams = payload.versionParams;
  if ((!baseParams || baseParams.length === 0) && (!versionParams || versionParams.length === 0)) {
    return { success: false, error: '沒有要更新的參數' };
  }

  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName('財務預估');
  if (!sheet) return { success: false, error: '找不到「財務預估」工作表' };

  let updated = 0;

  if (baseParams) {
    baseParams.forEach(p => {
      sheet.getRange(p.row, 2).setValue(p.value);
      updated++;
    });
  }

  if (versionParams) {
    versionParams.forEach(p => {
      sheet.getRange(p.row, 2).setValue(p.values[0]);
      sheet.getRange(p.row, 3).setValue(p.values[1]);
      sheet.getRange(p.row, 4).setValue(p.values[2]);
      updated++;
    });
  }

  return { success: true, data: { updated } };
}

// ============================================================
// One-time Migration: 稅務預留 + 共同基金支付
// 執行順序：
//   1. 確保 收支紀錄 sheet 有 11 欄（paidByFund、autoGenerated），既有 row 回填 false
//   2. 確保 專案清單 有「共同基金支出」
//   3. 為所有既有 show 重算稅務預留
//   4. 寫入一筆年度會計費 $13,000（放在「共同基金支出」、paidByFund=true）
// 冪等：可重複執行，不會重複寫入會計費或稅務預留
// ============================================================

function migrateTaxAndFundSetup() {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.TRANSACTIONS);
  if (!sheet) return { success: false, error: '找不到「收支紀錄」工作表' };

  // 1. 確保 header 擴充到 11 欄
  const headerRange = sheet.getRange(1, 1, 1, TX_HEADERS.length);
  headerRange.setValues([TX_HEADERS]);
  headerRange.setFontWeight('bold');

  // 1b. 既有 row 回填 paidByFund / autoGenerated 為 false
  const lastRow = sheet.getLastRow();
  let backfilled = 0;
  if (lastRow > 1) {
    const numCols = sheet.getMaxColumns();
    const paidRange = sheet.getRange(2, TX_COL.PAID_BY_FUND, lastRow - 1, 1);
    const autoRange = sheet.getRange(2, TX_COL.AUTO_GENERATED, lastRow - 1, 1);
    const paidValues = paidRange.getValues();
    const autoValues = autoRange.getValues();
    for (let i = 0; i < paidValues.length; i++) {
      if (paidValues[i][0] === '' || paidValues[i][0] === null) {
        paidValues[i][0] = false;
        backfilled++;
      }
      if (autoValues[i][0] === '' || autoValues[i][0] === null) {
        autoValues[i][0] = false;
      }
    }
    paidRange.setValues(paidValues);
    autoRange.setValues(autoValues);
  }

  // 2. 確保「共同基金支出」show 存在
  const showSheet = ss.getSheetByName(SHEET_NAMES.SHOWS);
  let fundShowAdded = false;
  if (showSheet) {
    const showLastRow = showSheet.getLastRow();
    let exists = false;
    if (showLastRow > 1) {
      const names = showSheet.getRange(2, 1, showLastRow - 1, 1).getValues().flat();
      exists = names.indexOf(FUND_SHOW_NAME) !== -1;
    }
    if (!exists) {
      const now = new Date().toISOString().split('T')[0];
      showSheet.appendRow([FUND_SHOW_NAME, now, '進行中']);
      fundShowAdded = true;
    }
  }

  // 3. 為所有 show 重算稅務預留
  const shows = {};
  const lastRow2 = sheet.getLastRow();
  if (lastRow2 > 1) {
    const names = sheet.getRange(2, 1, lastRow2 - 1, 1).getValues();
    names.forEach(row => { if (row[0]) shows[row[0]] = true; });
  }
  Object.keys(shows).forEach(s => recalcTaxReserveForShow(s));

  // 4. 寫入年度會計費（僅在尚未存在時）
  const annualFeeNotes = '年度會計費用';
  const lastRow3 = sheet.getLastRow();
  let feeAdded = false;
  let feeExists = false;
  if (lastRow3 > 1) {
    const data = sheet.getRange(2, 1, lastRow3 - 1, 11).getValues();
    feeExists = data.some(row =>
      row[TX_COL.SHOW - 1] === FUND_SHOW_NAME
      && row[TX_COL.NOTES - 1] === annualFeeNotes
    );
  }
  if (!feeExists) {
    const today = new Date().toISOString().split('T')[0];
    sheet.appendRow([
      FUND_SHOW_NAME, '行政雜支', annualFeeNotes, -13000,
      '', '', '已結清', today, SYSTEM_RECORDER, true, false,
    ]);
    feeAdded = true;
  }

  return {
    success: true,
    data: { backfilled, fundShowAdded, feeAdded, showsRecalculated: Object.keys(shows).length },
  };
}
