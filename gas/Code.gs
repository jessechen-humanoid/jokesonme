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
  getOrCreateSheet(ss, SHEET_NAMES.TRANSACTIONS, ['專案名稱', '分類', '備註', '金額', '墊款人', '排除成員', '結清狀態', '日期', '登記人']);

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
      case 'getSettlements':
        result = getSettlements();
        break;
      case 'addSettlement':
        result = addSettlement(postData);
        break;
      case 'getCommonFund':
        result = getCommonFund();
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

  const data = sheet.getRange(2, 1, lastRow - 1, 9).getValues();
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
  }));

  const showFilter = params.show || '';
  if (showFilter) {
    transactions = transactions.filter(t => t.showName === showFilter);
  }

  return { success: true, data: transactions };
}

function addTransaction(payload) {
  const showName = (payload.showName || '').trim();
  const category = (payload.category || '').trim();
  const notes = (payload.notes || '').trim();
  const amount = Number(payload.amount);
  if (!showName || !category || isNaN(amount)) {
    return { success: false, error: '專案名稱、分類、金額為必填' };
  }
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.TRANSACTIONS);
  const advancedBy = (payload.advancedBy || '').trim();
  const excludedMembers = (payload.excludedMembers || '').trim();
  const settled = advancedBy ? '未結清' : '已結清';
  const date = payload.date || new Date().toISOString().split('T')[0];
  const recordedBy = (payload.recordedBy || '').trim();

  sheet.appendRow([showName, category, notes, amount, advancedBy, excludedMembers, settled, date, recordedBy]);
  return { success: true, data: { category: category, amount: amount } };
}

function updateTransaction(payload) {
  const rowId = Number(payload.id);
  if (!rowId || rowId < 2) {
    return { success: false, error: '無效的交易 ID' };
  }
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.TRANSACTIONS);

  if (payload.category !== undefined) {
    sheet.getRange(rowId, 2).setValue(payload.category);
  }
  if (payload.notes !== undefined) {
    sheet.getRange(rowId, 3).setValue(payload.notes);
  }
  if (payload.amount !== undefined) {
    sheet.getRange(rowId, 4).setValue(Number(payload.amount));
  }
  if (payload.advancedBy !== undefined) {
    sheet.getRange(rowId, 5).setValue(payload.advancedBy);
  }
  if (payload.excludedMembers !== undefined) {
    sheet.getRange(rowId, 6).setValue(payload.excludedMembers);
  }
  if (payload.settled !== undefined) {
    const status = payload.settled ? '已結清' : '未結清';
    sheet.getRange(rowId, 7).setValue(status);
  }
  if (payload.date !== undefined) {
    sheet.getRange(rowId, 8).setValue(payload.date);
  }
  if (payload.recordedBy !== undefined) {
    sheet.getRange(rowId, 9).setValue(payload.recordedBy);
  }

  return { success: true, data: { id: rowId } };
}

function deleteTransaction(payload) {
  const rowId = Number(payload.id);
  if (!rowId || rowId < 2) {
    return { success: false, error: '無效的交易 ID' };
  }
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.TRANSACTIONS);
  if (rowId > sheet.getLastRow()) {
    return { success: false, error: '找不到該筆交易' };
  }
  sheet.deleteRow(rowId);
  return { success: true, data: { id: rowId } };
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

  // Headers: 專案名稱, 分類, 備註, 金額, 墊款人, 排除成員, 結清狀態, 日期, 登記人
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
  ]);

  sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, 9).setValues(rows);
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
  if (!sheet) return { success: true, data: { commonIncome: 0, commonExpense: 0, commonNetProfit: 0, commonFund: 0 } };
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return { success: true, data: { commonIncome: 0, commonExpense: 0, commonNetProfit: 0, commonFund: 0 } };

  const data = sheet.getRange(2, 1, lastRow - 1, 9).getValues();
  // Col index: 0=專案名稱, 1=分類, 2=備註, 3=金額, 4=墊款人, 5=排除成員, 6=結清狀態, 7=日期, 8=登記人
  let commonIncome = 0;
  let commonExpense = 0;
  data.forEach(row => {
    const amount = row[3];
    const excludedMembers = (row[5] || '').toString().trim();
    if (excludedMembers === '') {
      if (amount > 0) commonIncome += amount;
      else commonExpense += amount;
    }
  });

  const commonNetProfit = commonIncome + commonExpense;
  const commonFund = commonNetProfit * 0.2;

  // Write summary to 共同基金 sheet
  const fundSheet = getOrCreateSheet(ss, '共同基金', ['項目', '金額']);
  fundSheet.getRange(2, 1, 4, 2).setValues([
    ['共同收入', commonIncome],
    ['共同支出', commonExpense],
    ['共同淨利', commonNetProfit],
    ['提撥 20%', commonFund],
  ]);

  return { success: true, data: { commonIncome, commonExpense, commonNetProfit, commonFund } };
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
