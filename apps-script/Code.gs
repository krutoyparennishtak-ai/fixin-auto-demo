/**
 * Google Apps Script — backend for Fixin Auto Guest Wall
 *
 * Deploy: Extensions > Apps Script > Deploy > Web app
 *   Execute as: Me
 *   Who has access: Anyone
 *
 * Sheet setup: Create a Google Sheet named "Fixin_Auto_Wall"
 *   Row 1 headers: timestamp | message | status
 */

var SHEET_NAME = 'Messages';

var BLOCKED_PATTERNS = [
  /\bn[i1!]gg[e3]r/i,
  /\bn[i1!]gg[a@]/i,
  /\bk[i1!]ke\b/i,
  /\bsp[i1!]c\b/i,
  /\bch[i1!]nk\b/i,
  /\bw[e3]tb[a@]ck/i,
  /\bg[o0][o0]k\b/i,
  /\bcoon\b/i,
  /\bdarkie/i,
  /\brag\s*head/i,
  /\btowel\s*head/i,
  /\bkill\s*(all\s*)?women/i,
  /\bf[a@]gg[o0]t/i,
  /\btr[a@]nn[yi1!e3]/i,
  /\bkill\s*(all|them|every)/i,
  /\bgenocide\s*(is\s*)?(good|based|needed)/i,
  /\bgas\s*(the|all)\b/i,
  /\bexterminate/i,
  /\beth?nic\s*cleansing/i,
  /\bh[o0]l[o0]caust\s*(was\s*)?(fake|hoax|didn'?t)/i,
  /\brace\s*war/i,
  /\bwhite\s*power/i,
  /\bheil\s*h[i1!]tler/i,
  /\b14\s*88\b/i,
  /\bsieg\s*heil/i
];

function normalize(text) {
  return text
    .replace(/0/g, 'o')
    .replace(/@/g, 'a')
    .replace(/1/g, 'i')
    .replace(/3/g, 'e')
    .replace(/\$/g, 's')
    .toLowerCase()
    .trim();
}

function moderate(text) {
  var normalized = normalize(text);
  for (var i = 0; i < BLOCKED_PATTERNS.length; i++) {
    if (BLOCKED_PATTERNS[i].test(normalized)) {
      return false;
    }
  }
  return true;
}

function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['timestamp', 'message', 'status']);
  }
  return sheet;
}

function isDuplicate(sheet, text) {
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return false;

  var checkRows = Math.min(10, lastRow - 1);
  var range = sheet.getRange(lastRow - checkRows + 1, 1, checkRows, 3);
  var data = range.getValues();
  var now = new Date();

  for (var i = data.length - 1; i >= 0; i--) {
    var ts = new Date(data[i][0]);
    var msg = data[i][1];
    if ((now - ts) < 30000 && msg === text) {
      return true;
    }
  }
  return false;
}

function doPost(e) {
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);

  try {
    var params = e.parameter;
    var message = (params.message || '').trim();

    if (!message) {
      output.setContent(JSON.stringify({ success: false, reason: 'Empty message' }));
      return output;
    }

    if (message.length > 200) {
      output.setContent(JSON.stringify({ success: false, reason: 'Too long' }));
      return output;
    }

    var sheet = getSheet();

    if (isDuplicate(sheet, message)) {
      output.setContent(JSON.stringify({ success: false, reason: 'Duplicate' }));
      return output;
    }

    var status = moderate(message) ? 'approved' : 'rejected';
    var timestamp = new Date().toISOString();

    sheet.appendRow([timestamp, message, status]);

    output.setContent(JSON.stringify({ success: status === 'approved', status: status }));
  } catch (err) {
    output.setContent(JSON.stringify({ success: false, reason: err.message }));
  }

  return output;
}

function doGet(e) {
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);

  try {
    var limit = parseInt((e.parameter || {}).limit || '20', 10);
    if (isNaN(limit) || limit < 1) limit = 20;
    if (limit > 100) limit = 100;

    var sheet = getSheet();
    var lastRow = sheet.getLastRow();

    if (lastRow <= 1) {
      output.setContent(JSON.stringify([]));
      return output;
    }

    var data = sheet.getRange(2, 1, lastRow - 1, 3).getValues();
    var approved = [];

    for (var i = data.length - 1; i >= 0; i--) {
      if (data[i][2] === 'approved') {
        approved.push({
          text: data[i][1],
          timestamp: data[i][0] instanceof Date
            ? data[i][0].toISOString()
            : String(data[i][0])
        });
        if (approved.length >= limit) break;
      }
    }

    output.setContent(JSON.stringify(approved));
  } catch (err) {
    output.setContent(JSON.stringify([]));
  }

  return output;
}
