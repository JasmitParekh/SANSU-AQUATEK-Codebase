/**
 * @file Data_Sync_With_Attendance_Salary_Sheet.js
 * Syncs active employee data from the central EMPLOYEE DETAILS SHEET into
 * attendance / salary slip spreadsheets.
 *
 * Call updateAttendanceSalarySlip(attendanceSalarySlipId, siteName, columns, departmentName).
 * The first requested column must be "Employee Code".
 * Output rows are written as: [Sl. No., ...requested columns].
 */

// CONFIGURATION
/** Spreadsheet ID of the centralised EMPLOYEE DETAILS SHEET (source). */
const EMPLOYEE_DETAILS_SPREADSHEET_ID = '14INoUy-UoxYkNlOs1dc9-D0u4SE5nkfqy-NzpGuF1OQ';

/** Exact tab names inside the EMPLOYEE DETAILS SHEET. */
const SOURCE_TAB = {
  PERSONAL_INFO : 'PERSONAL INFORMATION',
  EMPLOYMENT    : 'EMPLOYMENT DETAILS',
  SITES         : 'SITES',
  DEPARTMENTS   : 'DEPARTMENTS',
};

/**
 * Required column names inside each source tab.
 * These are matched case-insensitively, but spelled here as they appear in
 * the sheet so the intent is clear when reading this file.
 */
const SOURCE_COL = {
  // PERSONAL INFORMATION
  PERSONAL_EMPID   : 'EMPID',
  EMPLOYEE_CODE    : 'EMPLOYEE CODE',

  // EMPLOYMENT DETAILS
  EMPLOYMENT_EMPID : 'EMPID',
  SITEID           : 'SITEID',
  DEPARTMENTID     : 'DEPARTMENTID',
  STATUS           : 'STATUS',

  // SITES
  SITE_ID          : 'SITEID',
  SITE_NAME        : 'SITE NAME',

  // DEPARTMENTS
  DEPT_ID          : 'DEPARTMENTID',
  DEPT_NAME        : 'DEPARTMENT NAME',
  DEPT_SITEID      : 'SITEID',
};

/** Value that marks an employee's employment record as currently active. */
const STATUS_ACTIVE = 'ACTIVE';

/**
 * Canonical designation order used for sorting employees within a slip sheet.
 * Employees whose designation is not in this list are placed at the very end.
 */
const DESIGNATION_ORDER = [
  'SAFETY OFFICER',
  'SITE INCHARGE',
  'BOE',
  'SHIFT INCHARGE',
  'SHIFT SUPERVISOR',
  'E&I INCHARGE',
  '1ST CLASS BOILER OPERATOR',
  '2ND CLASS BOILER OPERATOR',
  'DCS OPERATOR',
  'FIELD OPERATOR',
  'ELECTRICAL ENGG.',
  'TURBINE OPERATOR',
  'ASS. TURBINE OPERATOR',
  'UTILITY OPERATOR',
  'WTP OPERATOR',
  'CHILLER OPERATOR',
  'RO-MEE OPERATOR',
  'MEE OPERATOR',
  'RO OPERATOR',
  'SENIOR TECHNICIAN',
  'JUNIOR TECHNICIAN',
  'ASS.TECHNICIAN',
  'DG OPERATOR',
  'DG MECHANIC',
  'DG ELECTRICIAN',
  'ELECTRICIAN',
  'INSTRUMENT TECHNICIAN',
  'FITTER',
  'SUPERVISOR',
  'LOADER DRIVER',
  'LOADER OPERATOR',
  'FIREMAN',
  'HELPER',
];

/**
 * Remarks values that prevent a slip sheet row from being auto-deleted.
 * Matched case-insensitively using String.includes().
 */
const PRESERVED_REMARKS_KEYWORDS = ['transferred', 'left'];

/**
 * Accepted text values for the "Employee Code" header cell in the slip sheet.
 * Matched case-insensitively.
 */
const SLIP_EMP_CODE_HEADER_ALIASES = ['employee code', 'emp code'];

/** Expected text for the Remarks header cell in the slip sheet. */
const SLIP_REMARKS_HEADER = 'remarks';


// ENTRY POINT

/**
 * Main entry point called by every site-specific script.
 *
 * Steps:
 *  1. Load all four source tables into memory (one spreadsheet open call).
 *  2. Resolve SITEID and (optionally) DEPARTMENTID from the lookup tables.
 *  3. Build the dataset of active employees with their requested column values.
 *  4. Open the correct tab in the target slip spreadsheet.
 *  5. Delete stale rows (inactive or unrecognised employee codes).
 *  6. Update existing rows and insert new ones in designation order.
 *  7. Re-number the Sl. No. column.
 *
 * @param {string}      attendanceSalarySlipId - Spreadsheet ID of the target slip.
 * @param {string}      siteName               - Human-readable site name; matched
 *                                               case-insensitively against SITES table.
 * @param {string[]}    columns                - Ordered column names to copy into the
 *                                               slip. First entry MUST be "Employee Code".
 * @param {string|null} [departmentName=null]  - Optional department name; matched
 *                                               case-insensitively against DEPARTMENTS
 *                                               and used to pick the correct tab in the
 *                                               slip spreadsheet.
 */
function updateAttendanceSalarySlip(attendanceSalarySlipId, siteName, columns, departmentName = null) {
  Logger.log('══════════════════════════════════════════════════════');
  Logger.log('START  updateAttendanceSalarySlip');
  Logger.log(`  Site           : "${siteName}"`);
  Logger.log(`  Department     : "${departmentName || '(none)'}"`);
  Logger.log(`  Target slip ID : ${attendanceSalarySlipId}`);
  Logger.log(`  Columns        : ${JSON.stringify(columns)}`);
  Logger.log('══════════════════════════════════════════════════════');

  Logger.log('\n[Step 1] Loading source tables from EMPLOYEE DETAILS SHEET…');
  const sourceSpreadsheet = SpreadsheetApp.openById(EMPLOYEE_DETAILS_SPREADSHEET_ID);
  const sourceTables      = loadAllSourceTables(sourceSpreadsheet);

  Logger.log('\n[Step 1b] Normalising columns into sequential and targeted…');
  const { sequentialCols, targetedColMaps } = normalizeColumns(columns);
  Logger.log(`  Sequential columns : [${sequentialCols.join(', ')}]`);
  Logger.log(`  Targeted mappings  : [${targetedColMaps.map(m => `"${m.source}" → "${m.target}"`).join(', ')}]`);

  Logger.log('\n[Step 2] Resolving SITEID and DEPARTMENTID…');
  const siteId       = resolveSiteId(sourceTables.sites, siteName);
  const departmentId = departmentName
    ? resolveDepartmentId(sourceTables.departments, departmentName, siteId)
    : null;
  Logger.log(`  SITEID       : ${siteId}`);
  Logger.log(`  DEPARTMENTID : ${departmentId || '(not applicable)'}`);

  Logger.log('\n[Step 3] Building employee dataset (sequential columns)…');
  const employeeDataset = buildEmployeeDataset(sourceTables, siteId, departmentId, sequentialCols);
  Logger.log(`  Active employees found   : ${employeeDataset.validEmployeeCodesSet.size}`);
  Logger.log(`  Inactive employees found : ${employeeDataset.leftEmployeeCodesSet.size}`);
  Logger.log(`  Rows prepared            : ${employeeDataset.preparedRows.length}`);
  Logger.log(`  Designation column index : ${employeeDataset.designationColIndexInRow}`);

  Logger.log('\n[Step 3b] Building targeted values map (all employees incl. inactive)…');
  const targetedValuesMap = buildTargetedValuesMap(sourceTables, siteId, departmentId, targetedColMaps);

  Logger.log('\n[Step 4] Opening target slip sheet…');
  const slipSheet = loadSlipSheet(attendanceSalarySlipId, departmentName);
  Logger.log(`  Sheet opened       : "${slipSheet.sheet.getName()}"`);
  Logger.log(`  Header row index   : ${slipSheet.headerRowIndex}`);
  Logger.log(`  Emp Code col index : ${slipSheet.empCodeColIndex}`);
  Logger.log(`  Remarks col index  : ${slipSheet.remarksColIndex}`);

  Logger.log('\n[Step 4b] Locating targeted column headers in slip sheet…');
  const targetedColIndices = findTargetedColumnIndices(
    slipSheet.sheet,
    slipSheet.headerRowIndex,
    targetedColMaps.map(m => m.target)
  );

  Logger.log('\n[Step 5] Removing stale rows…');
  removeInactiveEmployeeRows(slipSheet, employeeDataset.leftEmployeeCodesSet);
  removeUnrecognisedEmployeeRows(slipSheet, employeeDataset.validEmployeeCodesSet);

  Logger.log('\n[Step 6] Sorting and writing sequential rows…');
  const sortedRows = sortRowsByDesignation(
    employeeDataset.preparedRows,
    employeeDataset.designationColIndexInRow
  );
  writeRowsToSlipSheet(slipSheet, sortedRows, employeeDataset.designationColIndexInRow);

  Logger.log('\n[Step 7] Re-numbering Sl. No. column…');
  renumberSerialNumberColumn(slipSheet.sheet, slipSheet.headerRowIndex);

  Logger.log('\n[Step 8] Updating targeted columns (includes preserved rows)…');
  updateTargetedColumns(slipSheet, targetedValuesMap, targetedColIndices);

  Logger.log('\n══════════════════════════════════════════════════════');
  Logger.log('DONE   updateAttendanceSalarySlip');
  Logger.log('══════════════════════════════════════════════════════');
}


// SOURCE TABLE LOADING

/**
 * Reads all four relevant tabs from the EMPLOYEE DETAILS SHEET into memory.
 * The spreadsheet is opened once and all tabs are read in a single batch so
 * we minimise the number of remote API calls.
 *
 * @param  {GoogleAppsScript.Spreadsheet.Spreadsheet} spreadsheet
 * @returns {{
 *   personalInfo : Table,
 *   employment   : Table,
 *   sites        : Table,
 *   departments  : Table
 * }}
 *
 * @typedef {{ headers: string[], rows: any[][] }} Table
 */
function loadAllSourceTables(spreadsheet) {
  return {
    personalInfo : readTabAsTable(spreadsheet, SOURCE_TAB.PERSONAL_INFO),
    employment   : readTabAsTable(spreadsheet, SOURCE_TAB.EMPLOYMENT),
    sites        : readTabAsTable(spreadsheet, SOURCE_TAB.SITES),
    departments  : readTabAsTable(spreadsheet, SOURCE_TAB.DEPARTMENTS),
  };
}

/**
 * Reads one spreadsheet tab and returns its data as a Table object.
 *
 * Headers are trimmed of surrounding whitespace. Their original casing is
 * preserved so error messages remain readable.
 *
 * @param  {GoogleAppsScript.Spreadsheet.Spreadsheet} spreadsheet
 * @param  {string} tabName - Exact tab name (case-sensitive for getSheetByName).
 * @returns {Table}
 * @throws {Error} If the tab does not exist or contains no data.
 */
function readTabAsTable(spreadsheet, tabName) {
  const sheet = spreadsheet.getSheetByName(tabName);

  if (!sheet) {
    throw new Error(
      `Tab "${tabName}" was not found in the Employee Details spreadsheet. ` +
      `Check that the tab exists and is spelled correctly.`
    );
  }

  const allValues = sheet.getDataRange().getValues();

  if (allValues.length === 0) {
    throw new Error(`Tab "${tabName}" appears to be completely empty.`);
  }

  const headers  = allValues[0].map(cell => String(cell).trim());
  const dataRows = allValues.slice(1);

  Logger.log(`  Loaded "${tabName}": ${dataRows.length} data rows, ${headers.length} columns.`);
  return { headers, dataRows };
}


// ID RESOLUTION

/**
 * Looks up the SITEID for a given human-readable site name in the SITES table.
 * The comparison is case-insensitive.
 *
 * @param  {Table}  sitesTable
 * @param  {string} siteName
 * @returns {string} The resolved SITEID value.
 * @throws {Error} If a required column is missing or the site name is not found.
 */
function resolveSiteId(sitesTable, siteName) {
  const siteIdColIdx   = requireColumnIndex(sitesTable.headers, SOURCE_COL.SITE_ID,   SOURCE_TAB.SITES);
  const siteNameColIdx = requireColumnIndex(sitesTable.headers, SOURCE_COL.SITE_NAME, SOURCE_TAB.SITES);

  const normalisedInput = siteName.trim().toLowerCase();

  const matchingRow = sitesTable.dataRows.find(
    row => String(row[siteNameColIdx]).trim().toLowerCase() === normalisedInput
  );

  if (!matchingRow) {
    throw new Error(
      `Site "${siteName}" was not found in the SITES table. ` +
      `Verify that the site name in the calling script matches the SITE NAME ` +
      `column in the sheet (comparison is case-insensitive).`
    );
  }

  return String(matchingRow[siteIdColIdx]).trim();
}

/**
 * Looks up the DEPARTMENTID for a given department name in the DEPARTMENTS table,
 * cross-checking that the department belongs to the expected site (via SITEID).
 * The name comparison is case-insensitive.
 *
 * Cross-checking the SITEID prevents a false match when two different sites
 * have departments with identical names (e.g. both have a "CPP" department).
 *
 * @param  {Table}  departmentsTable
 * @param  {string} departmentName
 * @param  {string} siteId - SITEID previously resolved from the SITES table.
 * @returns {string} The resolved DEPARTMENTID value.
 * @throws {Error} If a required column is missing or no matching row is found.
 */
function resolveDepartmentId(departmentsTable, departmentName, siteId) {
  const deptIdColIdx   = requireColumnIndex(departmentsTable.headers, SOURCE_COL.DEPT_ID,     SOURCE_TAB.DEPARTMENTS);
  const deptNameColIdx = requireColumnIndex(departmentsTable.headers, SOURCE_COL.DEPT_NAME,   SOURCE_TAB.DEPARTMENTS);
  const deptSiteColIdx = requireColumnIndex(departmentsTable.headers, SOURCE_COL.DEPT_SITEID, SOURCE_TAB.DEPARTMENTS);

  const normalisedInput = departmentName.trim().toLowerCase();

  const matchingRow = departmentsTable.dataRows.find(row =>
    String(row[deptNameColIdx]).trim().toLowerCase() === normalisedInput &&
    String(row[deptSiteColIdx]).trim()               === siteId
  );

  if (!matchingRow) {
    throw new Error(
      `Department "${departmentName}" was not found for SITEID "${siteId}" ` +
      `in the DEPARTMENTS table. ` +
      `Check that the department name is spelled correctly and that its ` +
      `SITEID column contains "${siteId}".`
    );
  }

  return String(matchingRow[deptIdColIdx]).trim();
}


// EMPLOYEE DATASET BUILDER

/**
 * Builds the complete dataset of employees who are currently ACTIVE at the
 * given site / department by joining EMPLOYMENT DETAILS with PERSONAL INFORMATION.
 *
 * Join key: EMPID (present in both tables).
 *
 * An employee is considered ACTIVE for this site/department if at least one
 * row in EMPLOYMENT DETAILS matches the SITEID + DEPARTMENTID filter AND has
 * STATUS = "ACTIVE".
 *
 * An employee is considered LEFT (inactive) if they have one or more rows
 * matching the site/department filter but none of those rows has STATUS = "ACTIVE".
 *
 * @param  {{ personalInfo: Table, employment: Table, sites: Table, departments: Table }} sourceTables
 * @param  {string}      siteId
 * @param  {string|null} departmentId - null when no department filter is needed.
 * @param  {string[]}    columns      - Ordered column names requested by the caller.
 * @returns {{
 *   preparedRows            : any[][],
 *   validEmployeeCodesSet   : Set<string>,
 *   leftEmployeeCodesSet    : Set<string>,
 *   designationColIndexInRow: number
 * }}
 */
function buildEmployeeDataset(sourceTables, siteId, departmentId, columns) {

  const empHeaders = sourceTables.employment.headers;
  const empColIdx  = {
    empId  : requireColumnIndex(empHeaders, SOURCE_COL.EMPLOYMENT_EMPID, SOURCE_TAB.EMPLOYMENT),
    siteId : requireColumnIndex(empHeaders, SOURCE_COL.SITEID,           SOURCE_TAB.EMPLOYMENT),
    status : requireColumnIndex(empHeaders, SOURCE_COL.STATUS,           SOURCE_TAB.EMPLOYMENT),
    deptId : colIndexOf(empHeaders, SOURCE_COL.DEPARTMENTID),
  };

  if (departmentId !== null && empColIdx.deptId === -1) {
    throw new Error(
      `Column "${SOURCE_COL.DEPARTMENTID}" was not found in "${SOURCE_TAB.EMPLOYMENT}" ` +
      `but a department filter was requested. ` +
      `Add the DEPARTMENTID column to the Employment Details tab.`
    );
  }

  const personalHeaders = sourceTables.personalInfo.headers;
  const personalColIdx  = {
    empId   : requireColumnIndex(personalHeaders, SOURCE_COL.PERSONAL_EMPID, SOURCE_TAB.PERSONAL_INFO),
    empCode : requireColumnIndex(personalHeaders, SOURCE_COL.EMPLOYEE_CODE,  SOURCE_TAB.PERSONAL_INFO),
  };

  const personalRowByEmpId = new Map();
  sourceTables.personalInfo.dataRows.forEach(row => {
    const empId = String(row[personalColIdx.empId]).trim();
    if (empId) {
      personalRowByEmpId.set(empId, row);
    }
  });
  Logger.log(`  Personal info map: ${personalRowByEmpId.size} entries.`);

  const columnSourceMap = resolveColumnSourceMap(
    columns,
    personalHeaders,
    empHeaders
  );

  const designationColIndexInRow = (() => {
    const idx = columns.findIndex(col => col.trim().toLowerCase() === 'designation');
    return idx === -1 ? -1 : idx + 1;
  })();

  //  We use a Map keyed by EMPID so that multiple employment rows for the same
  //  employee (e.g. past stints at the same site) are all handled correctly:
  //    - If ANY row is ACTIVE → employee is considered active.
  //    - If rows exist but NONE is ACTIVE → employee is considered left.
  //  @type {Map<string, { hasActiveRow: boolean, activeEmploymentRow: any[]|null }>}
  const employmentStatusByEmpId = new Map();

  sourceTables.employment.dataRows.forEach(row => {
    if (String(row[empColIdx.siteId]).trim() !== siteId) return;

    if (departmentId !== null) {
      if (String(row[empColIdx.deptId]).trim() !== departmentId) return;
    }

    const empId    = String(row[empColIdx.empId]).trim();
    const isActive = String(row[empColIdx.status]).trim().toUpperCase() === STATUS_ACTIVE;

    if (!empId) return;

    if (!employmentStatusByEmpId.has(empId)) {
      employmentStatusByEmpId.set(empId, { hasActiveRow: false, activeEmploymentRow: null });
    }

    const entry = employmentStatusByEmpId.get(empId);

    if (isActive && !entry.hasActiveRow) {
      entry.hasActiveRow        = true;
      entry.activeEmploymentRow = row;
    }
  });

  Logger.log(`  Employment scan: ${employmentStatusByEmpId.size} EMPIDs matched site/dept filter.`);

  const validEmployeeCodesSet = new Set();
  const leftEmployeeCodesSet  = new Set();
  const preparedRows          = [];

  employmentStatusByEmpId.forEach(({ hasActiveRow, activeEmploymentRow }, empId) => {

    const personalRow = personalRowByEmpId.get(empId);
    if (!personalRow) {
      Logger.log(
        `  WARNING: EMPID "${empId}" found in "${SOURCE_TAB.EMPLOYMENT}" ` +
        `but has no matching row in "${SOURCE_TAB.PERSONAL_INFO}". Skipping.`
      );
      return;
    }

    const employeeCode = String(personalRow[personalColIdx.empCode]).trim();
    if (!employeeCode) {
      Logger.log(
        `  WARNING: EMPID "${empId}" has an empty Employee Code ` +
        `in "${SOURCE_TAB.PERSONAL_INFO}". Skipping.`
      );
      return;
    }

    if (!hasActiveRow) {
      leftEmployeeCodesSet.add(employeeCode);
      return;
    }

    validEmployeeCodesSet.add(employeeCode);

    const outputRow = buildOutputRow(columns, columnSourceMap, personalRow, activeEmploymentRow);
    preparedRows.push(outputRow);
  });

  return {
    preparedRows,
    validEmployeeCodesSet,
    leftEmployeeCodesSet,
    designationColIndexInRow,
  };
}

/**
 * Determines, for each caller-requested column, which source table and which
 * column index to read from.
 *
 * Priority: PERSONAL INFORMATION before EMPLOYMENT DETAILS.
 * If a column is not found in either table, a warning is logged and it will
 * produce an empty string in the output.
 *
 * @param  {string[]} columns
 * @param  {string[]} personalHeaders
 * @param  {string[]} employmentHeaders
 * @returns {Object.<string, { source: 'personal'|'employment', index: number }|null>}
 */
function resolveColumnSourceMap(columns, personalHeaders, employmentHeaders) {
  const map = {};

  columns.forEach(columnName => {
    const normalisedName = columnName.trim().toLowerCase();

    const personalIdx = personalHeaders.findIndex(h => h.toLowerCase() === normalisedName);
    if (personalIdx !== -1) {
      map[columnName] = { source: 'personal', index: personalIdx };
      return;
    }

    const employmentIdx = employmentHeaders.findIndex(h => h.toLowerCase() === normalisedName);
    if (employmentIdx !== -1) {
      map[columnName] = { source: 'employment', index: employmentIdx };
      return;
    }

    Logger.log(
      `  WARNING: Column "${columnName}" was not found in ` +
      `"${SOURCE_TAB.PERSONAL_INFO}" or "${SOURCE_TAB.EMPLOYMENT}". ` +
      `It will be written as an empty string.`
    );
    map[columnName] = null;
  });

  return map;
}

/**
 * Assembles one output row for a single active employee.
 *
 * Output layout:
 *   [1…N]   → values for each column in the caller's `columns` list, in order
 *
 * @param  {string[]} columns
 * @param  {Object}   columnSourceMap     - Result of resolveColumnSourceMap().
 * @param  {any[]}    personalRow         - Row from PERSONAL INFORMATION.
 * @param  {any[]}    activeEmploymentRow - Matching ACTIVE row from EMPLOYMENT DETAILS.
 * @returns {any[]}
 */
function buildOutputRow(columns, columnSourceMap, personalRow, activeEmploymentRow) {
  const outputRow = [''];

  columns.forEach(columnName => {
    const mapping = columnSourceMap[columnName];

    if (!mapping) {
      outputRow.push('');
      return;
    }

    const sourceRow = (mapping.source === 'personal') ? personalRow : activeEmploymentRow;
    const rawValue  = sourceRow[mapping.index];

    outputRow.push(rawValue !== undefined && rawValue !== null ? rawValue : '');
  });

  return outputRow;
}


// SLIP SHEET LOADING

/**
 * Opens the target Attendance / Salary slip spreadsheet and locates the correct
 * tab to write into.
 *
 * Tab selection rules:
 *  - departmentName provided → find the tab whose name matches it (case-insensitive).
 *                               Throws if the tab does not exist.
 *  - departmentName is null  → use the first tab in the spreadsheet.
 *
 * Also scans the sheet to locate the header row, the Employee Code column, and
 * the optional Remarks column.
 *
 * @param  {string}      attendanceSalarySlipId
 * @param  {string|null} departmentName
 * @returns {{
 *   sheet          : GoogleAppsScript.Spreadsheet.Sheet,
 *   headerRowIndex : number,
 *   empCodeColIndex: number,
 *   remarksColIndex: number
 * }}
 * @throws {Error} If the department tab is not found, or if the Employee Code
 *                 column cannot be located in the sheet.
 */
function loadSlipSheet(attendanceSalarySlipId, departmentName) {
  const slipSpreadsheet = SpreadsheetApp.openById(attendanceSalarySlipId);
  const targetSheet     = findTargetTab(slipSpreadsheet, departmentName, attendanceSalarySlipId);
  const headerColumns   = findSlipHeaderColumns(
    targetSheet.getDataRange().getValues(),
    targetSheet.getName()
  );

  return {
    sheet          : targetSheet,
    headerRowIndex : headerColumns.headerRowIndex,
    empCodeColIndex: headerColumns.empCodeColIndex,
    remarksColIndex: headerColumns.remarksColIndex,
  };
}

/**
 * Returns the tab to write into.
 * When departmentName is given, searches all tabs case-insensitively.
 * When departmentName is null, returns the first tab.
 *
 * @param  {GoogleAppsScript.Spreadsheet.Spreadsheet} spreadsheet
 * @param  {string|null} departmentName
 * @param  {string}      spreadsheetId - Included in the error message for easier debugging.
 * @returns {GoogleAppsScript.Spreadsheet.Sheet}
 * @throws {Error} If the named department tab is not found.
 */
function findTargetTab(spreadsheet, departmentName, spreadsheetId) {
  if (!departmentName) {
    return spreadsheet.getSheets()[0];
  }

  const normalisedName = departmentName.trim().toLowerCase();
  const matchingSheet  = spreadsheet.getSheets().find(
    sheet => sheet.getName().trim().toLowerCase() === normalisedName
  );

  if (!matchingSheet) {
    throw new Error(
      `No tab named "${departmentName}" was found in the attendance salary ` +
      `spreadsheet (ID: ${spreadsheetId}). ` +
      `The tab name must match the department name (case-insensitive). ` +
      `Available tabs: [${spreadsheet.getSheets().map(s => s.getName()).join(', ')}]`
    );
  }

  return matchingSheet;
}

/**
 * Scans a slip sheet's values to find:
 *  - The header row (the first row containing a recognised Employee Code header).
 *  - The zero-based index of the Employee Code column.
 *  - The zero-based index of the Remarks column (-1 if absent).
 *
 * @param  {any[][]} sheetValues - All sheet values (from getDataRange().getValues()).
 * @param  {string}  sheetName   - Used in the error message only.
 * @returns {{ headerRowIndex: number, empCodeColIndex: number, remarksColIndex: number }}
 * @throws {Error} If no Employee Code column is found.
 */
function findSlipHeaderColumns(sheetValues, sheetName) {
  let headerRowIndex  = -1;
  let empCodeColIndex = -1;
  let remarksColIndex = -1;

  for (let rowIdx = 0; rowIdx < sheetValues.length; rowIdx++) {
    const row = sheetValues[rowIdx];

    for (let colIdx = 0; colIdx < row.length; colIdx++) {
      const cellText = String(row[colIdx]).trim().toLowerCase();

      if (SLIP_EMP_CODE_HEADER_ALIASES.includes(cellText)) {
        headerRowIndex  = rowIdx;
        empCodeColIndex = colIdx;
      }

      if (cellText === SLIP_REMARKS_HEADER && rowIdx === headerRowIndex) {
        remarksColIndex = colIdx;
      }
    }

    if (headerRowIndex !== -1) break;
  }

  if (headerRowIndex === -1 || empCodeColIndex === -1) {
    throw new Error(
      `Could not find an "Employee Code" or "Emp Code" header cell in slip ` +
      `sheet "${sheetName}". Make sure the header row exists and is spelled correctly.`
    );
  }

  return { headerRowIndex, empCodeColIndex, remarksColIndex };
}


// STALE ROW REMOVAL

/**
 * Returns true when a slip sheet row must never be automatically deleted.
 *
 * A row is preserved when its Remarks cell contains any keyword listed in
 * PRESERVED_REMARKS_KEYWORDS (e.g. "transferred", "left"). This lets HR annotate
 * rows they want to keep for record-keeping after an employee has moved on.
 *
 * @param  {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param  {number} sheetRowIndex   - 1-based row number in the sheet.
 * @param  {number} remarksColIndex - 0-based column index; pass -1 if the
 *                                    Remarks column is absent (returns false).
 * @returns {boolean}
 */
function isRowPreserved(sheet, sheetRowIndex, remarksColIndex) {
  if (remarksColIndex === -1) return false;

  const cellValue = String(
    sheet.getRange(sheetRowIndex, remarksColIndex + 1).getValue()
  ).trim().toLowerCase();

  return PRESERVED_REMARKS_KEYWORDS.some(keyword => cellValue.includes(keyword));
}

/**
 * Deletes rows in the slip sheet where the Employee Code belongs to an employee
 * who previously had a record at this site/department but is no longer ACTIVE.
 *
 * Preserved rows are never touched.
 * Iterates bottom-up so that deleting a row does not shift the indices of
 * rows not yet visited.
 *
 * @param {{ sheet, headerRowIndex, empCodeColIndex, remarksColIndex }} slipSheet
 * @param {Set<string>} leftEmployeeCodesSet
 */
function removeInactiveEmployeeRows(slipSheet, leftEmployeeCodesSet) {
  const { sheet, headerRowIndex, empCodeColIndex, remarksColIndex } = slipSheet;
  let deletedCount = 0;

  for (let rowIdx = sheet.getLastRow(); rowIdx > headerRowIndex + 1; rowIdx--) {
    if (isRowPreserved(sheet, rowIdx, remarksColIndex)) continue;

    const empCode = String(sheet.getRange(rowIdx, empCodeColIndex + 1).getValue()).trim();

    if (leftEmployeeCodesSet.has(empCode)) {
      Logger.log(`  Deleting inactive employee: "${empCode}" (sheet row ${rowIdx})`);
      sheet.deleteRow(rowIdx);
      deletedCount++;
    }
  }

  Logger.log(`  Inactive employee rows deleted: ${deletedCount}`);
}

/**
 * Deletes rows in the slip sheet where the Employee Code does not appear in
 * `validEmployeeCodesSet` — meaning the code is entirely unrecognised for
 * this site/department (not just inactive, but completely unknown).
 *
 * Rows with an empty Employee Code cell are also deleted (treated as invalid).
 * Preserved rows are never touched.
 * Iterates bottom-up for the same reason as removeInactiveEmployeeRows.
 *
 * @param {{ sheet, headerRowIndex, empCodeColIndex, remarksColIndex }} slipSheet
 * @param {Set<string>} validEmployeeCodesSet
 */
function removeUnrecognisedEmployeeRows(slipSheet, validEmployeeCodesSet) {
  const { sheet, headerRowIndex, empCodeColIndex, remarksColIndex } = slipSheet;
  let deletedCount = 0;

  for (let rowIdx = sheet.getLastRow(); rowIdx > headerRowIndex + 1; rowIdx--) {
    if (isRowPreserved(sheet, rowIdx, remarksColIndex)) continue;

    const empCode = String(sheet.getRange(rowIdx, empCodeColIndex + 1).getValue()).trim();

    if (empCode && !validEmployeeCodesSet.has(empCode)) {
      Logger.log(`  Deleting unrecognised employee: "${empCode}" (sheet row ${rowIdx})`);
      sheet.deleteRow(rowIdx);
      deletedCount++;
    }
  }

  Logger.log(`  Unrecognised employee rows deleted: ${deletedCount}`);
}


// DESIGNATION SORTING

/**
 * Returns the sort priority of a designation.
 * Lower index = higher priority = appears earlier in the slip sheet.
 * Designations absent from DESIGNATION_ORDER are placed at the very end.
 *
 * @param  {string} designation
 * @returns {number}
 */
function getDesignationSortIndex(designation) {
  const normalised = String(designation).trim().toUpperCase();
  const index      = DESIGNATION_ORDER.indexOf(normalised);
  return index === -1 ? DESIGNATION_ORDER.length : index;
}

/**
 * Returns a new array of rows sorted ascending by designation priority.
 * The original array is not mutated.
 *
 * If `designationColIndexInRow` is -1 (no Designation column was requested),
 * the original order is preserved and a warning is logged.
 *
 * @param  {any[][]} rows
 * @param  {number}  designationColIndexInRow - 0-based index of the Designation
 *                   value within each output row.
 * @returns {any[][]}
 */
function sortRowsByDesignation(rows, designationColIndexInRow) {
  if (designationColIndexInRow === -1) {
    Logger.log('  No Designation column in output — rows will not be sorted by designation.');
    return rows;
  }

  return [...rows].sort((rowA, rowB) => {
    const sortIndexA = getDesignationSortIndex(rowA[designationColIndexInRow]);
    const sortIndexB = getDesignationSortIndex(rowB[designationColIndexInRow]);
    return sortIndexA - sortIndexB;
  });
}


// SLIP SHEET WRITER

/**
 * Writes all prepared rows into the slip sheet in two passes.
 *
 * Pass 1 — Update existing rows:
 *   For each employee who already has a row (matched by Employee Code), overwrite
 *   that row with the latest data from the source.
 *
 * Pass 2 — Insert new rows:
 *   For each employee not yet in the sheet, insert a new row at the position
 *   that keeps the sheet sorted by DESIGNATION_ORDER. If no suitable earlier
 *   position is found, the row is appended at the bottom.
 *
 * @param {{ sheet, headerRowIndex, empCodeColIndex }} slipSheet
 * @param {any[][]} sortedRows
 * @param {number}  designationColIndexInRow
 */
function writeRowsToSlipSheet(slipSheet, sortedRows, designationColIndexInRow) {
  Logger.log('  Pass 1: Updating existing rows…');
  updateExistingRows(slipSheet, sortedRows);

  Logger.log('  Pass 2: Inserting new rows…');
  insertNewRows(slipSheet, sortedRows, designationColIndexInRow);
}

/**
 * Pass 1: For each prepared row, finds the corresponding row in the slip sheet
 * by Employee Code and overwrites it with fresh data.
 *
 * @param {{ sheet, headerRowIndex, empCodeColIndex }} slipSheet
 * @param {any[][]} sortedRows
 */
function updateExistingRows(slipSheet, sortedRows) {
  const { sheet, headerRowIndex, empCodeColIndex } = slipSheet;
  let updatedCount = 0;

  sortedRows.forEach(outputRow => {
    const empCode        = String(outputRow[1]).trim();
    const existingRowIdx = findRowIndexByEmpCode(sheet, headerRowIndex, empCodeColIndex, empCode);

    if (existingRowIdx === -1) return;

    applyRowValuesAndFormatting(sheet, existingRowIdx, outputRow);
    updatedCount++;
  });

  Logger.log(`    Rows updated: ${updatedCount}`);
}

/**
 * Pass 2: For each prepared row whose Employee Code is not yet in the sheet,
 * inserts a new row at the correct position to maintain DESIGNATION_ORDER.
 *
 * @param {{ sheet, headerRowIndex, empCodeColIndex }} slipSheet
 * @param {any[][]} sortedRows
 * @param {number}  designationColIndexInRow
 */
function insertNewRows(slipSheet, sortedRows, designationColIndexInRow) {
  const { sheet, headerRowIndex, empCodeColIndex } = slipSheet;
  let insertedCount = 0;

  sortedRows.forEach(outputRow => {
    const empCode        = String(outputRow[1]).trim();
    const existingRowIdx = findRowIndexByEmpCode(sheet, headerRowIndex, empCodeColIndex, empCode);

    if (existingRowIdx !== -1) return;

    const insertPosition = findInsertPosition(
      sheet,
      headerRowIndex,
      empCodeColIndex,
      designationColIndexInRow,
      outputRow
    );

    applyRowValuesAndFormatting(sheet, insertPosition, outputRow);
    insertedCount++;
    Logger.log(`    Inserted "${empCode}" at sheet row ${insertPosition}.`);
  });

  Logger.log(`    Rows inserted: ${insertedCount}`);
}

/**
 * Searches the data rows of the slip sheet for a row whose Employee Code cell
 * exactly matches the given value.
 *
 * @param  {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param  {number} headerRowIndex  - 0-based header row index.
 * @param  {number} empCodeColIndex - 0-based Employee Code column index.
 * @param  {string} empCode         - The value to search for.
 * @returns {number} 1-based sheet row index if found; -1 if not found.
 */
function findRowIndexByEmpCode(sheet, headerRowIndex, empCodeColIndex, empCode) {
  const firstDataRow = headerRowIndex + 2;
  const lastRow      = sheet.getLastRow();

  for (let rowIdx = firstDataRow; rowIdx <= lastRow; rowIdx++) {
    const cellValue = String(sheet.getRange(rowIdx, empCodeColIndex + 1).getValue()).trim();
    if (cellValue === empCode) {
      return rowIdx;
    }
  }

  return -1;
}

/**
 * Determines the 1-based sheet row index at which a new employee row should be
 * inserted to keep the slip sheet sorted by DESIGNATION_ORDER.
 *
 * Scans existing rows top-to-bottom and inserts before the first row whose
 * designation has a lower priority (higher sort index) than the new employee.
 *
 * If no such row is found (all existing employees have equal or higher priority),
 * appends a blank row at the bottom of the sheet and returns its index.
 *
 * If there is no Designation column, always appends at the end.
 *
 * @param  {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param  {number} headerRowIndex
 * @param  {number} empCodeColIndex
 * @param  {number} designationColIndexInRow - 0-based index within the output row.
 *                                             -1 means no Designation column.
 * @param  {any[]}  outputRow                - The row to be inserted.
 * @returns {number} 1-based sheet row index ready to receive the row's values.
 */
function findInsertPosition(sheet, headerRowIndex, empCodeColIndex, designationColIndexInRow, outputRow) {
  if (designationColIndexInRow === -1) {
    return appendEmptyRowAtBottom(sheet);
  }

  const newDesignationSortIndex = getDesignationSortIndex(
    String(outputRow[designationColIndexInRow]).trim()
  );

  const firstDataRow = headerRowIndex + 2;
  const lastRow = sheet.getLastRow();

  for (let rowIdx = firstDataRow; rowIdx <= lastRow; rowIdx++) {
    const existingEmpCode = String(sheet.getRange(rowIdx, empCodeColIndex + 1).getValue()).trim();

    if (!existingEmpCode) continue;

    const existingDesignation = String(
      sheet.getRange(rowIdx, designationColIndexInRow + 1).getValue()
    ).trim();

    const existingDesignationSortIndex = getDesignationSortIndex(existingDesignation);

    if (newDesignationSortIndex < existingDesignationSortIndex) {
      sheet.insertRowBefore(rowIdx);
      return rowIdx;
    }
  }

  return appendEmptyRowAtBottom(sheet);
}

/**
 * Appends a single blank row at the bottom of the sheet and returns its
 * 1-based row index.
 *
 * @param  {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @returns {number}
 */
function appendEmptyRowAtBottom(sheet) {
  const newRowIndex = sheet.getLastRow() + 1;
  sheet.insertRowAfter(sheet.getLastRow());
  return newRowIndex;
}

/**
 * Writes `rowValues` into the sheet at `sheetRowIndex` and applies the
 * standard cell formatting used across all slip sheets:
 *   • Solid medium black border on all sides
 *   • Horizontal alignment: centre
 *   • Vertical alignment: middle
 *   • Text wrapping: on
 *
 * @param  {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param  {number} sheetRowIndex - 1-based row number.
 * @param  {any[]}  rowValues
 */
function applyRowValuesAndFormatting(sheet, sheetRowIndex, rowValues) {
  sheet
    .getRange(sheetRowIndex, 1, 1, rowValues.length)
    .setValues([rowValues])
    .setBorder(true, true, true, true, true, true, 'black', SpreadsheetApp.BorderStyle.SOLID_MEDIUM)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setWrap(true);
}


// SERIAL NUMBER RENUMBERING

/**
 * Re-writes the Sl. No. column (sheet column 1) with consecutive integers
 * starting at 1, covering every data row below the header row.
 *
 * Writing all values in a single setValues() call is significantly faster
 * than writing each cell individually.
 *
 * @param  {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param  {number} headerRowIndex - 0-based index of the header row.
 */
function renumberSerialNumberColumn(sheet, headerRowIndex) {
  const firstDataRow = headerRowIndex + 2;
  const lastRow      = sheet.getLastRow();
  const dataRowCount = lastRow - firstDataRow + 1;

  if (dataRowCount <= 0) {
    Logger.log('  No data rows present — Sl. No. column unchanged.');
    return;
  }

  const serialNumberValues = Array.from({ length: dataRowCount }, (_, i) => [i + 1]);
  sheet.getRange(firstDataRow, 1, dataRowCount, 1).setValues(serialNumberValues);

  Logger.log(`  Sl. No. renumbered: 1 to ${dataRowCount}.`);
}


// SHARED UTILITIES

/**
 * Returns the zero-based index of `columnName` in `headers` using a
 * case-insensitive comparison.
 *
 * Returns -1 if the column is not found. Use this for optional columns.
 * Use requireColumnIndex() for columns that are mandatory.
 *
 * @param  {string[]} headers
 * @param  {string}   columnName
 * @returns {number}
 */
function colIndexOf(headers, columnName) {
  const normalised = columnName.trim().toLowerCase();
  return headers.findIndex(h => h.toLowerCase() === normalised);
}

/**
 * Same as colIndexOf(), but throws a descriptive error instead of returning -1.
 *
 * Use this for every column whose absence would make the script unable to
 * continue (i.e. required columns in the source tables).
 *
 * @param  {string[]} headers
 * @param  {string}   columnName
 * @param  {string}   tabName    - Included in the error message for easy diagnosis.
 * @returns {number}
 * @throws {Error} If the column is not found.
 */
function requireColumnIndex(headers, columnName, tabName) {
  const idx = colIndexOf(headers, columnName);

  if (idx === -1) {
    throw new Error(
      `Required column "${columnName}" was not found in the "${tabName}" tab. ` +
      `Check the column header spelling. ` +
      `Available headers: [${headers.join(', ')}]`
    );
  }

  return idx;
}


// COLUMN NORMALIZATION

/**
 * Normalises the caller's `columns` array into two separate lists.
 *
 * String entries are treated as sequential columns — same name in both the
 * source sheet and the slip sheet, written left-to-right in the output row.
 *
 * Object entries { source, target } are treated as targeted columns — the
 * value is read from the `source` column in the source sheet and written to
 * the `target` column header in the slip sheet (located by scanning headers,
 * not by position).
 *
 * This keeps the two concerns completely separate so neither path interferes
 * with the other.
 *
 * @param  {Array<string|{source:string, target:string}>} columns
 * @returns {{
 *   sequentialCols  : string[],
 *   targetedColMaps : { source: string, target: string }[]
 * }}
 * @throws {Error} If any entry is neither a string nor a valid { source, target } object.
 */
function normalizeColumns(columns) {
  const sequentialCols  = [];
  const targetedColMaps = [];

  columns.forEach((col, index) => {
    if (typeof col === 'string') {
      sequentialCols.push(col);
      return;
    }

    if (
      col !== null &&
      typeof col === 'object' &&
      typeof col.source === 'string' && col.source.trim() !== '' &&
      typeof col.target === 'string' && col.target.trim() !== ''
    ) {
      targetedColMaps.push({ source: col.source.trim(), target: col.target.trim() });
      return;
    }

    throw new Error(
      `Invalid entry at columns[${index}]: ${JSON.stringify(col)}. ` +
      `Each entry must be either a non-empty string or an object with ` +
      `non-empty string properties "source" and "target".`
    );
  });

  return { sequentialCols, targetedColMaps };
}


// ─────────────────────────────────────────────────────────────────────────────
// TARGETED COLUMN VALUE BUILDER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Builds a lookup map of Employee Code → targeted column values for ALL
 * employees at the given site / department, regardless of active/inactive
 * status.
 *
 * Including inactive employees here is intentional: it lets us update targeted
 * columns (e.g. "New Net Salary") in preserved rows whose employee is no
 * longer active but whose row HR has chosen to keep.
 *
 * When an employee has multiple employment rows at the same site/department
 * (e.g. rehired), the ACTIVE row is preferred; if none is active, the first
 * matching row is used.
 *
 * Source column lookup order: EMPLOYMENT DETAILS first, then PERSONAL
 * INFORMATION — matching the priority used by resolveColumnSourceMap().
 *
 * @param  {{ personalInfo: Table, employment: Table }} sourceTables
 * @param  {string}      siteId
 * @param  {string|null} departmentId
 * @param  {{ source: string, target: string }[]} targetedColMaps
 * @returns {Map<string, Object.<string, any>>}
 *          empCode → { [targetColumnName]: value, … }
 */
function buildTargetedValuesMap(sourceTables, siteId, departmentId, targetedColMaps) {
  if (targetedColMaps.length === 0) {
    Logger.log('  No targeted column mappings — skipping targeted values build.');
    return new Map();
  }

  const empHeaders      = sourceTables.employment.headers;
  const personalHeaders = sourceTables.personalInfo.headers;

  // ── Column indices in the source tables ───────────────────────────────────

  const empColIdx = {
    empId  : requireColumnIndex(empHeaders, SOURCE_COL.EMPLOYMENT_EMPID, SOURCE_TAB.EMPLOYMENT),
    siteId : requireColumnIndex(empHeaders, SOURCE_COL.SITEID,           SOURCE_TAB.EMPLOYMENT),
    status : requireColumnIndex(empHeaders, SOURCE_COL.STATUS,           SOURCE_TAB.EMPLOYMENT),
    deptId : colIndexOf(empHeaders, SOURCE_COL.DEPARTMENTID),
  };

  const personalColIdx = {
    empId   : requireColumnIndex(personalHeaders, SOURCE_COL.PERSONAL_EMPID, SOURCE_TAB.PERSONAL_INFO),
    empCode : requireColumnIndex(personalHeaders, SOURCE_COL.EMPLOYEE_CODE,  SOURCE_TAB.PERSONAL_INFO),
  };

  // ── Resolve each targeted mapping to a concrete source column ─────────────

  /**
   * @typedef {{ source: string, target: string, sourceIdx: number, sourceTable: 'employment'|'personal' }} ResolvedMapping
   * @type {ResolvedMapping[]}
   */
  const resolvedMappings = targetedColMaps.map(({ source, target }) => {
    // Employment Details has priority over Personal Information.
    let sourceIdx   = colIndexOf(empHeaders, source);
    let sourceTable = 'employment';

    if (sourceIdx === -1) {
      sourceIdx   = colIndexOf(personalHeaders, source);
      sourceTable = 'personal';
    }

    if (sourceIdx === -1) {
      Logger.log(
        `  WARNING: Targeted source column "${source}" was not found in ` +
        `"${SOURCE_TAB.EMPLOYMENT}" or "${SOURCE_TAB.PERSONAL_INFO}". ` +
        `Target column "${target}" will receive an empty string.`
      );
    } else {
      Logger.log(`  Targeted mapping resolved: "${source}" (${sourceTable}) → "${target}"`);
    }

    return { source, target, sourceIdx, sourceTable };
  });

  // ── Build personal info lookup (EMPID → row) ──────────────────────────────

  const personalRowByEmpId = new Map();
  sourceTables.personalInfo.dataRows.forEach(row => {
    const empId = String(row[personalColIdx.empId]).trim();
    if (empId) personalRowByEmpId.set(empId, row);
  });

  // ── Scan employment rows, prefer ACTIVE row per employee ─────────────────

  /**
   * @type {Map<string, { employmentRow: any[], isActive: boolean }>}
   */
  const bestEmploymentRowByEmpId = new Map();

  sourceTables.employment.dataRows.forEach(row => {
    if (String(row[empColIdx.siteId]).trim() !== siteId) return;

    if (departmentId !== null && empColIdx.deptId !== -1) {
      if (String(row[empColIdx.deptId]).trim() !== departmentId) return;
    }

    const empId    = String(row[empColIdx.empId]).trim();
    const isActive = String(row[empColIdx.status]).trim().toUpperCase() === STATUS_ACTIVE;

    if (!empId) return;

    const existing = bestEmploymentRowByEmpId.get(empId);

    // Accept this row if: no row yet, OR this row is active and previous is not.
    if (!existing || (isActive && !existing.isActive)) {
      bestEmploymentRowByEmpId.set(empId, { employmentRow: row, isActive });
    }
  });

  // ── Build empCode → targeted values map ───────────────────────────────────

  const result = new Map();

  bestEmploymentRowByEmpId.forEach(({ employmentRow }, empId) => {
    const personalRow = personalRowByEmpId.get(empId);
    if (!personalRow) return;

    const empCode = String(personalRow[personalColIdx.empCode]).trim();
    if (!empCode) return;

    const targetedValues = {};

    resolvedMappings.forEach(({ target, sourceIdx, sourceTable }) => {
      if (sourceIdx === -1) {
        targetedValues[target] = '';
        return;
      }
      const sourceRow         = sourceTable === 'employment' ? employmentRow : personalRow;
      const rawValue          = sourceRow[sourceIdx];
      targetedValues[target]  = rawValue !== undefined && rawValue !== null ? rawValue : '';
    });

    result.set(empCode, targetedValues);
  });

  Logger.log(
    `  Targeted values map built: ${result.size} employee(s), ` +
    `${targetedColMaps.length} targeted column(s).`
  );
  return result;
}


// ─────────────────────────────────────────────────────────────────────────────
// TARGETED COLUMN LOCATOR
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Scans the header row of the slip sheet to find the column index for each
 * requested target column name (e.g. "New Net Salary").
 *
 * Comparison is case-insensitive. Returns only columns that were actually
 * found; missing ones are logged as warnings and absent from the returned map.
 *
 * @param  {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param  {number}   headerRowIndex - 0-based row index of the header row.
 * @param  {string[]} targetNames    - The target column header names to find.
 * @returns {Map<string, number>}  targetName (original casing) → 0-based col index
 */
function findTargetedColumnIndices(sheet, headerRowIndex, targetNames) {
  if (targetNames.length === 0) return new Map();

  const headerValues = sheet
    .getRange(headerRowIndex + 1, 1, 1, sheet.getLastColumn())
    .getValues()[0];

  const result = new Map();

  headerValues.forEach((cell, colIdx) => {
    const cellLower = String(cell).trim().toLowerCase();

    targetNames.forEach(name => {
      if (cellLower === name.trim().toLowerCase()) {
        result.set(name, colIdx);
      }
    });
  });

  // Log found and missing columns clearly for easy debugging.
  targetNames.forEach(name => {
    if (result.has(name)) {
      Logger.log(`  Targeted header "${name}" found at column index ${result.get(name)}.`);
    } else {
      Logger.log(
        `  WARNING: Targeted header "${name}" was not found in slip sheet ` +
        `"${sheet.getName()}". Values for this column will be skipped.`
      );
    }
  });

  return result;
}


// ─────────────────────────────────────────────────────────────────────────────
// TARGETED COLUMN WRITER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Writes targeted column values (e.g. "New Net Salary") into every data row
 * of the slip sheet, identified by Employee Code.
 *
 * This runs as a separate pass AFTER all row insertions / deletions are
 * complete so that preserved rows — which are never touched by the main write
 * path — also receive updated values.
 *
 * Rows whose Employee Code is absent from `targetedValuesMap` are left
 * untouched (their existing cell content is preserved).
 *
 * Each targeted cell is written individually because targeted columns can be
 * anywhere in the sheet and are not contiguous with the sequential columns.
 *
 * @param {{ sheet: GoogleAppsScript.Spreadsheet.Sheet, headerRowIndex: number, empCodeColIndex: number }} slipSheet
 * @param {Map<string, Object.<string, any>>} targetedValuesMap    - From buildTargetedValuesMap().
 * @param {Map<string, number>}               targetedColIndices   - From findTargetedColumnIndices().
 */
function updateTargetedColumns(slipSheet, targetedValuesMap, targetedColIndices) {
  if (targetedValuesMap.size === 0 || targetedColIndices.size === 0) {
    Logger.log('  No targeted columns to update — step skipped.');
    return;
  }

  const { sheet, headerRowIndex, empCodeColIndex } = slipSheet;
  const firstDataRow = headerRowIndex + 2;
  const lastRow      = sheet.getLastRow();
  let   updatedCount = 0;

  for (let rowIdx = firstDataRow; rowIdx <= lastRow; rowIdx++) {
    const empCode = String(
      sheet.getRange(rowIdx, empCodeColIndex + 1).getValue()
    ).trim();

    if (!empCode) continue;

    const targetedValues = targetedValuesMap.get(empCode);
    if (!targetedValues) continue;

    targetedColIndices.forEach((colIdx, targetName) => {
      const value = targetedValues[targetName];
      if (value === undefined) return;
      sheet.getRange(rowIdx, colIdx + 1).setValue(value);
    });

    updatedCount++;
  }

  Logger.log(`  Targeted columns updated for ${updatedCount} row(s).`);
}
