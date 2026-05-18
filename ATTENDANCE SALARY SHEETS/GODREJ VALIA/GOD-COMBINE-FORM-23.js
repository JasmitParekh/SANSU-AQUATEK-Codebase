/**
 * Combine plant-specific forms into single spreadsheets
 * Run this AFTER generating all forms
 * 
 * @param {number} dates - 0 for current month, 1 for previous month
 */
function combineGodrejValiaFormsforForm23(dates = 1) {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert('COMBINE SHEETS 23', 'WOULD YOU LIKE TO COMBINE SHEETS OF FORM-23', ui.ButtonSet.OK_CANCEL);
  if (response !== ui.Button.OK) return; // Immediately exit if they click Cancel or the 'X'
  const startTime = Date.now();

  // Get the folder ID based on dates parameter
  const folderId = getMonthFolderIdforForm23('Godrej Valia', dates);
  
  if (!folderId) {
    Logger.log('ERROR: Could not find target month folder');
    return;
  }

  const folderName = DriveApp.getFolderById(folderId).getName();
  Logger.log(`Working in folder: ${folderName}`);
  Logger.log(`Folder ID: ${folderId}\n`);
  
  // Combine Form-23
  combineForm23(folderId);
  
  Logger.log('\n✓ All forms combined successfully!');

  const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);
  ui.alert('EXECUTION COMPLETE', `CODE EXECUTION IS COMPLETED.\nTIME TAKEN: ${timeTaken} SECONDS.`, ui.ButtonSet.OK);
}

/**
 * Combine forms for CURRENT month (shortcut)
 */
function combineGodrejValia_CurrentMonthforForm23() {
  combineGodrejValiaFormsforForm23(0);
}

/**
 * Combine forms for PREVIOUS month (shortcut)
 */
function combineGodrejValia_PreviousMonthforForm23() {
  combineGodrejValiaFormsforForm23(1);
}

/**
 * Get month folder ID for a site with dates offset
 * @param {string} siteFolderName - Name of the site folder
 * @param {number} dates - 0 for current month, 1 for previous month
 */
function getMonthFolderIdforForm23(siteFolderName, dates = 0) {
  try {
    const rootFolderName = "SANSU AQUATEK";
    
    // Calculate target month
    const now = new Date();
    now.setMonth(now.getMonth() + (dates === 0 ? 0 : -1));
    
    const year = now.getFullYear();
    const month = now.toLocaleString('en-US', { month: 'long' });
    const shortYear = String(year).slice(-2);
    const monthFolderName = `${now.getMonth() + 1}. ${month}-${shortYear}`;

    Logger.log(`Looking for: ${rootFolderName} > ${siteFolderName} > ${year} > ${monthFolderName}`);

    // Navigate folder structure
    const rootFolders = DriveApp.getFoldersByName(rootFolderName);
    if (!rootFolders.hasNext()) {
      throw new Error(`Root folder '${rootFolderName}' not found`);
    }
    const rootFolder = rootFolders.next();

    const siteFolders = rootFolder.getFoldersByName(siteFolderName);
    if (!siteFolders.hasNext()) {
      throw new Error(`Site folder '${siteFolderName}' not found`);
    }
    const siteFolder = siteFolders.next();

    const yearFolders = siteFolder.getFoldersByName(String(year));
    if (!yearFolders.hasNext()) {
      throw new Error(`Year folder '${year}' not found`);
    }
    const yearFolder = yearFolders.next();

    const monthFolders = yearFolder.getFoldersByName(monthFolderName);
    if (!monthFolders.hasNext()) {
      throw new Error(`Month folder '${monthFolderName}' not found`);
    }
    const monthFolder = monthFolders.next();

    return monthFolder.getId();
  } catch (error) {
    Logger.log(`ERROR: ${error.message}`);
    return null;
  }
}

/**
 * Combine Form-23
 */
function combineForm23(folderId) {
  const config = {
    folderId: folderId,
    outputFileName: '10. Form-23: Overtime Register',
    sourceFileNames: [
      '10. Form-23 (CPP)',
      '10. Form-23 (B.B. - 3)',
      '10. Form-23 (B.B. - 4)',
      '10. Form-23 (RO/MEE)'
    ],
    worksheetNames: ['CPP', 'B.B. - 3', 'B.B. - 4', 'RO/MEE']
  };

  combineMultipleSheetsIntoOneforForm23(config);
}

/**
 * Core function: Combine multiple spreadsheets into one with multiple worksheets
 */
function combineMultipleSheetsIntoOneforForm23(config) {
  const { folderId, outputFileName, sourceFileNames, worksheetNames } = config;

  try {
    const folder = DriveApp.getFolderById(folderId);
    Logger.log(`\n--- Combining: ${outputFileName} ---`);

    // Check if output file already exists and delete it
    const existingFiles = folder.getFilesByName(outputFileName);
    while (existingFiles.hasNext()) {
      const file = existingFiles.next();
      Logger.log(`Deleting existing file: ${outputFileName}`);
      file.setTrashed(true);
    }

    // Create new combined spreadsheet
    const combinedSpreadsheet = SpreadsheetApp.create(outputFileName);
    const combinedId = combinedSpreadsheet.getId();
    
    // Set locale to India
    combinedSpreadsheet.setSpreadsheetLocale("en_IN");
    
    // Move to destination folder
    const combinedFile = DriveApp.getFileById(combinedId);
    combinedFile.moveTo(folder);
    Logger.log(`Created new spreadsheet: ${outputFileName}`);

    // Delete the default "Sheet1"
    const defaultSheet = combinedSpreadsheet.getSheets()[0];

    // Process each source file
    let sheetsAdded = 0;
    sourceFileNames.forEach((fileName, index) => {
      Logger.log(`Processing: ${fileName}`);
      
      try {
        // Find the source file in the folder
        const sourceFiles = folder.getFilesByName(fileName);
        
        if (!sourceFiles.hasNext()) {
          Logger.log(`WARNING: File "${fileName}" not found. Skipping.`);
          return;
        }

        const sourceFile = sourceFiles.next();
        const sourceSpreadsheet = SpreadsheetApp.openById(sourceFile.getId());
        const firstSheet = sourceSpreadsheet.getSheets()[0];

        // Copy the first sheet from source
        const copiedSheet = firstSheet.copyTo(combinedSpreadsheet);
        
        // Rename using custom worksheet name or source file name
        const newSheetName = worksheetNames && worksheetNames[index] 
          ? worksheetNames[index] 
          : fileName;
        
        copiedSheet.setName(newSheetName);
        
        Logger.log(`  ✓ Copied as worksheet: "${newSheetName}"`);
        sheetsAdded++;

        // Delete the source file after successful copy
        sourceFile.setTrashed(true);
        Logger.log(`  ✓ Deleted source file: "${fileName}"`);

      } catch (error) {
        Logger.log(`ERROR processing "${fileName}": ${error.message}`);
      }
    });

    // Delete the default sheet if we added any sheets
    if (sheetsAdded > 0) {
      combinedSpreadsheet.deleteSheet(defaultSheet);
      Logger.log(`Removed default sheet`);
    }

    Logger.log(`✓ Successfully combined ${sheetsAdded} worksheet(s) into "${outputFileName}"`);
    Logger.log(`File URL: ${combinedSpreadsheet.getUrl()}\n`);

  } catch (error) {
    Logger.log(`FATAL ERROR combining ${outputFileName}: ${error.message}`);
  }
}
