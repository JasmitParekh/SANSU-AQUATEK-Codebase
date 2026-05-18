function generateGodrejValia_PlantFormsforForm18() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert('FORM-18', 'WOULD YOU LIKE TO UPDATE LEAVE AND WAGE SHEET?', ui.ButtonSet.OK_CANCEL);
  if (response !== ui.Button.OK) return; // Immediately exit if they click Cancel or the 'X'
  const startTime = Date.now();

  const plants = [
    { name: 'CPP', sheetName: 'CPP' },
    { name: 'B.B. - 3', sheetName: 'B.B. - 3' },
    { name: 'B.B. - 4', sheetName: 'B.B. - 4' },
    { name: 'RO/MEE', sheetName: 'RO/MEE' }
  ];

  // Generate forms for each plant
  plants.forEach(plant => {
    generateForm18ForGodrej(plant);
  });

  const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);
  ui.alert('EXECUTION COMPLETE', `CODE EXECUTION IS COMPLETED.\nTIME TAKEN: ${timeTaken} SECONDS.`, ui.ButtonSet.OK);
}

function generateForm18ForGodrej(plant) {
  const config = {
    // ── Source data ───────────────────────────────────────────────────────
    attendanceSlipId: '1sCC8PdAUxbxlvp6wiZECbjOA6s1ZTrEMmeTjhxxN97s',
    leaveWageSheetId: '1FNY4BbxkeYlZsMHuXWldKNPUEpgXDB2JVz5YEYE7BxM',

    // ── Site identification ───────────────────────────────────────────────
    siteFolderName: 'Godrej Valia',
    siteName:'Godrej',                 // Used in Form-18 filename: "Form-18 Viswaat - 2026"

    // ── Date control ──────────────────────────────────────────────────────
    dates: 0,                           // 0 = previous month, 1 = current month

    // ── Optional filters ──────────────────────────────────────────────────
    plantSheetName: plant.sheetName,               // e.g. 'Plant A' for multi-plant sites
    categoryFilter: null,               // e.g. 'Skilled' to filter by category

    // ── Form-18 generation ────────────────────────────────────────────────
    generateForm18:   false,             // Set false to skip Form-18 document generation
    form18FolderId:   '13cvIGHH1rWCed524XdINExvIbhweCm2z',
    form18TemplateId: '10YdxRJKDuHQK_Z7g5BOzO_hZHlu8-5D3KTRUancrEV8'
  };

  Documents.generateForm18(config);
}
