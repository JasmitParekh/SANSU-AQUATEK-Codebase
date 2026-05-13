// ============================================================================
// TIER 3: ADVANCED UTILITY FUNCTIONS (Use Tier 1 & 2)
// ============================================================================

/**
 * Extract template headers and map them to column letters
 * 
 * Creates a mapping object for easy column reference in formulas.
 * 
 * Example return:
 * {
 *   "Sr. No.": "A",
 *   "Name": "B",
 *   "Employee Code": "C"
 * }
 * 
 * @param {Sheet} sheet - Google Sheets object
 * @return {Object} Mapping of header names to column letters
 */
function extractTemplateHeaderMap(sheet) {
  const { headerRowIndex, headers } = findHeaderRow(sheet);
  
  const headerMap = {};
  headers.forEach((header, index) => {
    if (header && header !== '') {
      const columnLetter = getColumnLetter(index);
      headerMap[header] = columnLetter;
    }
  });
  
  return headerMap;
}

/**
 * Find first completely empty row after headers
 * 
 * Useful for determining where to start inserting new data.
 * 
 * @param {Sheet} sheet - Google Sheets object
 * @param {Object} templateHeaderMap - Optional, not used but kept for compatibility
 * @return {number} 1-indexed row number of first empty row
 */
function findFirstEmptyRow(sheet, templateHeaderMap) {
  const data = sheet.getDataRange().getValues();
  const { headerRowIndex } = findHeaderRow(sheet);
  
  // Start searching from row after header
  for (let r = headerRowIndex + 1; r < data.length; r++) {
    const row = data[r];
    const isCompletelyEmpty = row.every(cell => cell === '' || cell === null || cell === undefined);
    
    if (isCompletelyEmpty) {
      return r + 1; // Return 1-indexed row number
    }
  }
  
  // If no empty row found, return after last row
  return data.length + 1;
}
