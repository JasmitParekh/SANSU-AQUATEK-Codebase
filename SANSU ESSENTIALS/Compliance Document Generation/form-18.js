// ============================================================================
// FORM-18: LEAVE WITH WAGES REGISTER
// ============================================================================

/**
 * Main entry point for Form-18 generation
 * 
 * Config parameters:
 *   attendanceSlipId    {string}  - ID of Attendance Salary Sheet spreadsheet
 *   leaveWageSheetId    {string}  - ID of Leave and Wage Sheet spreadsheet
 *   siteFolderName      {string}  - Site folder name (used for folder structure)
 *   siteName            {string}  - Short site name (used in Form-18 filename)
 *   dates               {number}  - 0 = previous month, 1 = current month
 *   plantSheetName      {string}  - Optional: specific worksheet in attendance slip
 *   categoryFilter      {string}  - Optional: filter by category
 *   generateForm18      {boolean} - Whether to generate Form-18 document
 *   form18FolderId      {string}  - Required if generateForm18: true
 *   form18TemplateId    {string}  - Required if generateForm18: true
 */
function generateForm18(config) {
  const {
    attendanceSlipId,
    leaveWageSheetId,
    siteFolderName,
    siteName,
    dates,
    plantSheetName,
    categoryFilter,
    generateForm18: shouldGenerateForm18,
    form18FolderId,
    form18TemplateId
  } = config;

  // ── Date context ──────────────────────────────────────────────────────────
  const now = new Date();
  now.setMonth(now.getMonth() + (dates === 0 ? -1 : 0));
  const currentMonth = now.getMonth();       // 0-indexed
  const currentYear  = now.getFullYear();
  const isJanuary    = currentMonth === 0;

  const MONTH_LABELS = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.',
                        'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.'];
  const monthLabel = MONTH_LABELS[currentMonth];

  Logger.log(`=== Form-18 Script Started ===`);
  Logger.log(`Processing month: ${monthLabel} ${currentYear}`);
  Logger.log(`generateForm18 flag: ${shouldGenerateForm18}`);

  // ── Load Attendance Salary Sheet ──────────────────────────────────────────
  const slipSS = SpreadsheetApp.openById(attendanceSlipId);
  let slipSheet;
  if (plantSheetName) {
    slipSheet = slipSS.getSheetByName(plantSheetName);
    if (!slipSheet) throw new Error(`Worksheet '${plantSheetName}' not found in Attendance Slip`);
  } else {
    slipSheet = slipSS.getSheets()[0];
  }

  const slipData     = slipSheet.getDataRange().getValues();
  const { headerRowIndex, headers } = SharedUtils.findHeaderRow(slipSheet);
  let dataRows = slipData.slice(headerRowIndex + 1);

  // Apply category filter if provided
  if (categoryFilter) {
    const catIdx = headers.indexOf('Category');
    if (catIdx !== -1) {
      dataRows = dataRows.filter(row => {
        return String(row[catIdx]).trim().toLowerCase() === categoryFilter.toLowerCase();
      });
    }
  }

  // Remove completely empty rows
  dataRows = dataRows.filter(row => {
    const empCode = row[headers.indexOf('Employee Code')];
    return empCode !== null && empCode !== undefined && String(empCode).trim() !== '';
  });

  Logger.log(`Loaded ${dataRows.length} employee rows from attendance slip`);

  // ── Open Leave and Wage Sheet ─────────────────────────────────────────────
  const lwSS = SpreadsheetApp.openById(leaveWageSheetId);

  // ── STEP 1: January — handle new year tab ─────────────────────────────────
  if (isJanuary) {
    handleNewYearTab(lwSS, currentYear, dataRows, headers);
  }

  // ── Get the current year tab ──────────────────────────────────────────────
  const lwSheet = lwSS.getSheetByName(String(currentYear));
  if (!lwSheet) {
    throw new Error(`Tab '${currentYear}' not found in Leave and Wage Sheet even after creation attempt`);
  }

  // Find table header row in the Leave and Wage sheet
  const lwHeaderInfo = findLeaveWageHeader(lwSheet);
  if (!lwHeaderInfo) {
    throw new Error(`Could not find 'Employee Code' header in Leave and Wage Sheet tab '${currentYear}'`);
  }
  const { headerRow: lwHeaderRow, lwHeaders } = lwHeaderInfo;

  // Column indices in Leave and Wage table
  const LW_COL = {
    empCode:      lwHeaders.indexOf('Employee Code'),
    name:         lwHeaders.indexOf('Name'),
    totalEarned:  lwHeaders.indexOf('Total Earned Leave'),
    remaining:    lwHeaders.indexOf('Remaining Leave Balance'),
    encashed:     lwHeaders.indexOf('Encashed Leaves'),
    newNetSalary: lwHeaders.indexOf('New Net Salary')
  };

  // Validate required columns exist
  Object.entries(LW_COL).forEach(([key, idx]) => {
    if (idx === -1) throw new Error(`Column '${key}' not found in Leave and Wage Sheet`);
  });

  // ── Form-18 spreadsheet (get or create) ───────────────────────────────────
  let form18SS = null;
  if (shouldGenerateForm18) {
    if (!form18FolderId || !form18TemplateId) {
      throw new Error('form18FolderId and form18TemplateId are required when generateForm18 is true');
    }
    form18SS = getOrCreateForm18Spreadsheet(
      form18FolderId,
      form18TemplateId,
      siteName,
      currentYear
    );
  }

  // ── STEP 2-4: Process each employee ──────────────────────────────────────
  dataRows.forEach(row => {
    const empCode = String(row[headers.indexOf('Employee Code')]).trim();
    if (!empCode) return;

    Logger.log(`Processing employee: ${empCode}`);

    // Read values from attendance slip
    const attValues = readAttendanceValues(row, headers);

    // Find employee row in Leave and Wage table
    const lwRowIndex = findEmployeeInLWTable(lwSheet, lwHeaderRow, LW_COL.empCode, empCode);

    // STEP 2a: Read opening balance BEFORE any update (for Col-3 of Form-18)
    let openingBalance = 0;
    if (lwRowIndex !== -1) {
      const remainingCell = lwSheet.getRange(lwRowIndex + 1, LW_COL.remaining + 1);
      const val = remainingCell.getValue();
      openingBalance = (val !== '' && !isNaN(val)) ? Number(val) : 0;
    }
    // For new employees, openingBalance stays 0

    // STEP 2b: Update Employee Code, Name, Total Earned Leave, New Net Salary
    const targetLWRow = updateLeaveWagePartial(
      lwSheet, lwHeaderRow, lwRowIndex, LW_COL,
      empCode, attValues
    );

    // STEP 3: Generate Form-18 for this employee (uses openingBalance for Col-3)
    if (shouldGenerateForm18 && form18SS) {
      generateEmployeeForm18Tab(
        form18SS,
        form18TemplateId,
        row,
        headers,
        attValues,
        openingBalance,
        monthLabel,
        currentYear
      );
    }

    // STEP 4: Update Remaining Leave Balance (subtract this month's leaves)
    updateRemainingBalance(lwSheet, targetLWRow, LW_COL.remaining, attValues.plClSl);

    Logger.log(`Employee ${empCode}: done. Opening balance was ${openingBalance}`);
  });

  SpreadsheetApp.flush();
  Logger.log(`=== Form-18 Script Completed ===`);
}


// ============================================================================
// STEP 1 HELPERS — New Year Tab
// ============================================================================

/**
 * Handle January: create new year tab if needed, carry forward balances
 */
function handleNewYearTab(lwSS, currentYear, dataRows, headers) {
  const yearStr     = String(currentYear);
  const prevYearStr = String(currentYear - 1);

  let currentYearSheet = lwSS.getSheetByName(yearStr);
  if (currentYearSheet) {
    Logger.log(`Tab '${yearStr}' already exists. Skipping new year setup.`);
    return;
  }

  Logger.log(`Creating new year tab: ${yearStr}`);

  // Find previous year tab
  const prevYearSheet = lwSS.getSheetByName(prevYearStr);
  if (!prevYearSheet) {
    throw new Error(`Previous year tab '${prevYearStr}' not found. Cannot create new year tab.`);
  }

  // Copy previous year tab
  const newSheet = prevYearSheet.copyTo(lwSS);
  newSheet.setName(yearStr);

  // Move the new tab to be after the previous year tab (optional, keeps order)
  const prevIndex = lwSS.getSheets().findIndex(s => s.getName() === prevYearStr);
  lwSS.moveActiveSheet(prevIndex + 2); // +2 because sheets are 1-indexed and we want after prevYear

  Logger.log(`Copied tab '${prevYearStr}' to '${yearStr}'`);

  // Find table header in new tab
  const lwHeaderInfo = findLeaveWageHeader(newSheet);
  if (!lwHeaderInfo) {
    throw new Error(`Could not find header row in new year tab '${yearStr}'`);
  }
  const { headerRow, lwHeaders } = lwHeaderInfo;

  const LW_COL = {
    empCode:     lwHeaders.indexOf('Employee Code'),
    totalEarned: lwHeaders.indexOf('Total Earned Leave'),
    remaining:   lwHeaders.indexOf('Remaining Leave Balance'),
    encashed:    lwHeaders.indexOf('Encashed Leaves')
  };

  // Read all data from new tab (which is a copy of previous year)
  const allData = newSheet.getDataRange().getValues();

  // Process each employee row in the copied tab
  for (let r = headerRow + 1; r < allData.length; r++) {
    const rowData = allData[r];
    const empCode = String(rowData[LW_COL.empCode]).trim();
    if (!empCode) continue;

    // Get previous year's Total Earned Leave and Remaining Leave Balance
    const prevTotalEarned = Number(rowData[LW_COL.totalEarned]) || 0;
    const prevRemaining   = Number(rowData[LW_COL.remaining])   || 0;

    const combined = prevTotalEarned + prevRemaining;
    const newRemaining = Math.min(combined, 15);
    const encashedExtra = combined > 15 ? parseFloat((combined - 15).toFixed(2)) : 0;

    // Write new Remaining Leave Balance (plain value)
    newSheet.getRange(r + 1, LW_COL.remaining + 1).setValue(newRemaining);

    // Write Encashed Leaves only if there is excess (plain value, never touched again)
    if (encashedExtra > 0) {
      newSheet.getRange(r + 1, LW_COL.encashed + 1).setValue(encashedExtra);
    }

    // Clear Total Earned Leave (fresh start for the new year)
    newSheet.getRange(r + 1, LW_COL.totalEarned + 1).setValue('');

    Logger.log(`New year setup for ${empCode}: prevEarned=${prevTotalEarned}, prevRemaining=${prevRemaining}, newRemaining=${newRemaining}, encashed=${encashedExtra}`);
  }

  SpreadsheetApp.flush();
  Logger.log(`New year tab '${yearStr}' setup complete`);
}


// ============================================================================
// LEAVE AND WAGE TABLE HELPERS
// ============================================================================

/**
 * Find the header row in Leave and Wage Sheet by looking for "Employee Code"
 * Returns { headerRow (0-indexed row index), lwHeaders (array of header strings) }
 */
function findLeaveWageHeader(sheet) {
  const data = sheet.getDataRange().getValues();
  for (let r = 0; r < data.length; r++) {
    const row = data[r];
    for (let c = 0; c < row.length; c++) {
      if (String(row[c]).trim() === 'Employee Code') {
        return {
          headerRow: r,
          lwHeaders: row.map(h => String(h).trim())
        };
      }
    }
  }
  return null;
}

/**
 * Find employee row index (0-based) in Leave and Wage table
 * Returns -1 if not found
 */
function findEmployeeInLWTable(sheet, headerRow, empCodeColIndex, empCode) {
  const data = sheet.getDataRange().getValues();
  for (let r = headerRow + 1; r < data.length; r++) {
    const cellValue = String(data[r][empCodeColIndex]).trim();
    if (cellValue === empCode) {
      return r;
    }
  }
  return -1;
}

/**
 * Read all required values from one attendance slip row
 */
function readAttendanceValues(row, headers) {
  const get = (colName) => {
    const idx = headers.indexOf(colName);
    if (idx === -1) return '';
    const val = row[idx];
    return (val === null || val === undefined) ? '' : val;
  };

  return {
    empCode:       String(get('Employee Code')).trim(),
    name:          String(get('Name')).trim(),
    earnedLeave:   Number(get('Earned Leave'))                      || 0,
    plClSl:        Number(get('PL/CL/SL'))                          || 0,
    presentDays:   Number(get('Present Days'))                      || 0,
    weeklyOff:     Number(get('Weekly Off'))                        || 0,
    from:          get('From'),
    to:            get('To'),
    dailyRate:     Number(get('Daily rate of wages/Pieces Rate'))   || 0,
    newNetSalary:  Number(get('New Net Salary'))                    || 0,
    fatherName:    String(get("Father's/Husband's Name")).trim(),
    designation:   String(get('Designation')).trim(),
    doj:           get('DOJ')
  };
}

/**
 * Update Employee Code, Name, Total Earned Leave (cumulative formula), New Net Salary
 * Does NOT touch Remaining Leave Balance or Encashed Leaves
 * Returns the 0-based row index of the employee in the sheet
 */
function updateLeaveWagePartial(lwSheet, headerRow, lwRowIndex, LW_COL, empCode, attValues) {
  let targetRow;

  if (lwRowIndex === -1) {
    // New employee — add row at the end
    const lastRow = lwSheet.getLastRow();
    targetRow = lastRow; // 0-based index of the new row (lastRow is 1-based, so lastRow = next empty row index 0-based)

    // Write Employee Code and Name
    lwSheet.getRange(lastRow + 1, LW_COL.empCode + 1).setValue(empCode);
    lwSheet.getRange(lastRow + 1, LW_COL.name   + 1).setValue(attValues.name);

    Logger.log(`New employee ${empCode} added at row ${lastRow + 1}`);
  } else {
    targetRow = lwRowIndex;

    // Update name (in case it changed)
    lwSheet.getRange(targetRow + 1, LW_COL.name + 1).setValue(attValues.name);
  }

  // ── Update Total Earned Leave (cumulative formula) ─────────────────────
  const earnedCell = lwSheet.getRange(targetRow + 1, LW_COL.totalEarned + 1);
  const newEarned  = attValues.earnedLeave;

  let newEarnedFormula;
  if (lwRowIndex === -1) {
    // New employee — always start fresh, never read the cell
    // (the cell may have inherited a formula from the row above via table auto-fill)
    newEarnedFormula = `=${newEarned}`;
  } else {
    // Existing employee — read current cell and append
    const existingFormula = earnedCell.getFormula();
    const existingValue   = earnedCell.getValue();

    if (!existingFormula && (existingValue === '' || existingValue === null || existingValue === 0)) {
      newEarnedFormula = `=${newEarned}`;
    } else {
      const base = existingFormula
        ? existingFormula.substring(1)   // strip leading '='
        : String(existingValue);
      newEarnedFormula = `=${base}+${newEarned}`;
    }
  }
  earnedCell.setFormula(newEarnedFormula);

  // ── Update New Net Salary ──────────────────────────────────────────────
  lwSheet.getRange(targetRow + 1, LW_COL.newNetSalary + 1).setValue(attValues.newNetSalary);

  return targetRow;
}

/**
 * Update Remaining Leave Balance (subtract this month's PL/CL/SL)
 * Formula is built cumulatively, similar to Total Earned Leave but subtractive
 */
function updateRemainingBalance(lwSheet, targetRow, remainingColIndex, plClSl) {
  if (plClSl === 0) {
    Logger.log(`No leaves taken this month — Remaining Leave Balance unchanged`);
    return;
  }

  const cell            = lwSheet.getRange(targetRow + 1, remainingColIndex + 1);
  const existingFormula = cell.getFormula();
  const existingValue   = cell.getValue();

  let newFormula;
  if (!existingFormula && (existingValue === '' || existingValue === null)) {
    // Should not normally happen (balance is always set), but handle gracefully
    newFormula = `=0-${plClSl}`;
  } else {
    const currentVal = Number(existingValue);
    if (!existingFormula) {
      // Plain value (e.g. set during new year carry-forward)
      newFormula = `=${currentVal}-${plClSl}`;
    } else {
      // Existing formula — append subtraction
      const base = existingFormula.substring(1); // strip '='
      newFormula = `=${base}-${plClSl}`;
    }
  }

  cell.setFormula(newFormula);
  Logger.log(`Remaining Leave Balance updated: subtracted ${plClSl}`);
}


// ============================================================================
// FORM-18 SPREADSHEET HELPERS
// ============================================================================

/**
 * Get or create the Form-18 spreadsheet for the given site and year
 */
function getOrCreateForm18Spreadsheet(folderId, templateId, siteName, year) {
  const folder   = DriveApp.getFolderById(folderId);
  const docName  = `Form-18 ${siteName} - ${year}`;
  const files    = folder.getFilesByName(docName);

  if (files.hasNext()) {
    const file = files.next();
    Logger.log(`Found existing Form-18 spreadsheet: ${docName}`);
    return SpreadsheetApp.openById(file.getId());
  }

  // Create from template
  const templateFile = DriveApp.getFileById(templateId);
  const newFile      = templateFile.makeCopy(docName, folder);
  const newSS        = SpreadsheetApp.openById(newFile.getId());
  Logger.log(`Created new Form-18 spreadsheet: ${docName}`);
  return newSS;
}

/**
 * Get or create a tab for a specific employee in the Form-18 spreadsheet
 * Tab name format: "{Name} / {Employee Code}"
 * Existence check is done by scanning all tab names for the employee code
 */
function getOrCreateEmployeeTab(form18SS, form18TemplateId, empCode, empName) {
  const tabName    = `${empName} / ${empCode}`;
  const allSheets  = form18SS.getSheets();

  // Check if tab already exists (search by employee code in tab name)
  for (const sheet of allSheets) {
    const sheetName = sheet.getName();
    // Match employee code portion after " / "
    const parts = sheetName.split(' / ');
    if (parts.length >= 2 && parts[parts.length - 1].trim() === empCode) {
      Logger.log(`Found existing tab for ${empCode}: '${sheetName}'`);
      return sheet;
    }
  }

  // Tab does not exist — create from template
  Logger.log(`Creating new tab for ${empCode}: '${tabName}'`);
  const templateSS    = SpreadsheetApp.openById(form18TemplateId);
  const templateSheet = templateSS.getSheets()[0];
  const newSheet      = templateSheet.copyTo(form18SS);
  newSheet.setName(tabName);
  return newSheet;
}

/**
 * Replace placeholders in employee tab using TextFinder (find & replace)
 */
function replacePlaceholders(sheet, attValues) {
  const dojFormatted = attValues.doj instanceof Date
    ? Utilities.formatDate(attValues.doj, Session.getScriptTimeZone(), 'dd/MM/yyyy')
    : String(attValues.doj);

  // Placeholders as they appear in the Form-18 template
  // NOTE: Update '<<n>>' to match the actual placeholder in your template for Name
  const replacements = [
    ['<<Name>>',                       attValues.name],
    ["<<Father's/Husband's Name>>", attValues.fatherName],
    ['<<Designation>>',              attValues.designation],
    ['<<DOJ>>',                      dojFormatted]
  ];

  replacements.forEach(([placeholder, value]) => {
    sheet.createTextFinder(placeholder)
         .matchEntireCell(false)
         .replaceAllWith(String(value));
  });
}

/**
 * Find the header row (row containing 1, 2, 3 ... 22 as column numbers) in Form-18 tab
 * Returns 1-based row number
 */
function findForm18HeaderRow(sheet) {
  const data = sheet.getDataRange().getValues();
  for (let r = 0; r < data.length; r++) {
    const row = data[r];
    // Look for a row where the first non-empty cell value is 1 and next is 2
    const nonEmpty = row.filter(c => c !== '' && c !== null);
    if (nonEmpty.length >= 2 && Number(nonEmpty[0]) === 1 && Number(nonEmpty[1]) === 2) {
      return r + 1; // 1-based
    }
  }
  return -1;
}

/**
 * Find the row for a given month label (e.g. "Jan.") in the Form-18 tab
 * Searches below the header row. Returns 1-based row number or -1 if not found.
 */
function findMonthRow(sheet, headerRow1Based, monthLabel) {
  const data      = sheet.getDataRange().getValues();
  const startRow  = headerRow1Based; // 0-based search starts here

  for (let r = startRow; r < data.length; r++) {
    const firstCell = String(data[r][0]).trim();
    if (firstCell === monthLabel) {
      return r + 1; // 1-based
    }
  }
  return -1;
}

/**
 * Generate or update the month row in an employee's Form-18 tab
 */
function generateEmployeeForm18Tab(
  form18SS,
  form18TemplateId,
  attRow,
  headers,
  attValues,
  openingBalance,
  monthLabel,
  currentYear
) {
  // Get or create employee tab
  const empSheet = getOrCreateEmployeeTab(
    form18SS,
    form18TemplateId,
    attValues.empCode,
    attValues.name
  );

  // Replace placeholders (safe to run every time — idempotent if already replaced)
  replacePlaceholders(empSheet, attValues);

  // Find header row (row with column numbers 1, 2, 3 ...)
  const headerRow1Based = findForm18HeaderRow(empSheet);
  if (headerRow1Based === -1) {
    Logger.log(`Warning: Could not find header row (1,2,3...) in tab for ${attValues.empCode}. Skipping row update.`);
    return;
  }

  // Find the month row
  const monthRow1Based = findMonthRow(empSheet, headerRow1Based, monthLabel);
  if (monthRow1Based === -1) {
    Logger.log(`Warning: Could not find month row '${monthLabel}' in tab for ${attValues.empCode}. Skipping.`);
    return;
  }

  // Build the 22-column data array for this row
  // Columns 1-22 (1-indexed). Col 1 is the month label (already in sheet), Col 22 is untouched.
  // We write columns 2-21.
  const r = monthRow1Based; // shorthand for formula construction

  // Helper to get column letter by 1-based column number
  const colLetter = (colNum) => SharedUtils.getColumnLetter(colNum - 1);

  const netSalaryPer26 = attValues.newNetSalary > 0
    ? parseFloat((attValues.newNetSalary / 26).toFixed(2))
    : 0;

  // Build values for columns 2 through 21
  // Index in this array: 0 = Col 2, 1 = Col 3, ... 19 = Col 21
  const colData = [
    '-',                                                          // Col 2
    openingBalance,                                               // Col 3: opening balance
    '-',                                                          // Col 4
    attValues.plClSl || '-',                                      // Col 5: PL/CL/SL
    attValues.from   || '-',                                      // Col 6: From
    attValues.to     || '-',                                      // Col 7: To
    '-',                                                          // Col 8
    attValues.presentDays,                                        // Col 9: Present Days
    attValues.weeklyOff,                                          // Col 10: Weekly Off
    0,                                                            // Col 11
    attValues.plClSl || 0,                                        // Col 12: same as Col 5
    // Col 13: formula =Col9+Col10+Col11+Col12
    `=${colLetter(9)}${r}+${colLetter(10)}${r}+${colLetter(11)}${r}+${colLetter(12)}${r}`,
    attValues.earnedLeave,                                        // Col 14: Earned Leave
    '-',                                                          // Col 15
    // Col 16: formula =Col3+Col14
    `=${colLetter(3)}${r}+${colLetter(14)}${r}`,
    attValues.plClSl || 0,                                        // Col 17: same as Col 5
    attValues.dailyRate || '-',                                   // Col 18: Daily rate
    '-',                                                          // Col 19
    netSalaryPer26,                                               // Col 20: NewNetSalary/26
    // Col 21: formula =Col20*Col17
    `=${colLetter(20)}${r}*${colLetter(17)}${r}`
  ];

  // Write each column individually (formulas via setFormula, values via setValue)
  for (let i = 0; i < colData.length; i++) {
    const colNum  = i + 2;     // Col 2 to Col 21
    const cell    = empSheet.getRange(r, colNum);
    const val     = colData[i];

    if (typeof val === 'string' && val.startsWith('=')) {
      cell.setFormula(val);
    } else {
      cell.setValue(val);
    }
  }

  Logger.log(`Form-18 updated for ${attValues.empCode} — month: ${monthLabel}`);
}
