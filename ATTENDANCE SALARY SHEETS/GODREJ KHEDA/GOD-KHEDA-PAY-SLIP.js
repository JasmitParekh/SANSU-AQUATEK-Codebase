function generatePaySlipWithDepartmentsForGodrejKheda(){
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert('PAYMENT SLIPS', 'WOULD YOU LIKE TO GENERATE PAYMENT SLIPS FOR DCM?', ui.ButtonSet.OK_CANCEL);
  if (response !== ui.Button.OK) return;
  const startTime = Date.now();

  const departments = SITE_CONFIG.departments_payment || [null]; // This should match with the DEPARTMENT NAME column in EMPLOYEE DETAILS SHEET.
  
  departments.forEach(department => {
    generatePaymentRecieptsForGodrejKheda(department)
  })

  const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);
  ui.alert('EXECUTION COMPLETE', `CODE EXECUTION IS COMPLETED.\nTIME TAKEN: ${timeTaken} SECONDS.`, ui.ButtonSet.OK);
}

function generatePaymentRecieptsForGodrejKheda(departmentName) {
  const baseConfig = {
    // ── Source ──────────────────────────────────────────────────────────────
    sourceSheetId:  SITE_CONFIG.attendanceSalarySheetID, // GODREJ KHEDA Attendance Salary Sheet
    sourceTabName:  departmentName,                      // null = first sheet

    // ── Template ────────────────────────────────────────────────────────────
    templateId:     SITE_CONFIG.paySlipTemplateID,          // Google Docs template

    // ── Output ──────────────────────────────────────────────────────────────
    outputMode:     'COMBINED',         // 'ONE_PER_ROW' | 'COMBINED',
    outputFileName: 'Payment Slips', // <<tags>> in filename

    siteFolderName: SITE_CONFIG.siteFolderName,  // uses standard month-folder hierarchy
    dates:          SITE_CONFIG.dates,                    // 0 = previous month

    // ── Filtering ───────────────────────────────────────────────────────────
    rowFilter:      null,                 // null = all rows

    // ── Tag Resolution ───────────────────────────────────────────────────
     tagMap: {
      '<<Month>>': 'Date on which Overtime Worked'
    }
  };

  Documents.generateMailMerge(baseConfig);
}
