function generateForm18WithDepartmentsForDCM(){
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert('FORM-18', 'WOULD YOU LIKE TO UPDATE FORM-18?', ui.ButtonSet.OK_CANCEL);
  if (response !== ui.Button.OK) return;
  const startTime = Date.now();

  const departments = SITE_CONFIG.departments_form18 || [null]; // This should match with the DEPARTMENT NAME column in EMPLOYEE DETAILS SHEET.
  
  departments.forEach(department => {
    generateForm18ForDCM(department)
  })

  const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);
  ui.alert('EXECUTION COMPLETE', `CODE EXECUTION IS COMPLETED.\nTIME TAKEN: ${timeTaken} SECONDS.`, ui.ButtonSet.OK);
}

function generateForm18ForDCM(departmentName) {
  const baseConfig = {
    // ── Source data ───────────────────────────────────────────────────────
    attendanceSlipId: SITE_CONFIG.attendanceSalarySheetID,
    leaveWageSheetId: SITE_CONFIG.leaveWageSheetID,

    // ── Site identification ───────────────────────────────────────────────
    siteFolderName: SITE_CONFIG.siteFolderName,
    siteName: SITE_CONFIG.siteName,                                                 

    // ── Date control ──────────────────────────────────────────────────────
    dates: SITE_CONFIG.dates,                                                       

    // ── Optional filters ──────────────────────────────────────────────────
    plantSheetName: departmentName,
    categoryFilter: SITE_CONFIG.categoryFilter,                                     

    // ── Form-18 generation ────────────────────────────────────────────────
    generateForm18:   SITE_CONFIG.generateForm18,
    form18FolderId: SITE_CONFIG.form18FolderID,
    form18TemplateId: SITE_CONFIG.form18TemplateID
  };

  const categories = SITE_CONFIG.categories_form18 || [null];      // Provide the categories for which the forms are to be generated.
  categories.forEach(category => {                                 // This should match with the category column in EMPLOYEE DETAILS SHEET.
    generateForm18WithCategoryFilterForDCM(baseConfig, category);
  })
}

function generateForm18WithCategoryFilterForDCM(baseConfig, category){
    const config = JSON.parse(JSON.stringify(baseConfig));
    config.categoryFilter = category;
    Documents.generateForm18(config);                          // Call the Documents library
}
