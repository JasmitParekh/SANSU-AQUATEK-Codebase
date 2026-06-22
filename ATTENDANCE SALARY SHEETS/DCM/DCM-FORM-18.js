function generateForm18ForDCM() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert('FORM-18', 'WOULD YOU LIKE TO UPDATE FORM-18?', ui.ButtonSet.OK_CANCEL);
  if (response !== ui.Button.OK) return;
  const startTime = Date.now();

  const config = {
    // ── Source data ───────────────────────────────────────────────────────
    attendanceSlipId: SITE_CONFIG.attendanceSalarySheetID,
    leaveWageSheetId: SITE_CONFIG.leaveWageSheetID,

    // ── Site identification ───────────────────────────────────────────────
    siteFolderName: SITE_CONFIG.siteFolderName,
    siteName: SITE_CONFIG.siteName,                                                 

    // ── Date control ──────────────────────────────────────────────────────
    dates: SITE_CONFIG.dates,                                                       

    // ── Optional filters ──────────────────────────────────────────────────
    plantSheetName: SITE_CONFIG.departmentName,
    categoryFilter: SITE_CONFIG.categoryFilter,                                     

    // ── Form-18 generation ────────────────────────────────────────────────
    generateForm18:   true,
    form18FolderId: SITE_CONFIG.form18FolderID,
    form18TemplateId: SITE_CONFIG.form18TemplateID
  };

  Documents.generateForm18(config);

  const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);
  ui.alert('EXECUTION COMPLETE', `CODE EXECUTION IS COMPLETED.\nTIME TAKEN: ${timeTaken} SECONDS.`, ui.ButtonSet.OK);
}
