function viswaat() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert('VISWAAT', 'WOULD YOU LIKE TO UPDATE ATTENDANCE SALARY SHEET OF VISWAAT?', ui.ButtonSet.OK_CANCEL);
  if (response !== ui.Button.OK) return; // Immediately exit if they click Cancel or the 'X'
  const startTime = Date.now();

  const siteName = 'VISWAAT CHEMICALS';
  const attendanceSalarySlipId = '1NCLi8kCk7fgYpYopl3th63ckv752sdePassD4xaTccg';
  const columns = [
    'Employee Code',
    'Name',
    'Name As Per Aadhar',
    "Father's/Husband's Name",
    'Designation',
    'Sex',
    'UAN',
    'ESIC IP',
    'Aadhar Number',
    'Date of Birth',
    'Date of Joining',
    { source: 'SALARY', target: 'New Net Salary' },
  ];
 
  updateAttendanceSalarySlip(attendanceSalarySlipId, siteName, columns);

  const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);
  ui.alert('EXECUTION COMPLETE', `CODE EXECUTION IS COMPLETED.\nTIME TAKEN: ${timeTaken} SECONDS.`, ui.ButtonSet.OK);
}
