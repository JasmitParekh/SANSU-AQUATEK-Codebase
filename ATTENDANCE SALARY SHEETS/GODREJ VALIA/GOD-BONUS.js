function generateGodrejValia_PlantFormsforBonus() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert('BONUS', 'WOULD YOU LIKE TO RUN BONUS SCRIPT?', ui.ButtonSet.OK_CANCEL);
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
    generateBonusForGodrej(plant);
  });

  const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);
  ui.alert('EXECUTION COMPLETE', `CODE EXECUTION IS COMPLETED.\nTIME TAKEN: ${timeTaken} SECONDS.`, ui.ButtonSet.OK);
}

function generateBonusForGodrej(plant) {
  const config1 = {
    templateID: '1WYQNmyx_kYGBggFAWvCkJZmn9jLyremyLAPVo5c_PXQ',
    targetFolderID: '1H_jz4Ajxd4CFgCSfU0NjLJDvVbGuRktz',
    attendanceSlipID: '1sCC8PdAUxbxlvp6wiZECbjOA6s1ZTrEMmeTjhxxN97s',

    siteFolderName: 'Godrej Valia',
    plantSheetName: plant.sheetName,
    dates: 0, // Date control: 0 = previous month, 1 = current month

    formConfig: {
      columns: [
        'Sl. No.',
        'Employee Code',
        'Name',
        {
          type: 'empty',
          value: `Godrej ${plant.sheetName}`
        },
        'Remarks'
      ]
    }
  };
  Documents.generateBonusDocument(config1);
}
