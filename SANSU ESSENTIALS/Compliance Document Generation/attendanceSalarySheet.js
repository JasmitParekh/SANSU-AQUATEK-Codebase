function generateAttForms(config) {
  const {
    formatSpreadsheetId,
    attendanceSlipId,
    siteFolderName,
    dates,
    forms,
    formConfigs,
    subFolder,
    categoryFilter,
    plantSheetName
  } = config;

  const rootFolderName = "SANSU AQUATEK";

  // Get date info for folder structure
  const now = new Date();
  now.setMonth(now.getMonth() + (dates === 0 ? -1 : 0));
  const year = now.getFullYear();
  const month = now.toLocaleString('en-US', { month: 'long' });
  const shortYear = String(year).slice(-2);
  const monthFolderName = `${now.getMonth()+1}. ${month}-${shortYear}`;

  const destinationFolderId = createFolderStructure(
    rootFolderName,
    siteFolderName,
    year,
    monthFolderName,
    subFolder
  );

  // Load source data
  const formatSS = SpreadsheetApp.openById(formatSpreadsheetId);
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

  // Copy attendance slip
  const slipFile = DriveApp.getFileById(attendanceSlipId);
  slipFile.makeCopy("Attendance_Salary_Slip_Copy", DriveApp.getFolderById(destinationFolderId));

  // Find header row and extract source headers
  const { headerRowIndex, headers } = SharedUtils.findHeaderRow(slipSheet);
  
  // Log source headers
  Logger.log("Source Headers: " + JSON.stringify(headers));
  
  let dataRows = slipData.slice(headerRowIndex + 1);
  let dataFormulas = slipFormulas.slice(headerRowIndex + 1);

  if (categoryFilter) {
    const filtered = filterRowsByCategory(dataRows, dataFormulas, headers, categoryFilter);
    dataRows = filtered.dataRows;
    dataFormulas = filtered.dataFormulas;
  }

  const folder = DriveApp.getFolderById(destinationFolderId);

  // Generate each form dynamically
  forms.forEach(form => {
    generateSingleForm(
      form,
      formatSS,
      folder,
      dataRows,
      dataFormulas,
      headers,
      formConfigs
    );
  });
}

/**
 * Create folder structure: Root → Site → Year → Month
 */
function createFolderStructure(rootFolderName, siteFolderName, year, monthFolderName, subFolder) {
  const rootFolders = DriveApp.getFoldersByName(rootFolderName);
  if (!rootFolders.hasNext()) {
    throw new Error(`Root folder '${rootFolderName}' not found`);
  }
  const rootFolder = rootFolders.next();

  const siteFolder = SharedUtils.getOrCreateFolder(rootFolder, siteFolderName);
  const yearFolder = SharedUtils.getOrCreateFolder(siteFolder, String(year));
  const monthFolder = SharedUtils.getOrCreateFolder(yearFolder, monthFolderName);

  if (subFolder) {
    const finalFolder = SharedUtils.getOrCreateFolder(monthFolder, subFolder);
    return finalFolder.getId();
  }

  return monthFolder.getId();
}

/**
 * Filter data rows by category
 */
function filterRowsByCategory(dataRows, dataFormulas, headers, categoryFilter) {
  if (!categoryFilter) {
    return { dataRows, dataFormulas };
  }

  const categoryIndex = headers.indexOf('Category');
  if (categoryIndex === -1) {
    Logger.log('Warning: Category column not found in attendance slip');
    return { dataRows, dataFormulas };
  }

  const filteredIndices = [];
  dataRows.forEach((row, i) => {
    const categoryValue = String(row[categoryIndex]).trim();
    if (categoryValue.toLowerCase() === categoryFilter.toLowerCase()) {
      filteredIndices.push(i);
    }
  });

  return {
    dataRows: filteredIndices.map(i => dataRows[i]),
    dataFormulas: filteredIndices.map(i => dataFormulas[i])
  };
}

/**
 * Generate a single form
 */
function generateSingleForm(
  form,
  formatSS,
  folder,
  dataRows,
  dataFormulas,
  sourceHeaders,
  formConfigs
) {
  const tempSheet = formatSS.getSheetByName(form.sheetName);
  if (!tempSheet) {
    Logger.log(`Warning: Sheet '${form.sheetName}' not found in format spreadsheet. Skipping.`);
    return;
  }

  // Create new spreadsheet
  const newFile = SpreadsheetApp.create(form.fileName);
  const newId = newFile.getId();
  DriveApp.getFileById(newId).moveTo(folder);

  const newSS = SpreadsheetApp.openById(newId);
  const newSheet = newSS.getSheets()[0];
  newSheet.clear();
  tempSheet.copyTo(newSS);
  newSS.deleteSheet(newSheet);
  const formSheet = newSS.getSheets()[0];
  formSheet.setName(form.fileName);

  // Extract template headers with column mapping
  const templateHeaderMap = SharedUtils.extractTemplateHeaderMap(formSheet);
  
  // Log template headers
  Logger.log("Template Headers: " + JSON.stringify(templateHeaderMap));

  // Find first completely empty row after headers
  const firstEmptyRow = SharedUtils.findFirstEmptyRow(formSheet, templateHeaderMap);

  // Get the form configuration key from the form object
  const formConfigKey = form.configKey;
  const formConfig = formConfigs[formConfigKey];

  // Skip data population if no config provided or config is empty
  if (!formConfig || Object.keys(formConfig).length === 0) {
    Logger.log(`No configuration found for '${formConfigKey}'. Form created without data population.`);
    return;
  }

  // Generate form-specific data using configuration
  const output = generateDynamicFormData(
    dataRows,
    dataFormulas,
    sourceHeaders,
    formConfig,
    templateHeaderMap,
    firstEmptyRow
  );

  // Write data to sheet
  if (output.length > 0) {
    const range = formSheet.getRange(firstEmptyRow, 1, output.length, output[0].length);
    range.setValues(output);
    range.setBorder(true, true, true, true, true, true, 'black', SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
    range.setHorizontalAlignment('center').setVerticalAlignment('middle').setWrap(true);
  }
}

/**
 * Dynamic form data generator based on column configuration
 */
function generateDynamicFormData(dataRows, dataFormulas, sourceHeaders, formConfig, templateHeaderMap, firstEmptyRow, startingSerialNumber) {
  const { columns, filter } = formConfig;

  if (!columns || columns.length === 0) {
    return [];
  }

  // Default startingSerialNumber to 0 if not provided (maintains backward compatibility)
  const serialStart = startingSerialNumber || 0;

  // Apply filter if specified
  let filteredRows = dataRows;
  let filteredFormulas = dataFormulas;
  
  if (filter) {
    const indices = [];
    dataRows.forEach((row, i) => {
      if (evaluateFilter(row, sourceHeaders, filter)) {
        indices.push(i);
      }
    });
    filteredRows = indices.map(i => dataRows[i]);
    filteredFormulas = indices.map(i => dataFormulas[i]);
  }

  // Generate output based on column configuration
  return filteredRows.map((row, i) => {
    const currentRowNumber = firstEmptyRow + i;
    const currentSerialNumber = serialStart + i + 1; // Continue from last serial number
    
    return columns.map((colConfig, colIndex) => {
      // Handle Sl. No. specially with continuation
      if (colIndex === 0 || 
          (typeof colConfig === 'string' && (colConfig === 'Sl. No.' || colConfig === 'Sr. No.'))) {
        return currentSerialNumber;
      }
      
      return processColumnConfig(
        row, 
        filteredFormulas[i], 
        sourceHeaders, 
        colConfig, 
        templateHeaderMap, 
        currentRowNumber
      );
    });
  });
}

/**
 * Evaluate filter condition
 */
function evaluateFilter(row, headers, filter) {
  const { column, condition } = filter;
  const value = row[headers.indexOf(column)];
  
  switch (condition) {
    case 'notEmpty':
      return value !== null && value !== "" && Number(value) !== 0;
    case 'empty':
      return value === null || value === "" || Number(value) === 0;
    default:
      return true;
  }
}

/**
 * MODIFICATION FOR Attendance_Salary_Sheet.gs
 * 
 * Replace the existing processColumnConfig() function with this enhanced version
 * This adds support for { type: 'empty', value: 'X' } to insert custom values in empty columns
 */

/**
 * Process a single column configuration
 * ENHANCED: Now supports { type: 'empty', value: 'X' } to insert custom values
 */
function processColumnConfig(row, formulas, sourceHeaders, colConfig, templateHeaderMap, currentRowNumber) {
  // Handle different column types
  if (typeof colConfig === 'string') {
    // Simple column name
    return safeGet(row, formulas, colConfig, sourceHeaders);
  }
  
  if (colConfig.type === 'concat') {
    // Concatenate multiple columns
    return colConfig.columns
      .map(col => safeGet(row, formulas, col, sourceHeaders))
      .join(" ")
      .trim();
  }
  
  if (colConfig.type === 'sum') {
    // Sum multiple columns
    return colConfig.columns.reduce((sum, col) => {
      return sum + Number(row[sourceHeaders.indexOf(col)] || 0);
    }, 0);
  }
  
  if (colConfig.type === 'dateRange') {
    // Expand date range columns
    const dateValues = colConfig.dates.map(date => 
      safeGet(row, formulas, date, sourceHeaders)
    );
    return dateValues;
  }
  
  if (colConfig.type === 'calculated') {
    // Custom calculation
    return colConfig.calculate(row, sourceHeaders, formulas);
  }
  
  if (colConfig.type === 'empty') {
    // ENHANCED: Empty column with optional value
    // If value is specified, return that value
    // Otherwise return empty string (default behavior)
    if (colConfig.hasOwnProperty('value')) {
      return colConfig.value;
    }
    return '';
  }
  
  if (colConfig.type === 'formula') {
    // Generate formula with placeholder replacement
    return generateFormula(
      colConfig.formula,
      row,
      sourceHeaders,
      templateHeaderMap,
      currentRowNumber
    );
  }
  
  return '';
}

/**
 * Generate formula by replacing placeholders
 * Implements 3-case logic:
 * 1. Header in template -> use cell reference (e.g., C5)
 * 2. Header in source only -> use static value
 * 3. Header in neither -> use 0 and log warning
 */
function generateFormula(formulaTemplate, row, sourceHeaders, templateHeaderMap, currentRowNumber) {
  let formula = formulaTemplate;
  
  // Find all placeholders in format {HeaderName}
  const placeholderRegex = /\{([^}]+)\}/g;
  let match;
  
  while ((match = placeholderRegex.exec(formulaTemplate)) !== null) {
    const headerName = match[1];
    const placeholder = match[0]; // Full placeholder including {}
    
    let replacement;
    
    // Case 1: Header exists in template
    if (templateHeaderMap.hasOwnProperty(headerName)) {
      const columnLetter = templateHeaderMap[headerName];
      replacement = columnLetter + currentRowNumber;
    }
    // Case 2: Header exists in source only
    else if (sourceHeaders.indexOf(headerName) !== -1) {
      const idx = sourceHeaders.indexOf(headerName);
      const value = row[idx];
      
      if (typeof value === 'string') {
        replacement = `"${value.replace(/"/g, '""')}"`;
      } else if (value === null || value === undefined || value === '') {
        replacement = '0';
      } else {
        replacement = String(value);
      }
    }
    // Case 3: Header not found in either
    else {
      Logger.log(`Warning: Placeholder '{${headerName}}' not found in template or source. Using 0.`);
      replacement = '0';
    }
    
    // Replace this placeholder in formula
    formula = formula.replace(placeholder, replacement);
  }
  
  return formula;
}

/**
 * Safely get cell value or IMAGE formula
 */
function safeGet(row, formulas, colName, headers) {
  const idx = headers.indexOf(colName);
  if (idx === -1) return '';
  if (formulas && formulas[idx] && formulas[idx].startsWith('=IMAGE')) {
    return formulas[idx];
  }
  const value = row[idx];
  return (value === null || value === undefined || value === '') ? '' : value;
}
