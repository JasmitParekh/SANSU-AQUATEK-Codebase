// This is the script which is called upon by Calculate.js in each attendance salary sheet.
// This script is deployed as library project, and these library is imported by Google App Script of those sheets as "Allowances".
const CONFIG = {
  HEADERS: {
    HRA: 'Ideal HRA',
    CONVEYANCE: 'Ideal Conveyance Allowance',
    MEDICAL: 'Ideal Medical Allowance',
    TRANSPORTATION: 'Ideal Transportation Allowance',
    EDUCATION: 'Ideal Education Allowance', 
    FOOD: 'Ideal Food Allowance',
    SITE: 'Ideal Site Allowance',
    WASH: 'Ideal Wash Allowance',
    IDEAL_NET: 'Ideal Net Salary',
    NEW_NET: 'New Net Salary',
    BASIC: 'Basic Wages',
  }
};

function findHeaderInfo(sheet, headersToFind) {
  const data = sheet.getDataRange().getValues();
  const colMap = {};
  let headerRow = -1;

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    for (let j = 0; j < row.length; j++) {
      const headerText = typeof row[j] === 'string' ? row[j].trim() : '';
      if (headersToFind.includes(headerText)) {
        colMap[headerText] = j + 1;
        if (headerRow === -1) {
          headerRow = i + 1;
        }
      }
    }
    if (headerRow !== -1 && headerRow === i + 1) {
      break;
    }
  }
  if (headerRow === -1) {
    return null;
  }
  return {
    headerRow: headerRow,
    colMap: colMap
  }
}

function getTrueLastRow(sheet, column, startRow) {
  const values = sheet.getRange(startRow, column, sheet.getMaxRows() - startRow + 1).getValues();
  for (let i = 0; i < values.length; i++) {
    if (values[i][0] === '' || values[i][0] === null) {
      return startRow + i - 1;
    }
  }
  return sheet.getMaxRows();
}

function fillAllowanceWithCorrection(sheet, startRow, numRows, allowanceCol, caps, targetNets, idealNetCol) {
  const MAX_ROUNDS = 5; // Maximum correction rounds
  
  for (let round = 0; round < MAX_ROUNDS; round++) {
    // Read current ideal net values for all rows
    SpreadsheetApp.flush();
    Utilities.sleep(800); // One sleep per round instead of per row
    
    const idealNets = sheet.getRange(startRow, idealNetCol, numRows).getValues().map(r => Number(r[0]) || 0);
    const currentAllowances = sheet.getRange(startRow, allowanceCol, numRows).getValues().map(r => Number(r[0]) || 0);
    
    // Calculate corrections needed for each row
    const updates = [];
    let anyChanges = false;
    
    for (let i = 0; i < numRows; i++) {
      const diff = targetNets[i] - idealNets[i];
      
      if (diff > 0) {
        // Ideal Net is LESS than target - need to INCREASE allowance
        const newValue = Math.min(caps[i], currentAllowances[i] + diff);
        
        if (newValue !== currentAllowances[i]) {
          anyChanges = true;
          updates.push([newValue]);
        } else {
          updates.push([currentAllowances[i]]); // No change, keep current
        }
      } else if (diff < 0) {
        // Ideal Net is MORE than target - need to DECREASE allowance
        const reduction = Math.abs(diff);
        const newValue = Math.max(0, currentAllowances[i] - reduction);
        
        if (newValue !== currentAllowances[i]) {
          anyChanges = true;
          updates.push([newValue]);
        } else {
          updates.push([currentAllowances[i]]); // No change, keep current
        }
      } else {
        // Perfect match - no change needed
        updates.push([currentAllowances[i]]);
      }
    }
    
    // Write all updates at once
    if (anyChanges) {
      sheet.getRange(startRow, allowanceCol, numRows).setValues(updates);
    } else {
      // No changes needed, we're done
      break;
    }
  }
  
  // Final flush
  SpreadsheetApp.flush();
  Utilities.sleep(500);
}

function calculateAllowancesStepwise(ss, sheet, ui) {
  const allHeaders = Object.values(CONFIG.HEADERS);
  const headerInfo = findHeaderInfo(sheet, allHeaders);
  
  if (!headerInfo) {
    ui.alert('Error: Could not find any headers.');
    return;
  }
  
  const { headerRow, colMap } = headerInfo;
  
  const criticalHeaders = [CONFIG.HEADERS.BASIC, CONFIG.HEADERS.IDEAL_NET, CONFIG.HEADERS.NEW_NET];
  const missingCritical = criticalHeaders.filter(h => !colMap[h]);
  
  if (missingCritical.length > 0) {
    ui.alert('Error: Missing required headers: ' + missingCritical.join(', '));
    return;
  }
  
  const startRow = headerRow + 1;
  const lastRow = getTrueLastRow(sheet, colMap[CONFIG.HEADERS.BASIC], startRow);
  const numRows = lastRow - startRow + 1;
  
  if (numRows <= 0) {
    ui.alert('No data found below the header row.');
    return;
  }

  // Read all basic and target net values once
  const basicValues = sheet.getRange(startRow, colMap[CONFIG.HEADERS.BASIC], numRows)
    .getValues().map(r => Number(r[0]) || 0);
  const targetNets = sheet.getRange(startRow, colMap[CONFIG.HEADERS.NEW_NET], numRows)
    .getValues().map(r => Number(r[0]) || 0);

  // Define allowance priority order with caps
  const allowanceOrder = [
    { header: CONFIG.HEADERS.HRA, capPercent: 0.4 },
    { header: CONFIG.HEADERS.CONVEYANCE, capPercent: 0.2 },
    { header: CONFIG.HEADERS.MEDICAL, capPercent: 0.1 },
    { header: CONFIG.HEADERS.TRANSPORTATION, capPercent: 0.1 },
    { header: CONFIG.HEADERS.EDUCATION, capPercent: 0.1 },
    { header: CONFIG.HEADERS.FOOD, capPercent: 0.1 },
    { header: CONFIG.HEADERS.SITE, capPercent: null },
    { header: CONFIG.HEADERS.WASH, capPercent: null },
  ].filter(a => colMap[a.header]);

  // Reset all allowances to 0 in batch
  allowanceOrder.forEach(a => {
    const zeros = Array(numRows).fill([0]);
    sheet.getRange(startRow, colMap[a.header], numRows).setValues(zeros);
  });
  SpreadsheetApp.flush();
  Utilities.sleep(1000);

  // Process each allowance type for all rows
  for (let a of allowanceOrder) {
    // Calculate caps for all rows
    const caps = basicValues.map(basic => 
      a.capPercent ? Math.round(basic * a.capPercent) : 999999
    );
    
    // Fill this allowance for all rows with iterative correction
    fillAllowanceWithCorrection(
      sheet,
      startRow,
      numRows,
      colMap[a.header],
      caps,
      targetNets,
      colMap[CONFIG.HEADERS.IDEAL_NET]
    );
    
    // Check if any rows still need more allowances
    SpreadsheetApp.flush();
    const idealNets = sheet.getRange(startRow, colMap[CONFIG.HEADERS.IDEAL_NET], numRows)
      .getValues().map(r => Number(r[0]) || 0);
    
    const allDone = idealNets.every((idealNet, i) => Math.abs(targetNets[i] - idealNet) <= 0);
    
    if (allDone) {
      break; // All rows are satisfied, no need to process remaining allowances
    }
  }

  ui.alert('✅ Allowances calculated successfully!');
}
