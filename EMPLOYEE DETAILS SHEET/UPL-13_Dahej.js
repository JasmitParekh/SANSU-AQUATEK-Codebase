function upl13Dahej() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert('UPL-13', 'WOULD YOU LIKE TO UPDATE ATTENDANCE SALARY SHEET OF UPL-13?', ui.ButtonSet.OK_CANCEL);
  if (response !== ui.Button.OK) return; // Immediately exit if they click Cancel or the 'X'
  const startTime = Date.now();

  const siteName = 'UPL - 13, DAHEJ';
  const attendanceSalarySlipId = '1pCp29ARWxIzyFkkhW6JKolQkDOhiLmoHIuvdilPaibQ';
  const columns = [
    'Employee Code', 
    'Name', 
    'Name As Per Aadhar',
    'Father\'s/Husband\'s Name',
    'Designation', 
    'Sex', 
    'Aadhar Number',
    'UAN', 
    'ESIC IP',
    'Date of Birth',
    'Date of Joining',
    { source: 'SALARY', target: 'New Net Salary' },
  ];

  updateAttendanceSalarySlip(attendanceSalarySlipId, siteName, columns);

  const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);
  ui.alert('EXECUTION COMPLETE', `CODE EXECUTION IS COMPLETED.\nTIME TAKEN: ${timeTaken} SECONDS.`, ui.ButtonSet.OK);
}
