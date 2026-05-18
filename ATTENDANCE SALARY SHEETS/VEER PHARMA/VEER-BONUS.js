function generateBonusForVeerPharma() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert('BONUS', 'WOULD YOU LIKE TO RUN BONUS SCRIPT?', ui.ButtonSet.OK_CANCEL);
  if (response !== ui.Button.OK) return; // Immediately exit if they click Cancel or the 'X'
  const startTime = Date.now();

  const config1 = {
    templateID: '1WYQNmyx_kYGBggFAWvCkJZmn9jLyremyLAPVo5c_PXQ',
    targetFolderID: '1H_jz4Ajxd4CFgCSfU0NjLJDvVbGuRktz',
    attendanceSlipID: '1S5pk9upu9hXJNgXIladecZxCJ5vLhIyVsMBZ0eUOx90',

    siteFolderName: 'Veer Pharma',
    dates: 0, // Date control: 0 = previous month, 1 = current month

    formConfig: {
      columns: [
        'Sl. No.',
        'Employee Code',
        'Name',
        {
          type: 'empty',
          value: 'Veer Pharma'
        },
        'Remarks'
      ]
    }
  };
  Documents.generateBonusDocument(config1);

  const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);
  ui.alert('EXECUTION COMPLETE', `CODE EXECUTION IS COMPLETED.\nTIME TAKEN: ${timeTaken} SECONDS.`, ui.ButtonSet.OK);
}
