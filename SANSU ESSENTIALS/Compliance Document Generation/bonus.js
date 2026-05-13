// ===== CONFIGURATION CONSTANTS =====
const CONFIG = {
  COLUMN_HEADERS: {
    EMPLOYEE_CODE: 'Employee Code',
    REMARKS: 'Remarks',
    CATEGORY: 'Category',
    SR_NO: 'Sr. No.',
    NAME: 'Name',
    SITE: 'Site',
    PRESENT: 'Present Days',
    LEAVE_DAYS: 'PL/CL/SL',
    EARN_BASIC: 'Earned Basic Wages',
    BONUS: 'Bonus'
  },
  SUBHEADER_KEYWORDS: {
    PRESENT: 'PRESENT',
    EARN: 'EARN',
    BASIC: 'BASIC',
    BONUS: 'BONUS'
  },
  MONTH_NAMES: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
  SEARCH_DEPTH: 5,  // Search first 5 rows for headers
  COLORS: {
    RED: '#EA9999',      // NO DUE PAID
    ORANGE: '#FABF8F'    // Transferred
  },
  BONUS_PERCENTAGE: 8.33  // Bonus calculation percentage
};

// ===== BATCH PROCESSING CACHE MANAGER =====
// Handles in-memory data arrays, ensuring formulas are preserved using a Hybrid write array.
const SheetCacheManager = {
  caches: {},

  getCache: function(sheet) {
    const sheetName = sheet.getName();
    if (this.caches[sheetName]) return this.caches[sheetName];

    Logger.log(`Loading ${sheetName} into memory cache...`);
    const dataRange = sheet.getDataRange();
    
    // Ensure we don't error out on a completely empty sheet
    if (sheet.getLastRow() === 0) sheet.getRange('A1').setValue('');
    
    let readValues = dataRange.getValues();
    let formulas = dataRange.getFormulas(); // Load existing formulas to preserve them
    let notes = dataRange.getNotes();
    let backgrounds = dataRange.getBackgrounds();

    // Ensure our 2D arrays are perfectly rectangular
    const maxCols = Math.max(...readValues.map(r => r.length), 15);
    this.pad2DArray(readValues, maxCols, '');
    this.pad2DArray(formulas, maxCols, '');
    this.pad2DArray(notes, maxCols, '');
    this.pad2DArray(backgrounds, maxCols, null);

    // CRITICAL FIX: Create a Hybrid write array. If a formula exists, use it. Otherwise, use the value.
    let writeValues = readValues.map((row, r) => 
      row.map((val, c) => formulas[r][c] ? formulas[r][c] : val)
    );

    // Initial mapping
    const { headerRowIndex, headers } = SharedUtils.findHeaderRow(sheet);
    const empCodeColIndex = headers ? headers.indexOf(CONFIG.COLUMN_HEADERS.EMPLOYEE_CODE) : -1;
    const remarksColIndex = headers ? headers.indexOf(CONFIG.COLUMN_HEADERS.REMARKS) : -1;
    const srNoColIndex = headers ? headers.indexOf(CONFIG.COLUMN_HEADERS.SR_NO) : -1;

    const employeeMap = new Map();
    let lastSerial = 0;

    // Build the fast-lookup map for employees using the read values
    if (headerRowIndex !== -1 && empCodeColIndex !== -1) {
      for (let r = headerRowIndex + 1; r < readValues.length; r++) {
        const empCode = String(readValues[r][empCodeColIndex]).trim();
        if (!empCode) continue;

        const remarks = remarksColIndex !== -1 ? String(readValues[r][remarksColIndex]).trim().toLowerCase() : '';
        const isInactive = remarks.includes('left') || remarks.includes('no due paid');

        if (srNoColIndex !== -1) {
          const val = readValues[r][srNoColIndex];
          if (val !== '' && !isNaN(val) && Number(val) > lastSerial) lastSerial = Number(val);
        }

        // STRICT BUSINESS LOGIC FIX: 
        // We only map active rows. If they are marked 'left' or 'no due paid', 
        // we intentionally DO NOT add them to the map. This forces the system 
        // to return -1 later, which triggers the creation of a brand new row.
        if (!isInactive) {
          employeeMap.set(empCode, r);
        }
      }
    }

    this.caches[sheetName] = {
      sheet: sheet,
      readValues: readValues,     // Use this to check conditions/data
      writeValues: writeValues,   // Use this to push data and formulas back
      notes: notes,
      backgrounds: backgrounds,
      maxCols: maxCols,
      headerRowIndex: headerRowIndex,
      headers: headers,
      employeeMap: employeeMap,
      lastSerial: lastSerial
    };

    return this.caches[sheetName];
  },

  pad2DArray: function(arr, targetLength, fillValue) {
    arr.forEach(row => {
      while (row.length < targetLength) row.push(fillValue);
    });
  },

  addRow: function(cache, rowDataValues) {
    const newRow = [...rowDataValues];
    while (newRow.length < cache.maxCols) newRow.push('');
    
    const newNotes = new Array(cache.maxCols).fill('');
    const newBgs = new Array(cache.maxCols).fill(null);

    // Push to both arrays to keep memory in sync
    cache.readValues.push([...newRow]);
    cache.writeValues.push([...newRow]);
    cache.notes.push(newNotes);
    cache.backgrounds.push(newBgs);

    return cache.writeValues.length - 1; // Return the new row index
  },

  flushAll: function() {
    Logger.log('Flushing all memory caches back to physical Google Sheets...');
    for (const sheetName in this.caches) {
      const cache = this.caches[sheetName];
      const numRows = cache.writeValues.length;
      const numCols = cache.maxCols;

      this.pad2DArray(cache.writeValues, numCols, '');
      this.pad2DArray(cache.notes, numCols, '');
      this.pad2DArray(cache.backgrounds, numCols, null);

      const range = cache.sheet.getRange(1, 1, numRows, numCols);
      
      // Write the hybrid array back. Formulas stay formulas, values stay values.
      range.setValues(cache.writeValues); 
      range.setNotes(cache.notes);
      range.setBackgrounds(cache.backgrounds);

      // Apply fast batch borders mapping to data area
      if (cache.headerRowIndex !== -1 && numRows > cache.headerRowIndex + 1) {
        const dataRange = cache.sheet.getRange(cache.headerRowIndex + 2, 1, numRows - cache.headerRowIndex - 1, numCols);
        dataRange.setBorder(true, true, true, true, true, true, 'black', SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
        dataRange.setHorizontalAlignment('center').setVerticalAlignment('middle').setWrap(true);
      }
    }
  }
};

/**
 * Main function to generate/update Bonus Document
 */
function generateBonusDocument(config1) {
  const { templateID, targetFolderID, attendanceSlipID, siteFolderName, dates, formConfig, plantSheetName } = config1;

  const now = new Date();
  now.setMonth(now.getMonth() + (dates === 0 ? -1 : 0));
  const month = now.getMonth();
  const year = now.getFullYear();

  const { documentName, monthName } = getBonusFinancialYearName(month, year);
  const worksheetName = plantSheetName || siteFolderName;

  Logger.log(`Target Document: ${documentName}, Worksheet: ${worksheetName}`);

  // Get or Create physical sheet, then load into our fast cache
  const { spreadsheet, sheet } = getOrCreateBonusSheet(targetFolderID, documentName, worksheetName, templateID);
  const sourceCache = SheetCacheManager.getCache(sheet);

  const monthColumns = findMonthColumnsInCache(sourceCache, monthName);
  if (!monthColumns) throw new Error(`Could not find month columns for ${monthName} in worksheet ${worksheetName}`);

  // Load Attendance Slip Data
  const slipSS = SpreadsheetApp.openById(attendanceSlipID);
  const slipSheet = plantSheetName ? slipSS.getSheetByName(plantSheetName) : slipSS.getSheets()[0];
  if (!slipSheet) throw new Error(`Worksheet '${plantSheetName}' not found in Attendance Slip`);
  
  const slipData = slipSheet.getDataRange().getValues();
  const { headerRowIndex, headers } = SharedUtils.findHeaderRow(slipSheet);
  const dataRows = slipData.slice(headerRowIndex + 1);

  const empCodeIndex = headers.indexOf(CONFIG.COLUMN_HEADERS.EMPLOYEE_CODE);
  if (empCodeIndex === -1) throw new Error('Employee Code column not found in attendance slip');
  const remarksIndex = headers.indexOf(CONFIG.COLUMN_HEADERS.REMARKS);

  let processedCount = 0;
  let transferredCount = 0;

  // Build a Set of all employee codes present in the attendance slip
  const slipEmployeeCodes = new Set(
    dataRows
      .map(row => String(row[empCodeIndex]).trim())
      .filter(code => code !== '')
  );

  // Process rows entirely in memory
  dataRows.forEach((row) => {
    const empCode = String(row[empCodeIndex]).trim();
    if (!empCode) return;

    const remarks = remarksIndex !== -1 ? String(row[remarksIndex]).trim() : '';

    if (remarks.toLowerCase().includes('transferred to')) {
      const destinationSite = extractDestinationSite(remarks);
      if (!destinationSite) {
        Logger.log(`Warning: Could not extract destination site from remarks: "${remarks}"`);
        return;
      }
      insertOrUpdateEmployeeInCache(sourceCache, row, headers, monthColumns, worksheetName, remarks, formConfig);
      handleTransferToDestinationInCache(spreadsheet, templateID, destinationSite, row, headers, worksheetName, monthName, formConfig);
      transferredCount++;
    } else {
      insertOrUpdateEmployeeInCache(sourceCache, row, headers, monthColumns, worksheetName, remarks, formConfig);
    }
    processedCount++;
  });

  // Mark employees as "Left" if not found in attendance slip
  markAbsentEmployeesAsLeft(sourceCache, slipEmployeeCodes);

  // Apply visual formatting purely in memory
  applyRemarksFormattingInCache(sourceCache);
  
  // Flush all changes from memory back to physical sheets in one massive batch
  SheetCacheManager.flushAll();
  
  Logger.log(`\nBonus Document updated successfully: ${documentName} - ${worksheetName}`);
  Logger.log(`Processed: ${processedCount} employees, Transferred: ${transferredCount}`);
}

function markAbsentEmployeesAsLeft(cache, slipEmployeeCodes) {
  const remarksColIndex = cache.headers.indexOf(CONFIG.COLUMN_HEADERS.REMARKS);
  if (remarksColIndex === -1) return;

  for (let r = cache.headerRowIndex + 1; r < cache.readValues.length; r++) {
    const empCode = String(cache.readValues[r][cache.headers.indexOf(CONFIG.COLUMN_HEADERS.EMPLOYEE_CODE)]).trim();
    if (!empCode) continue;

    const remarks = String(cache.readValues[r][remarksColIndex]).trim().toLowerCase();

    // Skip already handled rows
    if (remarks.includes('left') || remarks.includes('no due paid') || remarks.includes('transferred to')) continue;

    // If not in slip, mark as Left
    if (!slipEmployeeCodes.has(empCode)) {
      cache.readValues[r][remarksColIndex] = 'Left';
      cache.writeValues[r][remarksColIndex] = 'Left';
      cache.backgrounds[r].fill(CONFIG.COLORS.RED);
      Logger.log(`Employee ${empCode}: Not found in attendance slip - marked as Left`);
    }
  }
}

/**
 * Find month columns inside memory array
 */
function findMonthColumnsInCache(cache, monthName) {
  for (let r = 0; r < Math.min(CONFIG.SEARCH_DEPTH, cache.readValues.length); r++) {
    const row = cache.readValues[r];
    for (let c = 0; c < row.length; c++) {
      if (String(row[c]).trim() === monthName && r + 1 < cache.readValues.length) {
        const subHeaderRow = cache.readValues[r + 1];
        let presentCol = -1, basicCol = -1, bonusCol = -1;

        for (let sc = c; sc < Math.min(c + 5, subHeaderRow.length); sc++) {
          const subHeader = String(subHeaderRow[sc]).trim().toUpperCase();
          if (subHeader.includes(CONFIG.SUBHEADER_KEYWORDS.PRESENT) && presentCol === -1) presentCol = sc;
          else if (subHeader.includes(CONFIG.SUBHEADER_KEYWORDS.EARN) && subHeader.includes(CONFIG.SUBHEADER_KEYWORDS.BASIC) && basicCol === -1) basicCol = sc;
          else if (subHeader.includes(CONFIG.SUBHEADER_KEYWORDS.BONUS) && bonusCol === -1) bonusCol = sc;
        }

        if (presentCol !== -1 && basicCol !== -1 && bonusCol !== -1) {
          return { presentCol, basicCol, bonusCol, headerRow: r + 1 };
        }
      }
    }
  }
  return null;
}

/**
 * Insert or update employee in memory cache
 */
function insertOrUpdateEmployeeInCache(cache, row, headers, monthColumns, currentSiteName, remarks, formConfig) {
  const empCode = getValueFromRow(row, headers, CONFIG.COLUMN_HEADERS.EMPLOYEE_CODE);
  const targetRowIndex = cache.employeeMap.has(empCode) ? cache.employeeMap.get(empCode) : -1;
  
  if (targetRowIndex === -1) {
    addNewEmployeeRowInCache(cache, row, headers, monthColumns, currentSiteName, remarks, formConfig);
  } else {
    const remarksColIndex = cache.headers.indexOf(CONFIG.COLUMN_HEADERS.REMARKS);
    const existingRemarks = remarksColIndex !== -1 ? String(cache.readValues[targetRowIndex][remarksColIndex]).trim() : '';
    
    if (existingRemarks.toLowerCase().includes('transferred to')) {
      // Clear transfer status in memory (both read and write arrays to keep them synced)
      if (remarksColIndex !== -1) {
        cache.readValues[targetRowIndex][remarksColIndex] = '';
        cache.writeValues[targetRowIndex][remarksColIndex] = '';
      }
      cache.backgrounds[targetRowIndex].fill(null);
    }
    
    updateMonthDataInCache(cache, targetRowIndex, row, headers, monthColumns, currentSiteName);
    
    if (remarksColIndex !== -1 && remarks) {
      cache.readValues[targetRowIndex][remarksColIndex] = remarks;
      cache.writeValues[targetRowIndex][remarksColIndex] = remarks;
    }
  }
}

/**
 * Add new employee row to memory cache
 */
function addNewEmployeeRowInCache(cache, row, headers, monthColumns, currentSiteName, remarks, formConfig) {
  cache.lastSerial++;
  const serialNumber = cache.lastSerial;
  const basicRowData = generateBonusRowData(row, headers, formConfig, serialNumber, currentSiteName);
  const remarksColIndex = cache.headers.indexOf(CONFIG.COLUMN_HEADERS.REMARKS);
  
  const fullRowData = new Array(cache.maxCols).fill('');
  
  // Assign the first 4 specific columns dynamically based on old logic mapping
  for(let i=0; i < Math.min(4, basicRowData.length); i++){
    fullRowData[i] = basicRowData[i];
  }
  
  // Assign Remarks explicitly to its tracked column index
  if (remarksColIndex !== -1 && remarks) {
    fullRowData[remarksColIndex] = remarks;
  }
  
  const newRowIndex = SheetCacheManager.addRow(cache, fullRowData);
  const empCode = getValueFromRow(row, headers, CONFIG.COLUMN_HEADERS.EMPLOYEE_CODE);
  
  // Map the new (active) row so subsequent updates in the same pass hit this row
  cache.employeeMap.set(empCode, newRowIndex);
  
  updateMonthDataInCache(cache, newRowIndex, row, headers, monthColumns, currentSiteName);
}

/**
 * Update month data directly in cache arrays
 */
function updateMonthDataInCache(cache, rowIndex, row, headers, monthColumns, sourceSiteName) {
  const existingPresent = Number(cache.readValues[rowIndex][monthColumns.presentCol]) || 0;
  const existingBasic = Number(cache.readValues[rowIndex][monthColumns.basicCol]) || 0;
  
  const existingPresentNote = cache.notes[rowIndex][monthColumns.presentCol] || '';
  const existingBasicNote = cache.notes[rowIndex][monthColumns.basicCol] || '';
  const existingBonusNote = cache.notes[rowIndex][monthColumns.bonusCol] || '';
  
  const presentDays = Number(getValueFromRow(row, headers, CONFIG.COLUMN_HEADERS.PRESENT)) || 0;
  const leaveDays = Number(getValueFromRow(row, headers, CONFIG.COLUMN_HEADERS.LEAVE_DAYS)) || 0;
  const incomingPresent = presentDays + leaveDays;
  const incomingBasic = Number(getValueFromRow(row, headers, CONFIG.COLUMN_HEADERS.EARN_BASIC)) || 0;
  const incomingBonus = Math.round(incomingBasic * CONFIG.BONUS_PERCENTAGE / 100);
  
  const basicColLetter = SharedUtils.getColumnLetter(monthColumns.basicCol);
  const newBonusFormula = `=ROUND(${basicColLetter}${rowIndex + 1}*${CONFIG.BONUS_PERCENTAGE}%, 0)`;

  let newPresent, newBasic;
  let newPresentNote = '', newBasicNote = '', newBonusNote = '';

  if (existingPresent > 0) {
    // Data already exists — this is a transfer combination scenario
    newPresent = existingPresent + incomingPresent;
    newBasic = existingBasic + incomingBasic;
    const existingBonusNumber = Math.round(existingBasic * CONFIG.BONUS_PERCENTAGE / 100);

    // Always append — whether notes exist or not
    newPresentNote = `${existingPresentNote ? existingPresentNote + ' + ' : ''}${sourceSiteName} PRESENT: ${incomingPresent}`;
    newBasicNote = `${existingBasicNote ? existingBasicNote + ' + ' : ''}${sourceSiteName} EARN BASIC: ${incomingBasic}`;
    newBonusNote = `${existingBonusNote ? existingBonusNote + ' + ' : ''}${sourceSiteName} BONUS: ${incomingBonus}`;

    // If no existing note, it means this is the first combination.
    // So we also need to record the existing destination site's data on the left side.
    if (!existingPresentNote) {
      newPresentNote = `${cache.sheet.getName()} PRESENT: ${existingPresent} + ${sourceSiteName} PRESENT: ${incomingPresent}`;
      newBasicNote = `${cache.sheet.getName()} EARN BASIC: ${existingBasic} + ${sourceSiteName} EARN BASIC: ${incomingBasic}`;
      newBonusNote = `${cache.sheet.getName()} BONUS: ${existingBonusNumber} + ${sourceSiteName} BONUS: ${incomingBonus}`;
    }
  } else {
    // First time data for this month — no combination needed, no notes
    newPresent = incomingPresent;
    newBasic = incomingBasic;
  }

  // Update Read array (for logic) and Write array (for flushing)
  cache.readValues[rowIndex][monthColumns.presentCol] = newPresent;
  cache.writeValues[rowIndex][monthColumns.presentCol] = newPresent;

  cache.readValues[rowIndex][monthColumns.basicCol] = newBasic;
  cache.writeValues[rowIndex][monthColumns.basicCol] = newBasic;

  // Only inject formula string into Write array for Bonus column
  cache.writeValues[rowIndex][monthColumns.bonusCol] = newBonusFormula;

  // Only set notes if a combination has occurred
  if (newPresentNote) {
    cache.notes[rowIndex][monthColumns.presentCol] = newPresentNote;
    cache.notes[rowIndex][monthColumns.basicCol] = newBasicNote;
    cache.notes[rowIndex][monthColumns.bonusCol] = newBonusNote;
  }
}

/**
 * Handle transfer combining in memory
 */
function handleTransferToDestinationInCache(spreadsheet, templateID, destinationSiteName, row, headers, sourceSiteName, monthName, formConfig) {
  let destSheet = spreadsheet.getSheetByName(destinationSiteName);
  if (!destSheet) throw new Error(`Destination worksheet '${destinationSiteName}' not found. Please create it first.`);
  
  const destCache = SheetCacheManager.getCache(destSheet);
  const destMonthColumns = findMonthColumnsInCache(destCache, monthName);
  if (!destMonthColumns) throw new Error(`Could not find month columns in destination worksheet ${destinationSiteName}`);
  
  const empCode = getValueFromRow(row, headers, CONFIG.COLUMN_HEADERS.EMPLOYEE_CODE);
  const destRowIndex = destCache.employeeMap.has(empCode) ? destCache.employeeMap.get(empCode) : -1;
  
  if (destRowIndex === -1) {
    addNewEmployeeRowInCache(destCache, row, headers, destMonthColumns, destinationSiteName, '', formConfig);
    const newRowIndex = destCache.writeValues.length - 1;
    addTransferNotesInCache(destCache, newRowIndex, row, headers, destMonthColumns, sourceSiteName);
  } else {
    updateMonthDataInCache(destCache, destRowIndex, row, headers, destMonthColumns, sourceSiteName);
  }
}

/**
 * Add starting transfer notes for newly created employees in cache
 */
function addTransferNotesInCache(cache, rowIndex, row, headers, monthColumns, sourceSiteName) {
  const presentDays = Number(getValueFromRow(row, headers, CONFIG.COLUMN_HEADERS.PRESENT)) || 0;
  const leaveDays = Number(getValueFromRow(row, headers, CONFIG.COLUMN_HEADERS.LEAVE_DAYS)) || 0;
  const incomingPresent = presentDays + leaveDays;
  const incomingBasic = Number(getValueFromRow(row, headers, CONFIG.COLUMN_HEADERS.EARN_BASIC)) || 0;
  const incomingBonus = Math.round(incomingBasic * CONFIG.BONUS_PERCENTAGE / 100);
  
  cache.notes[rowIndex][monthColumns.presentCol] = `${sourceSiteName} PRESENT: ${incomingPresent}`;
  cache.notes[rowIndex][monthColumns.basicCol] = `${sourceSiteName} EARN BASIC: ${incomingBasic}`;
  cache.notes[rowIndex][monthColumns.bonusCol] = `${sourceSiteName} BONUS: ${incomingBonus}`;
}

/**
 * Batch formatting logic in cache
 */
function applyRemarksFormattingInCache(cache) {
  const remarksColIndex = cache.headers.findIndex(h => String(h).toLowerCase().includes('remarks'));
  if (remarksColIndex === -1) return;
  
  for (let r = cache.headerRowIndex + 1; r < cache.readValues.length; r++) {
    const remarksValue = String(cache.readValues[r][remarksColIndex]).trim().toLowerCase();
    if (!remarksValue) continue;
    
    if (remarksValue.includes('no due paid') || remarksValue.includes('left')) {
      cache.backgrounds[r].fill(CONFIG.COLORS.RED);
    } else if (remarksValue.includes('transferred to')) {
      cache.backgrounds[r].fill(CONFIG.COLORS.ORANGE);
    }
  }
}

/**
 * Standard Helper: Calculate Financial Year Document
 */
function getBonusFinancialYearName(month, year) {
  let fyStartYear, fyEndYear;
  if (month >= 3) { fyStartYear = year; fyEndYear = year + 1; }
  else { fyStartYear = year - 1; fyEndYear = year; }
  return { documentName: `SANSU AQUATEK Bonus Sheet ${fyStartYear}-${String(fyEndYear).slice(-2)}`, monthName: `${CONFIG.MONTH_NAMES[month]}-${String(year).slice(-2)}` };
}

/**
 * Standard Helper: Get or Create Sheet via APIs (Only happens once per physical sheet)
 */
function getOrCreateBonusSheet(targetFolderID, documentName, worksheetName, templateID) {
  const folder = DriveApp.getFolderById(targetFolderID);
  let spreadsheet = null;
  let isNewDocument = false;

  const files = folder.getFilesByName(documentName);
  if (files.hasNext()) {
    spreadsheet = SpreadsheetApp.openById(files.next().getId());
  } else {
    spreadsheet = SpreadsheetApp.openById(DriveApp.getFileById(templateID).makeCopy(documentName, folder).getId());
    isNewDocument = true;
  }

  let sheet = spreadsheet.getSheetByName(worksheetName);
  if (sheet) return { spreadsheet, sheet };

  if (isNewDocument) {
    sheet = spreadsheet.getSheets()[0];
    sheet.setName(worksheetName);
  } else {
    sheet = copyWorksheetFromTemplate(spreadsheet, templateID, worksheetName);
  }
  return { spreadsheet, sheet };
}

/**
 * Standard Helper: Copy Template
 */
function copyWorksheetFromTemplate(spreadsheet, templateID, worksheetName) {
  return SpreadsheetApp.openById(templateID).getSheets()[0].copyTo(spreadsheet).setName(worksheetName);
}

/**
 * Standard Helper: Extract mapping values based on Form Config
 */
function generateBonusRowData(row, headers, formConfig, serialNumber, siteName) {
  const columns = formConfig.columns;
  const rowData = [];
  
  columns.forEach((colConfig, index) => {
    if (index === 0 || colConfig === CONFIG.COLUMN_HEADERS.SR_NO) rowData.push(serialNumber);
    else if (typeof colConfig === 'string') rowData.push(getValueFromRow(row, headers, colConfig) || '');
    else if (colConfig && colConfig.type === 'empty' && colConfig.hasOwnProperty('value')) rowData.push(colConfig.value || siteName);
    else rowData.push('');
  });
  
  return rowData;
}

/**
 * Standard Helper: Extract destination string
 */
function extractDestinationSite(remarks) {
  const match = remarks.match(/transferred\s+to\s+(.+)/i);
  return (match && match[1]) ? match[1].trim() : null;
}

/**
 * Standard Helper: Get Column Value
 */
function getValueFromRow(row, headers, columnName) {
  const index = headers.indexOf(columnName);
  if (index === -1) return '';
  const value = row[index];
  return (value === null || value === undefined || value === '') ? '' : value;
}

/**
 * Standard Helper: Find Index in Array
 */
function getColumnIndexInRowData(columns, columnName) {
  for (let i = 0; i < columns.length; i++) if (typeof columns[i] === 'string' && columns[i] === columnName) return i;
  return -1;
}
