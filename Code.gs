// ─── TTCP Conference Sign-In — Apps Script Web App ───────────────────────────
// Deploy as: Execute as Me / Anyone can access (no sign-in)
// ─────────────────────────────────────────────────────────────────────────────

// CONFIGURE THESE:
const SPREADSHEET_ID  = 'YOUR_SPREADSHEET_ID_HERE';      // from the Sheet URL
const RESPONSES_SHEET = 'Responses';                      // tab name for sign-ins
const DRIVE_FOLDER_ID = 'YOUR_DRIVE_FOLDER_ID_HERE';     // folder for sig images

// ─────────────────────────────────────────────────────────────────────────────

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const name      = data.name      || '';
    const timestamp = data.timestamp || new Date().toISOString();
    const sigData   = data.signature || '';   // base64 data URL

    if (!name || !sigData) {
      return respond({ status: 'error', message: 'Missing name or signature' });
    }

    // 1. Save signature image to Drive
    const imageUrl = saveSignatureImage(name, timestamp, sigData);

    // 2. Write row to Responses sheet
    const ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = getOrCreateSheet(ss, RESPONSES_SHEET);
    ensureHeader(sheet);

    const localTime = Utilities.formatDate(
      new Date(timestamp),
      Session.getScriptTimeZone(),
      'yyyy-MM-dd HH:mm:ss'
    );

    sheet.appendRow([
      localTime,          // A: Timestamp (local)
      name,               // B: Name
      imageUrl,           // C: Signature image URL
      timestamp           // D: ISO timestamp (UTC)
    ]);

    return respond({ status: 'ok', name, imageUrl });

  } catch(err) {
    console.error(err);
    return respond({ status: 'error', message: err.toString() });
  }
}

// Also handle GET for simple connectivity check
function doGet(e) {
  return respond({ status: 'ok', message: 'TTCP Sign-In endpoint active' });
}

// ── HELPERS ───────────────────────────────────────────────────────────────────

function saveSignatureImage(name, timestamp, dataUrl) {
  // Strip the "data:image/png;base64," prefix
  const base64 = dataUrl.replace(/^data:image\/png;base64,/, '');
  const blob   = Utilities.newBlob(Utilities.base64Decode(base64), 'image/png');

  // Build filename: FirstLast_20250528_143022.png
  const safeName = name
    .replace(/\s+/g, '')        // remove spaces
    .replace(/[^a-zA-Z0-9]/g, '') // strip special chars
    .substring(0, 40);

  const dateStr = Utilities.formatDate(
    new Date(timestamp),
    Session.getScriptTimeZone(),
    'yyyyMMdd_HHmmss'
  );

  blob.setName(safeName + '_' + dateStr + '.png');

  const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  const file   = folder.createFile(blob);

  // Make viewable by anyone with the link (for the sheet hyperlink)
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  return file.getUrl();
}

function getOrCreateSheet(ss, name) {
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

function ensureHeader(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Timestamp', 'Name', 'Signature Image', 'ISO Timestamp (UTC)']);
    sheet.getRange(1, 1, 1, 4).setFontWeight('bold').setBackground('#023C4F').setFontColor('#FFFFFF');
    sheet.setFrozenRows(1);
  }
}

function respond(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
