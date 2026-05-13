// ============================================================================
// EMPLOYEE DETAILS — Compliance Document Generator
// Data Source: EMPLOYEE DETAILS SHEET (normalized relational structure)
//
// Execution flow:
//   updateForms()
//     → loadEmployeeData()           — JOIN across 4 tabs, return merged records
//     → createMonthFolderStructure() — Google Drive folder navigation/creation
//     → updateSingleForm()           — copy tab from template → standalone file → write data
//         → buildOutputData()        — build 2D array (text + =IMAGE() formulas)
//         → resolveField()           — case-insensitive lookup across joined tables
// ============================================================================

const EMPLOYEE_DETAILS_SHEET_ID = '14INoUy-UoxYkNlOs1dc9-D0u4SE5nkfqy-NzpGuF1OQ';

// Tab names inside EMPLOYEE DETAILS SHEET
const TAB = {
  PERSONAL_INFORMATION: 'PERSONAL INFORMATION',
  EMPLOYMENT_DETAILS:   'EMPLOYMENT DETAILS',
  SITES:                'SITES',
  DEPARTMENTS:          'DEPARTMENTS'
};

// Image column names — values are thumbnail URLs, written as =IMAGE() formulas
const IMAGE_COLUMNS = ['PHOTO', 'SIGNATURE'];


// ============================================================================
// ENTRY POINT
// ============================================================================

/**
 * Main function — called by site-specific trigger scripts.
 *
 * Expected config shape:
 * {
 *   siteFolderName  {string}           — Google Drive folder name for the site
 *   siteFilterName  {string|undefined} — Exact name in SITES table (falls back to siteFolderName)
 *   id              {string}           — Template spreadsheet ID (contains all form tabs)
 *   dates           {number}           — 0 = previous month, 1 = current month
 *   forms           {Array}            — List of form descriptors { sheetName, fileName, configKey }
 *   formConfigs     {Object}           — Map of configKey → { columns: [] }
 *   subFolder       {string|undefined} — Optional subfolder inside the month folder
 *   categoryFilter  {string|undefined} — Filter by CATEGORY in EMPLOYMENT DETAILS
 *   departmentName  {string|undefined} — Filter by DEPARTMENT NAME
 * }
 */
function updateForms(config) {
  const {
    siteFolderName,
    siteFilterName,
    id,
    dates,
    forms,
    formConfigs,
    subFolder,
    categoryFilter,
    departmentName
  } = config;

  if (!formConfigs) {
    throw new Error('formConfigs is undefined. Make sure you are passing the complete config object.');
  }

  if (!id) {
    throw new Error('Template spreadsheet id is required in config.');
  }

  const rootFolderName = 'SANSU AQUATEK';
  const filterName     = siteFilterName || siteFolderName;

  // Load and join employee data from normalized source
  const empData = loadEmployeeData(filterName, categoryFilter, departmentName);
  Logger.log(`Loaded ${empData.records.length} employee records for site: ${filterName}`);

  // Create or locate month folder in Drive
  const destinationFolderId = createMonthFolderStructure(rootFolderName, siteFolderName, dates, subFolder);
  const destinationFolder   = DriveApp.getFolderById(destinationFolderId);

  // Open template spreadsheet once — reused for all forms
  const templateSS = SpreadsheetApp.openById(id);

  // Process each form
  forms.forEach(form => {
    if (!form.sheetName) {
      Logger.log(`Warning: No sheetName provided for form '${form.fileName}'. Skipping.`);
      return;
    }

    const formConfig = formConfigs[form.configKey];
    if (!formConfig || !formConfig.columns || formConfig.columns.length === 0) {
      Logger.log(`No configuration found for '${form.configKey}'. Skipping.`);
      return;
    }

    updateSingleForm(form, empData, formConfig, templateSS, destinationFolder);
  });
}


// ============================================================================
// DATA LOADING — Relational JOIN across 4 tabs
// ============================================================================

/**
 * Loads and joins all required employee data.
 *
 * JOIN chain:
 *   SITES (siteFilterName → SITEID)
 *   → DEPARTMENTS (departmentName + SITEID → DEPARTMENTID)  [optional]
 *   → EMPLOYMENT DETAILS (SITEID + DEPARTMENTID → filtered rows)
 *   → PERSONAL INFORMATION (EMPID → personal data)
 *
 * Returns: { records: Array<{ personal: Object, employment: Object }> }
 * Sorted by DATE OF JOINING ascending.
 */
function loadEmployeeData(siteFilterName, categoryFilter, departmentName) {
  const ss = SpreadsheetApp.openById(EMPLOYEE_DETAILS_SHEET_ID);

  // Load all four tables into memory once
  const personalTable    = readTable(ss, TAB.PERSONAL_INFORMATION);
  const employmentTable  = readTable(ss, TAB.EMPLOYMENT_DETAILS);
  const sitesTable       = readTable(ss, TAB.SITES);
  const departmentsTable = readTable(ss, TAB.DEPARTMENTS);

  // --- Step 1: Resolve SITEID from site name (case-insensitive exact match) ---
  const siteRow = sitesTable.rows.find(row =>
    String(row['SITE NAME'] || '').trim().toLowerCase() === siteFilterName.trim().toLowerCase()
  );

  if (!siteRow) {
    throw new Error(`Site '${siteFilterName}' not found in SITES table`);
  }

  const siteId = String(siteRow['SITEID']).trim();
  Logger.log(`Resolved SITEID: ${siteId} for site: ${siteFilterName}`);

  // --- Step 2: Resolve DEPARTMENTID (optional, case-insensitive exact match) ---
  let departmentId = null;

  if (departmentName) {
    const deptRow = departmentsTable.rows.find(row => {
      const nameMatch = String(row['DEPARTMENT NAME'] || '').trim().toLowerCase()
                        === departmentName.trim().toLowerCase();
      const siteMatch = String(row['SITEID']).trim() === siteId;
      return nameMatch && siteMatch;
    });

    if (!deptRow) {
      throw new Error(`Department '${departmentName}' not found for site '${siteFilterName}'`);
    }

    departmentId = String(deptRow['DEPARTMENTID']).trim();
    Logger.log(`Resolved DEPARTMENTID: ${departmentId} for department: ${departmentName}`);
  }

  // --- Step 3: Filter EMPLOYMENT DETAILS rows ---
  let employmentRows = employmentTable.rows.filter(row => {
    if (String(row['SITEID']).trim() !== siteId) return false;
    if (departmentId !== null && String(row['DEPARTMENTID']).trim() !== departmentId) return false;
    return true;
  });

  // Apply optional category filter
  if (categoryFilter) {
    employmentRows = employmentRows.filter(row =>
      String(row['CATEGORY'] || '').trim().toLowerCase() === categoryFilter.trim().toLowerCase()
    );
  }

  Logger.log(`Found ${employmentRows.length} employment rows after filtering`);

  // --- Step 4: Build EMPID → PersonalInfo lookup map (O(1) per lookup) ---
  const personalMap = new Map();
  personalTable.rows.forEach(row => {
    const empId = String(row['EMPID'] || '').trim();
    if (empId) personalMap.set(empId, row);
  });

  // --- Step 5: Group employment rows by EMPID to handle multiple rows per employee ---
  const empIdGroups = new Map();
  employmentRows.forEach(empRow => {
    const empId = String(empRow['EMPID'] || '').trim();
    if (!empId) return;
    if (!empIdGroups.has(empId)) empIdGroups.set(empId, []);
    empIdGroups.get(empId).push(empRow);
  });

  // --- Step 6: Join personal + employment, one output record per employment row ---
  const mergedRecords = [];

  empIdGroups.forEach((empRows, empId) => {
    const personalRow = personalMap.get(empId);

    if (!personalRow) {
      Logger.log(`Warning: No personal information found for EMPID '${empId}'. Skipping.`);
      return;
    }

    // If same EMPID appears multiple times for same site/dept, sort by DATE OF JOINING
    if (empRows.length > 1) {
      empRows.sort((a, b) => {
        const dA = a['DATE OF JOINING'] ? new Date(a['DATE OF JOINING']) : new Date(0);
        const dB = b['DATE OF JOINING'] ? new Date(b['DATE OF JOINING']) : new Date(0);
        return dA - dB;
      });
    }

    empRows.forEach(empRow => {
      mergedRecords.push({ personal: personalRow, employment: empRow });
    });
  });

  // --- Step 7: Final sort of all merged records by DATE OF JOINING ---
  mergedRecords.sort((a, b) => {
    const dA = a.employment['DATE OF JOINING'] ? new Date(a.employment['DATE OF JOINING']) : new Date(0);
    const dB = b.employment['DATE OF JOINING'] ? new Date(b.employment['DATE OF JOINING']) : new Date(0);
    return dA - dB;
  });

  Logger.log(`Final merged record count: ${mergedRecords.length}`);
  return { records: mergedRecords };
}


// ============================================================================
// TABLE READER — Reads one tab into { headers, rows } structure
// ============================================================================

/**
 * Reads a sheet tab and returns its data as an array of header-keyed row objects.
 * First row is treated as headers.
 *
 * @param  {Spreadsheet} spreadsheet
 * @param  {string}      tabName
 * @return {{ headers: string[], rows: Object[] }}
 */
function readTable(spreadsheet, tabName) {
  const sheet = spreadsheet.getSheetByName(tabName);
  if (!sheet) throw new Error(`Tab '${tabName}' not found in EMPLOYEE DETAILS SHEET`);

  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return { headers: [], rows: [] };

  const headers = data[0].map(h => String(h).trim());

  const rows = data.slice(1).map(rowArr => {
    const rowObj = {};
    headers.forEach((header, i) => {
      rowObj[header] = rowArr[i] !== undefined ? rowArr[i] : '';
    });
    return rowObj;
  });

  return { headers, rows };
}


// ============================================================================
// FORM UPDATER — Full refresh of one compliance document
// ============================================================================

/**
 * Creates a fresh standalone spreadsheet from a template tab, moves it to
 * the month folder, then writes employee data directly into it.
 *
 * Steps:
 *   1. Trash any existing file with same fileName in month folder
 *   2. Copy sheetName tab from template → new standalone spreadsheet
 *   3. Move new spreadsheet to month folder
 *   4. Find header row + data start row in the copied sheet
 *   5. Write all data via one setValues() call — no clearing needed (fresh template)
 *
 * @param {Object}       form                — { sheetName, fileName, configKey }
 * @param {Object}       empData             — { records }
 * @param {Object}       formConfig          — { columns }
 * @param {Spreadsheet}  templateSS          — already-opened template spreadsheet
 * @param {Folder}       destinationFolder   — month folder in Drive
 */
function updateSingleForm(form, empData, formConfig, templateSS, destinationFolder) {
  try {
    Logger.log(`Processing form: ${form.fileName}`);

    // --- Get template tab ---
    const templateSheet = templateSS.getSheetByName(form.sheetName);
    if (!templateSheet) {
      Logger.log(`Warning: Tab '${form.sheetName}' not found in template spreadsheet. Skipping.`);
      return;
    }

    // --- Trash existing file in month folder if present ---
    const existingFiles = destinationFolder.getFilesByName(form.fileName);
    while (existingFiles.hasNext()) {
      existingFiles.next().setTrashed(true);
      Logger.log(`Trashed existing file: ${form.fileName}`);
    }

    // --- Create new standalone spreadsheet from template tab ---
    // copyTo() copies the tab into a new temporary spreadsheet
    const newSS          = SpreadsheetApp.create(form.fileName);
    const newFile        = DriveApp.getFileById(newSS.getId());
    const defaultSheet   = newSS.getSheets()[0];

    // Copy template tab into new spreadsheet, delete the default blank sheet
    const copiedSheet = templateSheet.copyTo(newSS);
    copiedSheet.setName(form.fileName);
    newSS.deleteSheet(defaultSheet);

    // Move to month folder (new files land in Drive root by default)
    newFile.moveTo(destinationFolder);
    Logger.log(`Created '${form.fileName}' in month folder`);

    if (empData.records.length === 0) {
      Logger.log(`No employee records to write for ${form.fileName}`);
      return;
    }

    // --- Find header row and data start row ---
    const allData        = copiedSheet.getDataRange().getValues();
    const headerRowIndex = findHeaderRowEmp(allData);

    if (headerRowIndex === -1) {
      Logger.log(`Could not find header row with 'Employee Code' in '${form.sheetName}'. Data not written.`);
      return;
    }

    Logger.log(`Header row at index: ${headerRowIndex} (Row ${headerRowIndex + 1})`);

    // --- Detect optional format row (column-numbering row: 1, 2, 3 ...) ---
    const headerRow     = allData[headerRowIndex];
    const empCodeColIdx = findColumnIndexEmp(headerRow, 'Employee Code');
    let   formatRowIndex = -1;

    for (let i = headerRowIndex + 1; i < Math.min(allData.length, headerRowIndex + 5); i++) {
      const probe = allData[i][empCodeColIdx !== -1 ? empCodeColIdx : 0];
      if (typeof probe === 'number' && probe > 0 && probe <= 20) {
        formatRowIndex = i;
        Logger.log(`Format row (column numbering) at index: ${formatRowIndex}`);
        break;
      }
    }

    // Data starts immediately after format row (or header row if none)
    const dataStartRowIndex  = formatRowIndex !== -1 ? formatRowIndex + 1 : headerRowIndex + 1;
    const dataStartRow1Based = dataStartRowIndex + 1; // Sheets API is 1-based

    // --- Build and write all data in one setValues() call ---
    // Fresh template — no clearing needed, no existing data below headers
    const outputValues = buildOutputData(empData.records, formConfig.columns);

    if (outputValues.length > 0) {
      const writeRange = copiedSheet.getRange(
        dataStartRow1Based, 1,
        outputValues.length, outputValues[0].length
      );
      writeRange.setValues(outputValues);
      writeRange.setBorder(
        true, true, true, true, true, true,
        'black', SpreadsheetApp.BorderStyle.SOLID_MEDIUM
      );
      writeRange.setHorizontalAlignment('center')
                .setVerticalAlignment('middle')
                .setWrap(true);
      copiedSheet.setRowHeights(dataStartRow1Based, outputValues.length, 40);
    }

    SpreadsheetApp.flush();
    Logger.log(`Successfully wrote ${outputValues.length} rows to '${form.fileName}'`);

  } catch (error) {
    Logger.log(`Error processing form ${form.fileName}: ${error.message}`);
    Logger.log(`Stack trace: ${error.stack}`);
  }
}


// ============================================================================
// OUTPUT BUILDER — Builds unified 2D array for a single setValues() write
// ============================================================================

/**
 * Iterates over all records and columns to produce a single 2D array
 * ready for one range.setValues() call.
 *
 * Image columns (PHOTO, SIGNATURE) return '' — they are handled separately
 * by copyImagesToForm() which uses copyTo() from the pre-rendered IMAGES table.
 *
 * Column config entry can be:
 *   'SL. NO.' / 'Sl. No.' — auto serial number (always first column, index 0)
 *   ''                     — intentionally blank cell
 *   'REMARKS'              — derived from STATUS field in EMPLOYMENT DETAILS
 *   'PHOTO' / 'SIGNATURE'  — returns '' placeholder (image handled by copyImagesToForm)
 *   'FIELD NAME'           — single field lookup via resolveField()
 *   ['FIELD A', 'FIELD B'] — concatenated fields
 */
function buildOutputData(records, columns) {
  return records.map((record, rowIndex) => {
    const serialNumber = rowIndex + 1;

    return columns.map((col, colIndex) => {

      // Column index 0 is always the serial number
      if (colIndex === 0) return serialNumber;

      // Intentionally blank column
      if (col === '' || col === null || col === undefined) return '';

      // Remarks: derived from STATUS
      if (typeof col === 'string' && col.trim().toUpperCase() === 'REMARKS') {
        const status = String(record.employment['STATUS'] || '').trim().toUpperCase();
        return status === 'LEFT' ? 'Left' : '';
      }

      // Array column: concatenate multiple fields
      if (Array.isArray(col)) {
        return col
          .map(fieldName => String(resolveField(record, fieldName) || '').trim())
          .filter(Boolean)
          .join(' ');
      }

      // Image column: read thumbnail URL → write as =IMAGE("url") formula
      // setValues() treats strings starting with '=' as formulas automatically
      if (IMAGE_COLUMNS.includes(col.trim().toUpperCase())) {
        const url = String(resolveField(record, col) || '').trim();
        return url ? `=IMAGE("${url}")` : '';
      }

      // Standard single-field column
      return resolveField(record, col);
    });
  });
}


// ============================================================================
// FIELD RESOLVER — Case-insensitive lookup across both joined tables
// ============================================================================

/**
 * Resolves a field name against the merged employee record.
 *
 * Employment record is checked first so that fields present in both tables
 * (e.g. STATUS, DESIGNATION, CATEGORY, DATE OF JOINING, DATE OF EXIT,
 * REASON FOR EXIT) use the employment-specific value.
 *
 * @param  {{ personal: Object, employment: Object }} record
 * @param  {string} fieldName — column name as written in the calling script config
 * @return {*} Cell value, or '' if the field is not found in either table
 */
function resolveField(record, fieldName) {
  if (!fieldName || typeof fieldName !== 'string') return '';

  const normalised = fieldName.trim().toUpperCase();

  // Check employment record first
  const empKey = findKeyInsensitive(record.employment, normalised);
  if (empKey !== null) {
    const val = record.employment[empKey];
    return (val === null || val === undefined || val === '') ? '' : val;
  }

  // Fall back to personal information
  const perKey = findKeyInsensitive(record.personal, normalised);
  if (perKey !== null) {
    const val = record.personal[perKey];
    return (val === null || val === undefined || val === '') ? '' : val;
  }

  Logger.log(`Warning: Field '${fieldName}' not found in personal or employment record`);
  return '';
}

/**
 * Finds a key inside an object by case-insensitive match.
 * Returns the original key string (preserving its casing), or null if not found.
 */
function findKeyInsensitive(obj, normalisedTarget) {
  for (const key of Object.keys(obj)) {
    if (key.trim().toUpperCase() === normalisedTarget) return key;
  }
  return null;
}


// ============================================================================
// FOLDER STRUCTURE
// ============================================================================

/**
 * Navigates or creates the Drive folder hierarchy:
 *   rootFolderName → siteFolderName → year → "M. Month-YY" [→ subFolder]
 *
 * @return {string} Google Drive folder ID of the deepest folder
 */
function createMonthFolderStructure(rootFolderName, siteFolderName, dates, subFolder) {
  const now = new Date();
  now.setMonth(now.getMonth() + (dates === 0 ? -1 : 0));

  const year            = now.getFullYear();
  const month           = now.toLocaleString('en-US', { month: 'long' });
  const shortYear       = String(year).slice(-2);
  const monthFolderName = `${now.getMonth() + 1}. ${month}-${shortYear}`;

  const rootFolders = DriveApp.getFoldersByName(rootFolderName);
  if (!rootFolders.hasNext()) throw new Error(`Root folder '${rootFolderName}' not found`);
  const rootFolder = rootFolders.next();

  const siteFolder  = SharedUtils.getOrCreateFolder(rootFolder, siteFolderName);
  const yearFolder  = SharedUtils.getOrCreateFolder(siteFolder, String(year));
  const monthFolder = SharedUtils.getOrCreateFolder(yearFolder, monthFolderName);

  if (subFolder) {
    return SharedUtils.getOrCreateFolder(monthFolder, subFolder).getId();
  }

  return monthFolder.getId();
}


// ============================================================================
// SMALL HELPERS
// ============================================================================

/**
 * Finds the header row index (0-based) by scanning for a cell containing 'employee code'.
 * Returns -1 if not found.
 */
function findHeaderRowEmp(data) {
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[i].length; j++) {
      if (String(data[i][j]).toLowerCase().includes('employee code')) return i;
    }
  }
  return -1;
}

/**
 * Finds the column index (0-based) of a header by case-insensitive partial match.
 * Returns -1 if not found.
 */
function findColumnIndexEmp(headerRow, columnName) {
  const target = columnName.toLowerCase();
  for (let i = 0; i < headerRow.length; i++) {
    if (String(headerRow[i]).toLowerCase().includes(target)) return i;
  }
  return -1;
}
