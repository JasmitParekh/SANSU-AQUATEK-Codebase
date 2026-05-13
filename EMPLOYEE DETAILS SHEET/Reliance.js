function reliance() {
    const ui = SpreadsheetApp.getUi();
  const response = ui.alert('RELIANCE', 'WOULD YOU LIKE TO UPDATE ATTENDANCE SALARY SHEET OF RELIANCE?', ui.ButtonSet.OK_CANCEL);
  if (response !== ui.Button.OK) return; // Immediately exit if they click Cancel or the 'X'
  const startTime = Date.now();

  const siteName = 'RELIANCE INDUSTRIES - SILVASSA';
  const attendanceSalarySlipId = '1RI001ATE6HR52Szqbz447_Zm4Yg8bsm9zqP9VzkNaAg';
  const columns = [
    'Employee Code', 
    'Name',
    'Name As Per Aadhar',
    'Father\'s/Husband\'s Name',
    'Designation',
    'Category Address (HS/S/SS/US)',
    'Sex', 
    'Aadhar Number',
    'UAN', 
    'ESIC IP',
    'Bank Account Number',
    'Bank Name',
    'Date of Birth',
    'Date of Joining',
    { source: 'SALARY', target: 'New Net Salary' },
  ];

  updateAttendanceSalarySlip(attendanceSalarySlipId, siteName, columns);

  const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);
  ui.alert('EXECUTION COMPLETE', `CODE EXECUTION IS COMPLETED.\nTIME TAKEN: ${timeTaken} SECONDS.`, ui.ButtonSet.OK);
}
