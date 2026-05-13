/**
 * Main function to generate/update ESIC and PF Document
 * This document is organized by Financial Year (April-March) with monthly worksheets
 * Multiple sites' data for the same month goes into the same worksheet
 */
function generateESICPFDocument(config) {
  const {
    templateId,
    targetFolderId,
    attendanceSlipId,
    siteFolderName,
    dates,
    formConfig,
    plantSheetName,
    categoryFilter
  } = config;

  if (!formConfig || !formConfig.columns || formConfig.columns.length === 0) {
    throw new Error('formConfig with columns is required');
  }

  // Get date info based on dates parameter
  const now = new Date();
  now.setMonth(now.getMonth() + (dates === 0 ? -1 : 0));
  const month = now.getMonth(); // 0-11
  const year = now.getFullYear();

  // Calculate Financial Year and document/worksheet names
  const { documentName, worksheetName } = getFinancialYearNames(month, year);

  Logger.log(`Target Document: ${documentName}`);
  Logger.log(`Target Worksheet: ${worksheetName}`);

  // Load source data from Attendance Slip
  const slipSS = SpreadsheetApp.openById(attendanceSlipId);
  
  let slipSheet;
  if (plantSheetName) {
    slipSheet = slipSS.getSheetByName(plantSheetName);
    if (!slipSheet) {
      throw new Error(`Worksheet '${plantSheetName}' not found in Attendance Slip`);
    }
  } else {
    slipSheet = slipSS.getSheets()[0];
  }

  const slipData = slipSheet.getDataRange().getValues();
  const slipFormulas = slipSheet.getDataRange().getFormulas();

  // Find header row and extract source headers
  const { headerRowIndex, headers } = SharedUtils.findHeaderRow(slipSheet);
  
  Logger.log("Source Headers: " + JSON.stringify(headers));
  
  let dataRows = slipData.slice(headerRowIndex + 1);
  let dataFormulas = slipFormulas.slice(headerRowIndex + 1);

  // Apply category filter if specified
  if (categoryFilter) {
    const categoryIndex = headers.indexOf('Category');
    if (categoryIndex === -1) {
      Logger.log('Warning: Category column not found in attendance slip');
    } else {
      const filteredIndices = [];
      dataRows.forEach((row, i) => {
        const categoryValue = String(row[categoryIndex]).trim();
        if (categoryValue.toLowerCase() === categoryFilter.toLowerCase()) {
          filteredIndices.push(i);
        }
      });
      dataRows = filteredIndices.map(i => dataRows[i]);
      dataFormulas = filteredIndices.map(i => dataFormulas[i]);
    }
  }

  // Get or create the ESIC PF document and worksheet
  const { spreadsheet, sheet, lastSerialNumber } = getOrCreateESICPFSheet(
    targetFolderId,
    documentName,
    worksheetName,
    templateId
  );

  Logger.log(`Last Serial Number in sheet: ${lastSerialNumber}`);

  // Extract template headers for data generation
  const templateHeaderMap = SharedUtils.extractTemplateHeaderMap(sheet);
  
  Logger.log("Template Headers: " + JSON.stringify(templateHeaderMap));

  // Find the row where we'll start inserting data
  const firstEmptyRow = lastSerialNumber === 0 
    ? SharedUtils.findFirstEmptyRow(sheet, templateHeaderMap)
    : sheet.getLastRow() + 1;

  Logger.log(`Starting data insertion at row: ${firstEmptyRow}`);

  // Generate data rows with serial number continuation
  const output = generateDynamicFormData(
    dataRows,
    dataFormulas,
    headers,
    formConfig,
    templateHeaderMap,
    firstEmptyRow,
    lastSerialNumber // Pass starting serial number for continuation
  );

  // Write data to sheet
  if (output.length > 0) {
    const range = sheet.getRange(firstEmptyRow, 1, output.length, output[0].length);
    range.setValues(output);
    range.setBorder(true, true, true, true, true, true, 'black', SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
    range.setHorizontalAlignment('center').setVerticalAlignment('middle').setWrap(true);

    // Apply gray background for rows with "NEW" in Remarks
    applyNewRemarksFormatting(sheet, dataRows, headers, firstEmptyRow, output.length, formConfig.columns);

    Logger.log(`Successfully inserted ${output.length} rows starting from row ${firstEmptyRow}`);
  } else {
    Logger.log('No data to insert');
  }

  SpreadsheetApp.flush();
  Logger.log(`ESIC PF Document updated successfully: ${documentName} - ${worksheetName}`);
}

/**
 * Calculate Financial Year document name and worksheet name
 * Financial Year: April to March
 * Example: Jan 2026 -> FY 2025-26 (Apr 2025 to Mar 2026)
 *          Apr 2026 -> FY 2026-27 (Apr 2026 to Mar 2027)
 */
function getFinancialYearNames(month, year) {
  // Month is 0-indexed (0=Jan, 3=Apr, 11=Dec)
  const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 
                      'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  
  let fyStartYear, fyEndYear;
  
  if (month >= 3) { // April (3) onwards
    fyStartYear = year;
    fyEndYear = year + 1;
  } else { // Jan-Mar
    fyStartYear = year - 1;
    fyEndYear = year;
  }

  const documentName = `ESIC AND PF DOCUMENT ${fyStartYear}-${String(fyEndYear).slice(-2)}`;
  const worksheetName = `${monthNames[month]}-${String(year).slice(-2)}`;

  return { documentName, worksheetName };
}

/**
 * Get or create ESIC PF spreadsheet and worksheet
 * Returns: { spreadsheet, sheet, lastSerialNumber }
 */
function getOrCreateESICPFSheet(folderId, documentName, worksheetName, templateId) {
  const folder = DriveApp.getFolderById(folderId);
  
  // Search for existing document
  let spreadsheet = null;
  let isNewDocument = false;
  const files = folder.getFilesByName(documentName);
  
  if (files.hasNext()) {
    // Document exists
    const file = files.next();
    spreadsheet = SpreadsheetApp.openById(file.getId());
    Logger.log(`Found existing document: ${documentName}`);
  } else {
    // Create document from template
    const templateFile = DriveApp.getFileById(templateId);
    const newFile = templateFile.makeCopy(documentName, folder);
    spreadsheet = SpreadsheetApp.openById(newFile.getId());
    isNewDocument = true;
    Logger.log(`Created new document from template: ${documentName}`);
  }

  // Search for worksheet
  let sheet = spreadsheet.getSheetByName(worksheetName);
  
  if (sheet) {
    // Worksheet exists - find last serial number
    Logger.log(`Found existing worksheet: ${worksheetName}`);
    const lastSerialNumber = findLastSerialNumber(sheet);
    return { spreadsheet, sheet, lastSerialNumber };
  } else {
    // Need to create new worksheet
    Logger.log(`Creating new worksheet: ${worksheetName}`);
    
    if (isNewDocument) {
      // This is a new document - rename Sheet1 to the worksheet name
      const defaultSheet = spreadsheet.getSheets()[0];
      defaultSheet.setName(worksheetName);
      sheet = defaultSheet;
      Logger.log(`Renamed default sheet to: ${worksheetName}`);
    } else {
      // Document already exists - copy from TEMPLATE, not from existing sheets
      sheet = copySheetFromTemplate(spreadsheet, templateId, worksheetName);
      Logger.log(`Created new worksheet by copying from template: ${worksheetName}`);
    }
    
    return { spreadsheet, sheet, lastSerialNumber: 0 };
  }
}

/**
 * Copy template sheet into existing document
 * This ensures we always get clean formatting without any data from other months
 */
function copySheetFromTemplate(targetSpreadsheet, templateId, newSheetName) {
  // Open template spreadsheet
  const templateSS = SpreadsheetApp.openById(templateId);
  const templateSheet = templateSS.getSheets()[0];
  
  // Copy template sheet to target spreadsheet
  const newSheet = templateSheet.copyTo(targetSpreadsheet);
  newSheet.setName(newSheetName);
  
  // Find header row to know where data starts
  const { headerRowIndex } = SharedUtils.findHeaderRow(newSheet);
  
  // Clear all data rows (keep headers)
  const lastRow = newSheet.getLastRow();
  const lastCol = newSheet.getLastColumn();
  
  if (lastRow > headerRowIndex + 1) {
    // There are data rows to clear
    const dataRowCount = lastRow - (headerRowIndex + 1);
    const clearRange = newSheet.getRange(headerRowIndex + 2, 1, dataRowCount, lastCol);
    clearRange.clearContent();
  }
  
  Logger.log(`Copied fresh template sheet with clean formatting`);
  
  return newSheet;
}

/**
 * Find the last serial number in the sheet
 * Returns 0 if no data exists
 */
function findLastSerialNumber(sheet) {
  try {
    const { headerRowIndex, headers } = SharedUtils.findHeaderRow(sheet);
    
    // Find Sl. No. or Sr. No. column
    let slNoIndex = -1;
    for (let i = 0; i < headers.length; i++) {
      const header = String(headers[i]).trim();
      if (header === 'Sl. No.' || header === 'Sr. No.') {
        slNoIndex = i;
        break;
      }
    }
    
    if (slNoIndex === -1) {
      Logger.log('Warning: Sl. No. column not found');
      return 0;
    }
    
    // Get all data in Sl. No. column
    const lastRow = sheet.getLastRow();
    if (lastRow <= headerRowIndex) {
      return 0;
    }
    
    const slNoRange = sheet.getRange(headerRowIndex + 2, slNoIndex + 1, lastRow - headerRowIndex - 1, 1);
    const values = slNoRange.getValues();
    
    // Find last non-empty numeric value
    let lastSerialNumber = 0;
    for (let i = values.length - 1; i >= 0; i--) {
      const value = values[i][0];
      if (value !== '' && !isNaN(value) && Number(value) > 0) {
        lastSerialNumber = Number(value);
        break;
      }
    }
    
    return lastSerialNumber;
  } catch (error) {
    Logger.log(`Error finding last serial number: ${error.message}`);
    return 0;
  }
}

/**
 * Apply gray background to rows where Remarks contains "NEW" (case-insensitive)
 */
function applyNewRemarksFormatting(sheet, dataRows, sourceHeaders, firstDataRow, numRows, columns) {
  // Find Remarks column index in source data
  const remarksSourceIndex = sourceHeaders.indexOf('Remarks');
  if (remarksSourceIndex === -1) {
    Logger.log('Remarks column not found in source data - skipping NEW formatting');
    return;
  }

  // Find Remarks column index in output columns
  let remarksOutputIndex = -1;
  for (let i = 0; i < columns.length; i++) {
    const col = columns[i];
    if (typeof col === 'string' && col === 'Remarks') {
      remarksOutputIndex = i;
      break;
    }
  }

  if (remarksOutputIndex === -1) {
    Logger.log('Remarks column not found in output columns - skipping NEW formatting');
    return;
  }

  // Check each row and apply gray background if Remarks contains "NEW"
  let formattedCount = 0;
  for (let i = 0; i < dataRows.length && i < numRows; i++) {
    const remarksValue = String(dataRows[i][remarksSourceIndex] || '').trim();
    if (remarksValue.toLowerCase().includes('new')) {
      const rowRange = sheet.getRange(firstDataRow + i, 1, 1, columns.length);
      rowRange.setBackground('#CCCCCC'); // Gray background
      formattedCount++;
    }
  }

  if (formattedCount > 0) {
    Logger.log(`Applied gray background to ${formattedCount} rows with "NEW" in Remarks`);
  }
}
