// ============================================================================
// TIER 1: PURE UTILITY FUNCTIONS (No Dependencies)
// ============================================================================

/**
 * Convert column index to Excel letter notation
 * 
 * Examples:
 *   0 -> 'A'
 *   1 -> 'B'
 *   25 -> 'Z'
 *   26 -> 'AA'
 *   27 -> 'AB'
 * 
 * @param {number} index - Zero-based column index
 * @return {string} Column letter(s)
 */
function getColumnLetter(index) {
  let letter = '';
  let num = index;
  
  while (num >= 0) {
    letter = String.fromCharCode(65 + (num % 26)) + letter;
    num = Math.floor(num / 26) - 1;
  }
  
  return letter;
}

/**
 * Get existing folder or create new one
 * 
 * @param {Folder} parentFolder - Parent Google Drive folder
 * @param {string} folderName - Name of folder to get/create
 * @return {Folder} The folder object
 */
function getOrCreateFolder(parentFolder, folderName) {
  const folders = parentFolder.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  return parentFolder.createFolder(folderName);
}
