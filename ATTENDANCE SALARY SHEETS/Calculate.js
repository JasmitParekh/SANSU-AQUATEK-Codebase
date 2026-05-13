// This is a common script used in every single Attandance Salary Sheet.
// Hence, it is kept outisde in this folder instead of keeping it in every single folder of ATTENDANCE SALARY SHEETS.
function calculateAllowances() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();
  const ui = SpreadsheetApp.getUi();

  Allowances.calculateAllowancesStepwise(ss, sheet, ui); // This Script can be found in My Drive > SANSU ESSENTIALS > Calculate Allowances.
}
