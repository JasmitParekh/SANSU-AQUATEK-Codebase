function godrejKheda() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert('GODREJ-KHEDA', 'WOULD YOU LIKE TO UPDATE ATTENDANCE SALARY SHEET OF GODREJ-KHEDA?', ui.ButtonSet.OK_CANCEL);
  if (response !== ui.Button.OK) return; // Immediately exit if they click Cancel or the 'X'
  const startTime = Date.now();

  const siteName = 'GODREJ INDUSTRIES - KHEDA';
  const attendanceSalarySlipId = '1dNQZq398LFy76kzpWN4733zdtns9LjJoBgtq6Mt-FMU';
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
