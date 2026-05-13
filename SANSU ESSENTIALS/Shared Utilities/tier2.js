// ============================================================================
// TIER 2: HEADER DETECTION FUNCTIONS
// ============================================================================

/**
 * Extract headers handling merged cells
 * 
 * Logic:
 * - If found in single row: use that row as headers
 * - If found in merged cells (spanning multiple rows):
 *   - For merged cells: take value from first row
 *   - For non-merged cells: take value from second row
 * 
 * @param {Sheet} sheet - Google Sheets object
 * @param {number} headerRowIndex - Index of header row (0-based)
 * @param {number} numCols - Number of columns to process
 * @return {Array<string>} Array of header strings
 */
function extractHeadersWithMergedCells(sheet, headerRowIndex, numCols) {
  const headers = [];
  const data = sheet.getDataRange().getValues();
  
  // Check if next row exists and might be part of header structure
  const currentRow = data[headerRowIndex];
  const nextRow = headerRowIndex + 1 < data.length ? data[headerRowIndex + 1] : [];
  
  // Check if we have a two-row header structure by looking for merged cells
  let hasMergedHeaders = false;
  for (let c = 0; c < numCols; c++) {
    const range = sheet.getRange(headerRowIndex + 1, c + 1);
    const mergedRanges = range.getMergedRanges();
    if (mergedRanges.length > 0) {
      // Check if merge spans multiple rows
      const mergedRange = mergedRanges[0];
      if (mergedRange.getNumRows() > 1) {
        hasMergedHeaders = true;
        break;
      }
    }
  }
  
  // If no merged headers spanning rows, just use the current row
  if (!hasMergedHeaders) {
    return currentRow.map(h => String(h).trim());
  }
  
  // Handle two-row header structure with merged cells
  for (let c = 0; c < numCols; c++) {
    const range = sheet.getRange(headerRowIndex + 1, c + 1);
    const mergedRanges = range.getMergedRanges();
    
    let headerValue = '';
    
    // Check if this column is part of a merged cell spanning multiple rows
    if (mergedRanges.length > 0) {
      const mergedRange = mergedRanges[0];
      if (mergedRange.getNumRows() > 1) {
        // Merged cell spanning rows - take value from current row
        headerValue = String(currentRow[c]).trim();
      } else {
        // Not a multi-row merge - take value from next row
        if (nextRow.length > c) {
          headerValue = String(nextRow[c]).trim();
        }
      }
    } else {
      // Not merged at all - take value from next row
      if (nextRow.length > c) {
        headerValue = String(nextRow[c]).trim();
      }
    }
    
    // If still empty, fallback to current row
    if (headerValue === '') {
      headerValue = String(currentRow[c]).trim();
    }
    
    headers.push(headerValue);
  }
  
  return headers;
}

/**
 * Find header row in sheet
 * 
 * Searches for "Sl. No." or "Sr. No." to identify the header row.
 * Handles merged cells and complex header structures.
 * 
 * @param {Sheet} sheet - Google Sheets object
 * @return {Object} Object with { headerRowIndex: number, headers: Array<string> }
 * @throws {Error} If header row cannot be found
 */
function findHeaderRow(sheet) {
  const data = sheet.getDataRange().getValues();
  const numRows = data.length;
  const numCols = data[0].length;
  
  for (let r = 0; r < numRows; r++) {
    const row = data[r];
    
    // Check if this row contains "Sl. No." or "Sr. No."
    const hasSerialHeader = row.some(cell => {
      const cellStr = String(cell).trim();
      return cellStr === "Sl. No." || cellStr === "Sr. No.";
    });
    
    if (hasSerialHeader) {
      // Found the header row, now extract all headers including merged cells
      const headers = extractHeadersWithMergedCells(sheet, r, numCols);
      return {
        headerRowIndex: r,
        headers: headers
      };
    }
  }
  
  throw new Error("Could not locate header row with 'Sl. No.' or 'Sr. No.'");
}
