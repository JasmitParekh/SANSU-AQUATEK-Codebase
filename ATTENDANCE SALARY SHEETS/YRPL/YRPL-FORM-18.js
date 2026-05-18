function generateForm18ForYRPL() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert('FORM-18', 'WOULD YOU LIKE TO GENERATE FORM-18?', ui.ButtonSet.OK_CANCEL);
  if (response !== ui.Button.OK) return; // Immediately exit if they click Cancel or the 'X'
  const startTime = Date.now();

  const baseConfig = {
    attendanceSlipId: '1idVteb5gGED-o3wl7EINSsSrcXGS9RN9vKKYH1NcwCY',
    leaveWageSheetId: '1FNY4BbxkeYlZsMHuXWldKNPUEpgXDB2JVz5YEYE7BxM',
    siteFolderName:   'YASHASHVI RASAYAN',
    siteName:         'YRPL',
    dates:            0,       // 0 = previous month, 1 = current month
    plantSheetName:   null,
    generateForm18:   true,
    form18FolderId:   '1u5K95ZIR0Dd4M9hPJJsio35rRAcFvgRj',
    form18TemplateId: '10YdxRJKDuHQK_Z7g5BOzO_hZHlu8-5D3KTRUancrEV8'
  };

  //generateForm18WithCategoryFilter(baseConfig, 'Skilled');
  generateForm18WithCategoryFilter(baseConfig, 'Unskilled');

  const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);
  ui.alert('EXECUTION COMPLETE', `CODE EXECUTION IS COMPLETED.\nTIME TAKEN: ${timeTaken} SECONDS.`, ui.ButtonSet.OK);
}

/**
 * Helper function to generate Form-18 with category filtering
 * siteName is automatically suffixed with the category name
 */
function generateForm18WithCategoryFilter(baseConfig, category) {
  const config = Object.assign({}, baseConfig);
  config.categoryFilter = category;
  config.siteName = `${baseConfig.siteName} ${category}`; // → "Viswaat Skilled", "Viswaat Unskilled"

  Documents.generateForm18(config);
}
