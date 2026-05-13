// ============================================================================
// EXPORTS (for library usage)
// ============================================================================

/**
 * Get the version of this library
 * @return {string} Version number
 */
function getVersion() {
  return '1.0.0';
}

/**
 * Get list of available functions in this library
 * @return {Array<string>} List of function names
 */
function getAvailableFunctions() {
  return [
    'getColumnLetter',
    'getOrCreateFolder',
    'extractHeadersWithMergedCells',
    'findHeaderRow',
    'extractTemplateHeaderMap',
    'findFirstEmptyRow',
    'getVersion',
    'getAvailableFunctions'
  ];
}
