function generateForm18WithDepartmentsForGodrejKheda(){
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert('FORM-18', 'WOULD YOU LIKE TO UPDATE FORM-18?', ui.ButtonSet.OK_CANCEL);
  if (response !== ui.Button.OK) return;
  const startTime = Date.now();

  const departments = SITE_CONFIG.departments_form18 || [null]; // This should match with the DEPARTMENT NAME column in EMPLOYEE DETAILS SHEET.
  
  departments.forEach(department => {
    generateForm18ForGodrejKheda(department)
  })

  const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);
  ui.alert('EXECUTION COMPLETE', `CODE EXECUTION IS COMPLETED.\nTIME TAKEN: ${timeTaken} SECONDS.`, ui.ButtonSet.OK);
}

function generateForm18ForGodrejKheda(departmentName) {
  const baseConfig = {
    // ── Source data ───────────────────────────────────────────────────────
    attendanceSlipId: SITE_CONFIG.attendanceSalarySheetID,
    leaveWageSheetId: SITE_CONFIG.leaveWageSheetID,

    // ── Site identification ───────────────────────────────────────────────
    siteFolderName: SITE_CONFIG.siteFolderName,
    siteName: SITE_CONFIG.siteName,                           // Used in Form-18 filename: "Form-18 Viswaat - 2026"

    // ── Date control ──────────────────────────────────────────────────────
    dates: SITE_CONFIG.dates,                                 // 0 = previous month, 1 = current month

    // ── Optional filters ──────────────────────────────────────────────────
    plantSheetName: departmentName,                           // e.g. 'Plant A' for multi-plant sites
   
    // ── Form-18 generation ────────────────────────────────────────────────
    generateForm18:   SITE_CONFIG.generateForm18,             // Set false to skip Form-18 document generation
    form18FolderId:   SITE_CONFIG.form18FolderID,
    form18TemplateId: SITE_CONFIG.form18TemplateID
  };

  const categories = SITE_CONFIG.categories_form18 || [null];      // Provide the categories for which the forms are to be generated.
  categories.forEach(category => {                                 // This should match with the category column in EMPLOYEE DETAILS SHEET.
    generateForm18WithCategoryFilterForGodrejKheda(baseConfig, category);
  })  
}

function generateForm18WithCategoryFilterForGodrejKheda(baseConfig, category){
    const config = JSON.parse(JSON.stringify(baseConfig));
    config.categoryFilter = category;
    Documents.generateForm18(config);                          // Call the Documents library
}
