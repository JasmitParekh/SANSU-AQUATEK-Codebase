function dcm() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert('DCM', 'WOULD YOU LIKE TO UPDATE ATTENDANCE SALARY SHEET OF DCM?', ui.ButtonSet.OK_CANCEL);
  if (response !== ui.Button.OK) return; // Immediately exit if they click Cancel or the 'X'
  const startTime = Date.now();

  const siteName = 'DCM';
  const attendanceSalarySlipId = '1Cv47Nq82FG2I3jExFqBZkRUvMHCGnTQbHaX8uhfUjV8';
  const columns = [
    'Employee Code', 
    'Name', 
    'Father\'s/Husband\'s Name',
    'Name As Per Aadhar',
    'Designation', 
    'Sex', 
    'Aadhar Number',
    'UAN', 
    'ESIC IP',
    'Category Address (HS/S/SS/US)',
    'Date of Birth',
    'Date of Joining',
    { source: 'SALARY', target: 'New Net Salary' },
  ];

  updateAttendanceSalarySlip(attendanceSalarySlipId, siteName, columns);

  const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);
  ui.alert('EXECUTION COMPLETE', `CODE EXECUTION IS COMPLETED.\nTIME TAKEN: ${timeTaken} SECONDS.`, ui.ButtonSet.OK);
}
