function generateBonusForGodrejKheda() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert('BONUS', 'WOULD YOU LIKE TO RUN BONUS SCRIPT?', ui.ButtonSet.OK_CANCEL);
  if (response !== ui.Button.OK) return; // Immediately exit if they click Cancel or the 'X'
  const startTime = Date.now();

  const config1 = {
    templateID: SITE_CONFIG.bonusTemplateID,
    targetFolderID: SITE_CONFIG.bonusTargetFolderID,
    attendanceSlipID: SITE_CONFIG.attendanceSalarySheetID,

    siteFolderName: SITE_CONFIG.siteFolderName,
    dates: SITE_CONFIG.dates, // Date control: 0 = previous month, 1 = current month

    formConfig: {
      columns: [
        'Sl. No.',
        'Employee Code',
        'Name',
        {
          type: 'empty',
          value: SITE_CONFIG.siteFolderName
        },
        'Remarks'
      ]
    }
  };
  Documents.generateBonusDocument(config1);

  const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);
  ui.alert('EXECUTION COMPLETE', `CODE EXECUTION IS COMPLETED.\nTIME TAKEN: ${timeTaken} SECONDS.`, ui.ButtonSet.OK);
}
