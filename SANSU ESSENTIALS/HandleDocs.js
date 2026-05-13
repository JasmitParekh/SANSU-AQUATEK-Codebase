// This script is called upon by the bots created in Google AppSheet application.
// Whenever someone add/updates the any image/docs through the application, this script convert the default FILE_PATH written by the AppSheet into Thumbnail URLs
// Thumbnail URLs are like this: https://drive.google.com/thumbnail?sz=w1000&id=ID_OF_IMAGE

function authorizeScript() {
  Logger.log("Authorization successful. AppSheet can now call this script.");
  SpreadsheetApp.openById(WEBHOOK_CONFIG.SPREADSHEET_ID);
  DriveApp.getRootFolder();
}

// ============================================================
// CONFIGURATION
// ============================================================
const WEBHOOK_CONFIG = {

  SPREADSHEET_ID      : "14INoUy-UoxYkNlOs1dc9-D0u4SE5nkfqy-NzpGuF1OQ",
  ROOT_FOLDER_ID      : "1xwqzwzILvmsuOTU479FeD7qH3Z1Ih2OZ",
  THUMBNAIL_BASE_URL  : "https://drive.google.com/thumbnail?sz=w1000&id=",
  APPSHEET_PATH_PREFIX: "Pictures/",
  THUMBNAIL_URL_PREFIX: "https://drive.google.com/thumbnail",

  // Column name that holds EMPID in each sheet
  EMPID_COLUMN: "EMPID",

};


// ============================================================
// ENTRY POINT — Called directly by AppSheet "Call a script"
// ============================================================
function processAppSheetTrigger(sheetName, columnName, empId, newValue, oldValue) {
  Logger.log("====== processAppSheetTrigger: CALLED ======");
  Logger.log(`sheetName: "${sheetName}" | columnName: "${columnName}" | empId: "${empId}"`);
  Logger.log(`newValue: "${newValue}" | oldValue: "${oldValue}"`);

  try {

    // --- Validate incoming arguments ---
    if (!sheetName || !columnName || !empId || !newValue) {
      Logger.log("ERROR: One or more required arguments are missing.");
      return "ERROR: Missing required arguments.";
    }

    // --- Open spreadsheet ---
    const spreadsheet = SpreadsheetApp.openById(WEBHOOK_CONFIG.SPREADSHEET_ID);
    const sheet       = spreadsheet.getSheetByName(sheetName);

    if (!sheet) {
      Logger.log(`ERROR: Sheet not found — "${sheetName}"`);
      return `ERROR: Sheet not found: "${sheetName}"`;
    }

    // --- Build header map ---
    const headerMap = webhook_getHeaderMap(sheet);
    Logger.log(`Headers resolved: ${JSON.stringify(headerMap)}`);

    // --- Validate required columns ---
    if (headerMap[WEBHOOK_CONFIG.EMPID_COLUMN] === undefined) {
      Logger.log(`ERROR: EMPID column not found in sheet "${sheetName}"`);
      return `ERROR: EMPID column not found.`;
    }

    if (headerMap[columnName] === undefined) {
      Logger.log(`ERROR: Column "${columnName}" not found in sheet "${sheetName}"`);
      return `ERROR: Column "${columnName}" not found.`;
    }

    // --- Find the row by EMPID ---
    const targetRow = webhook_findRowByEmpId(sheet, headerMap, empId);

    if (!targetRow) {
      Logger.log(`ERROR: EMPID "${empId}" not found in sheet "${sheetName}"`);
      return `ERROR: EMPID "${empId}" not found.`;
    }

    Logger.log(`EMPID "${empId}" found at row ${targetRow}`);

    // --- STEP 1: Trash old file if old value was a Thumbnail URL ---
    if (oldValue && webhook_isThumbnailUrl(oldValue)) {
      Logger.log(`Old value is a Thumbnail URL. Attempting to trash old file.`);
      const oldFileId = webhook_extractFileIdFromThumbnailUrl(oldValue);
      if (oldFileId) {
        webhook_trashDriveFile(oldFileId);
      } else {
        Logger.log(`Could not extract File ID from old URL: "${oldValue}"`);
      }
    }

    // --- STEP 2: Resolve AppSheet path to Thumbnail URL ---
    if (!webhook_isAppSheetPath(newValue)) {
      Logger.log(`New value is not an AppSheet path. No action taken.`);
      return "SKIPPED: New value is not an AppSheet path.";
    }

    const fileId = webhook_resolvePathToFileId(newValue);

    if (!fileId) {
      Logger.log(`ERROR: File not found on Drive for path: "${newValue}"`);
      return `ERROR: File not found for path: "${newValue}"`;
    }

    const thumbnailUrl = webhook_buildThumbnailUrl(fileId);

    // --- STEP 3: Write Thumbnail URL back to the correct cell ---
    const targetCol = headerMap[columnName] + 1; // Convert to 1-based
    sheet.getRange(targetRow, targetCol).setValue(thumbnailUrl);

    Logger.log(`SUCCESS: Written Thumbnail URL "${thumbnailUrl}" to Row ${targetRow}, Col ${targetCol}`);
    Logger.log("====== processAppSheetTrigger: COMPLETE ======");

    return `SUCCESS: Thumbnail URL written for EMPID "${empId}".`;

  } catch (err) {
    Logger.log(`FATAL ERROR: ${err.message}`);
    return `FATAL ERROR: ${err.message}`;
  }
}


// ============================================================
// DRIVE — Traverse folder path and return File ID
// ============================================================
function webhook_resolvePathToFileId(appSheetPath) {
  const pathParts = appSheetPath.split("/").map((p) => p.trim()).filter(Boolean);

  if (pathParts.length < 2) {
    Logger.log(`webhook_resolvePathToFileId: Path too short: "${appSheetPath}"`);
    return null;
  }

  const fileName      = pathParts[pathParts.length - 1];
  const subFolderPath = pathParts.slice(1, pathParts.length - 1);

  Logger.log(`Navigating: [${subFolderPath.join(" → ")}] → File: "${fileName}"`);

  let currentFolder = DriveApp.getFolderById(WEBHOOK_CONFIG.ROOT_FOLDER_ID);

  for (const folderName of subFolderPath) {
    const iterator = currentFolder.getFoldersByName(folderName);
    if (!iterator.hasNext()) {
      Logger.log(`Subfolder not found: "${folderName}" inside "${currentFolder.getName()}"`);
      return null;
    }
    currentFolder = iterator.next();
    Logger.log(`Entered folder: "${currentFolder.getName()}"`);
  }

  const fileIterator = currentFolder.getFilesByName(fileName);
  if (!fileIterator.hasNext()) {
    Logger.log(`File not found: "${fileName}" in folder "${currentFolder.getName()}"`);
    return null;
  }

  const file = fileIterator.next();
  Logger.log(`File found — ID: "${file.getId()}" | Name: "${file.getName()}"`);
  return file.getId();
}


// ============================================================
// DRIVE — Move file to Trash
// ============================================================
function webhook_trashDriveFile(fileId) {
  try {
    const file = DriveApp.getFileById(fileId);
    file.setTrashed(true);
    Logger.log(`File moved to trash — ID: "${fileId}" | Name: "${file.getName()}"`);
  } catch (err) {
    Logger.log(`Failed to trash file ID "${fileId}" — ${err.message}`);
  }
}


// ============================================================
// HELPER — Find the row number (1-based) where EMPID matches
// ============================================================
function webhook_findRowByEmpId(sheet, headerMap, empId) {
  const lastRow     = sheet.getLastRow();
  if (lastRow < 2) return null;

  const empIdColIndex = headerMap[WEBHOOK_CONFIG.EMPID_COLUMN]; // 0-based
  const empIdValues   = sheet
    .getRange(2, empIdColIndex + 1, lastRow - 1, 1)
    .getValues();

  for (let i = 0; i < empIdValues.length; i++) {
    if (String(empIdValues[i][0]).trim() === empId) {
      return i + 2; // +1 for 0-based, +1 for header row
    }
  }

  return null;
}


// ============================================================
// HELPER — Build header map: { "COLUMN NAME": 0-based index }
// ============================================================
function webhook_getHeaderMap(sheet) {
  const lastCol   = sheet.getLastColumn();
  if (lastCol < 1) return {};
  const headerRow = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const map       = {};
  headerRow.forEach((header, index) => {
    const trimmed = String(header).trim();
    if (trimmed) map[trimmed] = index;
  });
  return map;
}


// ============================================================
// DETECTION HELPERS
// ============================================================
function webhook_isAppSheetPath(value) {
  return typeof value === "string" && value.startsWith(WEBHOOK_CONFIG.APPSHEET_PATH_PREFIX);
}

function webhook_isThumbnailUrl(value) {
  return typeof value === "string" && value.startsWith(WEBHOOK_CONFIG.THUMBNAIL_URL_PREFIX);
}


// ============================================================
// BUILDER HELPERS
// ============================================================
function webhook_buildThumbnailUrl(fileId) {
  return `${WEBHOOK_CONFIG.THUMBNAIL_BASE_URL}${fileId}`;
}

function webhook_extractFileIdFromThumbnailUrl(url) {
  try {
    // Extract the "id" parameter value from the Thumbnail URL using regex
    // Example: "https://drive.google.com/thumbnail?sz=w1000&id=FILE_ID"
    const match = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      Logger.log(`Extracted File ID from Thumbnail URL: "${match[1]}"`);
      return match[1];
    }
    Logger.log(`Could not extract File ID — no "id" param found in: "${url}"`);
    return null;
  } catch (err) {
    Logger.log(`webhook_extractFileIdFromThumbnailUrl error: "${url}" — ${err.message}`);
    return null;
  }
}


// ============================================================
// RESPONSE BUILDER — Returns JSON response to AppSheet
// ============================================================
function buildResponse(success, message) {
  const payload = JSON.stringify({ success, message });
  Logger.log(`Response: ${payload}`);
  return ContentService
    .createTextOutput(payload)
    .setMimeType(ContentService.MimeType.JSON);
}
