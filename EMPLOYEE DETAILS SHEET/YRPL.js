function yrpl() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert('YRPL', 'WOULD YOU LIKE TO UPDATE ATTENDANCE SALARY SHEET OF YRPL?', ui.ButtonSet.OK_CANCEL);
  if (response !== ui.Button.OK) return; // Immediately exit if they click Cancel or the 'X'
  const startTime = Date.now();

  const siteName = 'YASHASHVI RASAYAN PVT. LTD.';
  const attendanceSalarySlipId = '1idVteb5gGED-o3wl7EINSsSrcXGS9RN9vKKYH1NcwCY';
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
    'CATEGORY',
    'Date of Birth',
    'Date of Joining',
    { source: 'SALARY', target: 'New Net Salary' },
  ];

  updateAttendanceSalarySlip(attendanceSalarySlipId, siteName, columns);

  const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);
  ui.alert('EXECUTION COMPLETE', `CODE EXECUTION IS COMPLETED.\nTIME TAKEN: ${timeTaken} SECONDS.`, ui.ButtonSet.OK);
}
