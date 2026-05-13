// For Godrej B.B - 3
function godrejBB3() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert('GODREJ B.B.-3', 'WOULD YOU LIKE TO UPDATE ATTENDANCE SALARY SHEET OF GODREJ B.B.-3?', ui.ButtonSet.OK_CANCEL);
  if (response !== ui.Button.OK) return; // Immediately exit if they click Cancel or the 'X'
  const startTime = Date.now();

  const siteName = 'GODREJ INDUSTRIES - VALIA';
  const departmentName = 'B.B. - 3';
  const attendanceSalarySlipId = '1sCC8PdAUxbxlvp6wiZECbjOA6s1ZTrEMmeTjhxxN97s';
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

  updateAttendanceSalarySlip(attendanceSalarySlipId, siteName, columns, departmentName);

  const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);
  ui.alert('EXECUTION COMPLETE', `CODE EXECUTION IS COMPLETED.\nTIME TAKEN: ${timeTaken} SECONDS.`, ui.ButtonSet.OK);
}
