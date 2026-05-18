function generateGodrejValia_PlantFormsforForm23() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert('FORM-23', 'WOULD YOU LIKE TO GENERATE FORM-23?', ui.ButtonSet.OK_CANCEL);
  if (response !== ui.Button.OK) return; // Immediately exit if they click Cancel or the 'X'
  const startTime = Date.now();

  const plants = [
    { name: 'CPP', sheetName: 'CPP' },
    { name: 'B.B. - 3', sheetName: 'B.B. - 3' },
    { name: 'B.B. - 4', sheetName: 'B.B. - 4' },
    { name: 'RO/MEE', sheetName: 'RO/MEE' }
  ];

  const attendanceSlipId = '1sCC8PdAUxbxlvp6wiZECbjOA6s1ZTrEMmeTjhxxN97s'; // UPDATE THIS!
  const formatSpreadsheetId = '1Fw-BFIe4qGO3qEyNhX2pNtnO35rJ4QHIJSuj10336RA';

  // Generate forms for each plant
  plants.forEach(plant => {
    generateFormsForPlantforForm23(plant, attendanceSlipId, formatSpreadsheetId);
  });
  
  const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);
  ui.alert('EXECUTION COMPLETE', `CODE EXECUTION IS COMPLETED.\nTIME TAKEN: ${timeTaken} SECONDS.`, ui.ButtonSet.OK);
}

function generateFormsForPlantforForm23(plant, attendanceSlipId, formatSpreadsheetId) {
  const baseConfig = {
    formatSpreadsheetId: formatSpreadsheetId,
    attendanceSlipId: attendanceSlipId,
    siteFolderName: 'Godrej Valia',
    dates: 0,
    plantSheetName: plant.sheetName, // Select specific worksheet

    forms: [
      { 
        sheetName: 'Form-23_Format', 
        fileName: `10. Form-23 (${plant.name})`, 
        configKey: 'form23' 
      }
    ],
    
    formConfigs: {

      form23: {
        filter: {
          column: 'O.T. Hours',
          condition: 'notEmpty'
        },
        columns: [
          'Sl. No.',
          'Name',
          'Employee Code',
          'Sex',
          'Designation',
          'Date on which Overtime Worked',
          'O.T. Hours',
          'Daily rate of wages/Pieces Rate',
          {
            type: 'formula',
            header: 'Overtime Rate of Wages/Hours',
            formula: '={Normal Rate of Wages/DAY}/8*2'
          },
          {
            type: 'formula',
            header: 'Overtime Earnings',
            formula: '={Total Overtime Worked or Production in case of Piece Rated (Hours)}*{Overtime Rate of Wages/Hours}'
          },
          'Date on which Overtime Wages Paid',
          'Remarks'
        ]
      }
    }
  };

  // Generate the forms for this plant
  Documents.generateAttForms(baseConfig);
}
