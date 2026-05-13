function calculateAllowances() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();
  const ui = SpreadsheetApp.getUi();

  Allowances.calculateAllowancesStepwise(ss, sheet, ui); // This Script can be found in My Drive > SANSU ESSENTIALS > Calculate Allowances.
}
