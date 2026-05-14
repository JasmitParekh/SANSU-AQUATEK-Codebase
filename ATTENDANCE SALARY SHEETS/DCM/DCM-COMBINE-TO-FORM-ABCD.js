/**
 * Combine Google Sheets with automatic folder detection
 * @param {number} dates - 0 for current month, 1 for previous month
 */
function combineGoogleSheets(dates = 1) {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert('COMBINE SHEETS', 'WOULD YOU LIKE TO COMBINE FORM-A,B,C,D?', ui.ButtonSet.OK_CANCEL);
  if (response !== ui.Button.OK) return; // Immediately exit if they click Cancel or the 'X'
  const startTime = Date.now();

  // Get the folder ID automatically based on dates parameter
  const folderId = getMonthFolderId('DCM', dates);
  
  if (!folderId) {
    Logger.log('ERROR: Could not find target month folder');
    return;
  }

  const folderName = DriveApp.getFolderById(folderId).getName();
  Logger.log(`Working in folder: ${folderName}`);
  Logger.log(`Folder ID: ${folderId}\n`);

  const config = {
    folderId: folderId,
    outputFileName: '1. Form-ABCD',
    sourceFileNames: [
      '1. Form-A',
      '2. Form-B: Wage Register',
      '3. Form-C: Register of Loan/Recoveries',
      '4. Form-D: Attendance Register'
    ]
  };

  combineSheetsFromFolder(config);

  const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);
  ui.alert('EXECUTION COMPLETE', `CODE EXECUTION IS COMPLETED.\nTIME TAKEN: ${timeTaken} SECONDS.`, ui.ButtonSet.OK);
}

/**
 * Combine sheets for CURRENT month (shortcut)
 */
function combineGoogleSheets_CurrentMonth() {
  combineGoogleSheets(0);
}

/**
 * Combine sheets for PREVIOUS month (shortcut)
 */
function combineGoogleSheets_PreviousMonth() {
  combineGoogleSheets(1);
}

/**
 * Get month folder ID with dates offset
 * @param {string} siteFolderName - Name of the site folder
 * @param {number} dates - 0 for current month, 1 for previous month
 */
function getMonthFolderId(siteFolderName, dates = 0) {
  try {
    const rootFolderName = "SANSU AQUATEK"; // Change this to your root folder name
    
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

function combineSheetsFromFolder(config) {
  const { folderId, outputFileName, sourceFileNames } = config;

  try {
    // Get the folder
    const folder = DriveApp.getFolderById(folderId);
    Logger.log(`Working in folder: ${folder.getName()}`);

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
    
    // Move to destination folder
    const combinedFile = DriveApp.getFileById(combinedId);
    combinedFile.moveTo(folder);
    Logger.log(`Created new spreadsheet: ${outputFileName}`);

    // Delete the default "Sheet1" that comes with new spreadsheets
    const defaultSheet = combinedSpreadsheet.getSheets()[0];

    // Process each source file
    let sheetsAdded = 0;
    sourceFileNames.forEach((fileName, index) => {
      Logger.log(`\nProcessing: ${fileName}`);
      
      try {
        // Find the source file in the folder
        const sourceFiles = folder.getFilesByName(fileName);
        
        if (!sourceFiles.hasNext()) {
          Logger.log(`WARNING: File "${fileName}" not found in folder. Skipping.`);
          return;
        }

        const sourceFile = sourceFiles.next();
        const sourceSpreadsheet = SpreadsheetApp.openById(sourceFile.getId());
        const sourceSheets = sourceSpreadsheet.getSheets();

        Logger.log(`Found ${sourceSheets.length} worksheet(s) in "${fileName}"`);

        // Copy all sheets from source to combined spreadsheet
        sourceSheets.forEach((sheet, sheetIndex) => {
          const sheetName = sheet.getName();
          
          // Create a unique name for the worksheet in combined file
          // Format: "Form-A - SheetName" or just "Form-A" if only one sheet
          let newSheetName;
          if (sourceSheets.length === 1) {
            // If source has only one sheet, use the file name
            newSheetName = fileName;
          } else {
            // If source has multiple sheets, append sheet name
            newSheetName = `${fileName} - ${sheetName}`;
          }

          // Copy the sheet
          const copiedSheet = sheet.copyTo(combinedSpreadsheet);
          copiedSheet.setName(newSheetName);
          
          Logger.log(`  ✓ Copied sheet: "${sheetName}" as "${newSheetName}"`);
          sheetsAdded++;
        });

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
      Logger.log(`\nRemoved default sheet`);
    }

    Logger.log(`\n✓ Successfully combined ${sheetsAdded} worksheet(s) into "${outputFileName}"`);
    Logger.log(`File ID: ${combinedId}`);
    Logger.log(`File URL: ${combinedSpreadsheet.getUrl()}`);

    // Return the URL for easy access
    return combinedSpreadsheet.getUrl();

  } catch (error) {
    Logger.log(`FATAL ERROR: ${error.message}`);
    throw error;
  }
}

function combineSheetsFirstSheetOnly(dates = 0) {
  // Get the folder ID automatically based on dates parameter
  const folderId = getMonthFolderId('DCM', dates);
  
  if (!folderId) {
    Logger.log('ERROR: Could not find target month folder');
    return;
  }

  const folderName = DriveApp.getFolderById(folderId).getName();
  Logger.log(`Working in folder: ${folderName}`);
  Logger.log(`Folder ID: ${folderId}\n`);

  const config = {
    folderId: folderId,
    outputFileName: '1. Form-ABCD',
    sourceFileNames: [
      '1. Form-A',
      '0. Form-B: Wage Register',
      '0. Form-C: Register of Loan/Recoveries',
      '0. Form-D: Attendance Register'
    ],
    firstSheetOnly: true
  };

  combineSheetsFromFolderFirstSheetOnly(config);
}

/**
 * Combine first sheet only for CURRENT month (shortcut)
 */
function combineSheetsFirstSheetOnly_CurrentMonth() {
  combineSheetsFirstSheetOnly(0);
}

/**
 * Combine first sheet only for PREVIOUS month (shortcut)
 */
function combineSheetsFirstSheetOnly_PreviousMonth() {
  combineSheetsFirstSheetOnly(1);
}

function combineSheetsFromFolderFirstSheetOnly(config) {
  const { folderId, outputFileName, sourceFileNames } = config;

  try {
    const folder = DriveApp.getFolderById(folderId);
    Logger.log(`Working in folder: ${folder.getName()}`);

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
    
    const combinedFile = DriveApp.getFileById(combinedId);
    combinedFile.moveTo(folder);
    Logger.log(`Created new spreadsheet: ${outputFileName}`);

    const defaultSheet = combinedSpreadsheet.getSheets()[0];
    let sheetsAdded = 0;

    // Process each source file
    sourceFileNames.forEach((fileName) => {
      Logger.log(`\nProcessing: ${fileName}`);
      
      try {
        const sourceFiles = folder.getFilesByName(fileName);
        
        if (!sourceFiles.hasNext()) {
          Logger.log(`WARNING: File "${fileName}" not found. Skipping.`);
          return;
        }

        const sourceFile = sourceFiles.next();
        const sourceSpreadsheet = SpreadsheetApp.openById(sourceFile.getId());
        const firstSheet = sourceSpreadsheet.getSheets()[0];

        // Copy only the first sheet
        const copiedSheet = firstSheet.copyTo(combinedSpreadsheet);
        copiedSheet.setName(fileName);
        
        Logger.log(`  ✓ Copied first sheet as: "${fileName}"`);
        sheetsAdded++;

        // Delete the source file after successful copy
        sourceFile.setTrashed(true);
        Logger.log(`  ✓ Deleted source file: "${fileName}"`);

      } catch (error) {
        Logger.log(`ERROR processing "${fileName}": ${error.message}`);
      }
    });

    // Delete the default sheet
    if (sheetsAdded > 0) {
      combinedSpreadsheet.deleteSheet(defaultSheet);
    }

    Logger.log(`\n✓ Successfully combined ${sheetsAdded} worksheet(s) into "${outputFileName}"`);
    Logger.log(`File URL: ${combinedSpreadsheet.getUrl()}`);

    return combinedSpreadsheet.getUrl();

  } catch (error) {
    Logger.log(`FATAL ERROR: ${error.message}`);
    throw error;
  }
}
