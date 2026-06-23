function generateForm14WithDepartmentsForDCM(){
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert('FORM-14: EMPLOYMENT CARDS', 'WOULD YOU LIKE TO GENERATE FORM-14 FOR DCM?', ui.ButtonSet.OK_CANCEL);
  if (response !== ui.Button.OK) return;
  const startTime = Date.now();

  const departments = SITE_CONFIG.departments_form14 || [null]; // This should match with the DEPARTMENT NAME column in EMPLOYEE DETAILS SHEET.
  
  departments.forEach(department => {
    generateEmploymentCardsForDCM(department)
  })

  const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);
  ui.alert('EXECUTION COMPLETE', `CODE EXECUTION IS COMPLETED.\nTIME TAKEN: ${timeTaken} SECONDS.`, ui.ButtonSet.OK);
}

function generateEmploymentCardsForDCM(departmentName) {
  const baseConfig = {
    // ── Source ──────────────────────────────────────────────────────────────
    sourceSheetId: SITE_CONFIG.attendanceSalarySheetID,
    sourceTabName: departmentName,                     // Provide the department name for which the forms are to be generated.,

    // ── Template ────────────────────────────────────────────────────────────
    templateId: SITE_CONFIG.form14TemplateID,

    // ── Output ──────────────────────────────────────────────────────────────
    outputMode:     'COMBINED',                       // 'ONE_PER_ROW' | 'COMBINED',
    outputFileName: `3. Form-14: Employment Cards${departmentName ? ` (${departmentName})` : ''}`,           // <<tags>> in filename works as well for 'ONE_PER_ROW'

    siteFolderName: SITE_CONFIG.siteFolderName,
    dates: SITE_CONFIG.dates,

    // ── Filtering ───────────────────────────────────────────────────────────
    rowFilter:      null,                 // null = all rows
  };

  Documents.generateMailMerge(baseConfig);
}
