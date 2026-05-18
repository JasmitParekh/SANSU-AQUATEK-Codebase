function generateForm18ForSUPERFORM() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert('FORM-18', 'WOULD YOU LIKE TO UPDATE LEAVE AND WAGE SHEET?', ui.ButtonSet.OK_CANCEL);
  if (response !== ui.Button.OK) return; // Immediately exit if they click Cancel or the 'X'
  const startTime = Date.now();

  const config = {
    // ── Source data ───────────────────────────────────────────────────────
    attendanceSlipId: '1YUPqqNNeq3mFLP7V0zNOsEwwavCNQocWbjBZsF888_M',
    leaveWageSheetId: '1FNY4BbxkeYlZsMHuXWldKNPUEpgXDB2JVz5YEYE7BxM',

    // ── Site identification ───────────────────────────────────────────────
    siteFolderName: 'SUPERFORM',
    siteName:'SUPERFORM',                 // Used in Form-18 filename: "Form-18 Viswaat - 2026"

    // ── Date control ──────────────────────────────────────────────────────
    dates: 0,                           // 0 = previous month, 1 = current month

    // ── Optional filters ──────────────────────────────────────────────────
    plantSheetName: null,               // e.g. 'Plant A' for multi-plant sites
    categoryFilter: null,               // e.g. 'Skilled' to filter by category

    // ── Form-18 generation ────────────────────────────────────────────────
    generateForm18:   false,             // Set false to skip Form-18 document generation
    form18FolderId:   '1BfI_C3UYi4bndoFtk1GU-8AF6dTwU448',
    form18TemplateId: '10YdxRJKDuHQK_Z7g5BOzO_hZHlu8-5D3KTRUancrEV8'
  };

  Documents.generateForm18(config);

  const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);
  ui.alert('EXECUTION COMPLETE', `CODE EXECUTION IS COMPLETED.\nTIME TAKEN: ${timeTaken} SECONDS.`, ui.ButtonSet.OK);
}
