function generateForm14WithDepartmentsForGodrejKheda(){
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert('FORM-14: EMPLOYMENT CARDS', 'WOULD YOU LIKE TO GENERATE FORM-14 FOR DCM?', ui.ButtonSet.OK_CANCEL);
  if (response !== ui.Button.OK) return;
  const startTime = Date.now();

  const departments = SITE_CONFIG.departments_form14 || [null]; // This should match with the DEPARTMENT NAME column in EMPLOYEE DETAILS SHEET.
  
  departments.forEach(department => {
    generateEmploymentCardsForGodrejKheda(department)
  })

  const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);
  ui.alert('EXECUTION COMPLETE', `CODE EXECUTION IS COMPLETED.\nTIME TAKEN: ${timeTaken} SECONDS.`, ui.ButtonSet.OK);
}

function generateEmploymentCardsForGodrejKheda(departmentName) {
  const baseConfig = {
    // ── Source ──────────────────────────────────────────────────────────────
    sourceSheetId:  SITE_CONFIG.attendanceSalarySheetID, // Godrej Kheda Attendance Salary Sheet
    sourceTabName:  departmentName,                // null = first sheet

    // ── Template ────────────────────────────────────────────────────────────
    templateId:     SITE_CONFIG.form14TemplateID,          // Google Docs template

    // ── Output ──────────────────────────────────────────────────────────────
    outputMode:     'COMBINED',         // 'ONE_PER_ROW' | 'COMBINED',
    outputFileName: `3. Form-14: Employment Cards${departmentName ? ` (${departmentName})` : ''}`, // <<tags>> in filename

    siteFolderName: SITE_CONFIG.siteFolderName,  // uses standard month-folder hierarchy
    dates:          SITE_CONFIG.dates,                    // 0 = previous month

    // ── Filtering ───────────────────────────────────────────────────────────
    rowFilter:      null,                 // null = all rows
  };

  Documents.generateMailMerge(baseConfig);
}
