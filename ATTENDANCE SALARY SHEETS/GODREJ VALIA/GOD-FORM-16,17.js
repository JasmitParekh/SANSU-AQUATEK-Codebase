function generateGodrejValia_PlantForms() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert('FORM-16,17', 'WOULD YOU LIKE TO GENERATE FORM-16,17?', ui.ButtonSet.OK_CANCEL);
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
    generateFormsForPlant(plant, attendanceSlipId, formatSpreadsheetId);
  });

  const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);
  ui.alert('EXECUTION COMPLETE', `CODE EXECUTION IS COMPLETED.\nTIME TAKEN: ${timeTaken} SECONDS.`, ui.ButtonSet.OK);
}

function generateFormsForPlant(plant, attendanceSlipId, formatSpreadsheetId) {
  const baseConfig = {
    formatSpreadsheetId: formatSpreadsheetId,
    attendanceSlipId: attendanceSlipId,
    siteFolderName: 'Godrej Valia',
    dates: 0,
    plantSheetName: plant.sheetName, // Select specific worksheet

    forms: [
      { 
        sheetName: 'Form-16_Format', 
        fileName: `5. Form-16: Attendance Register (${plant.name})`, 
        configKey: 'form16' 
      },
      { 
        sheetName: 'Form-17_Format', 
        fileName: `6. Form-17: Wages Register (${plant.name})`, 
        configKey: 'form17' 
      }
    ],
    
    formConfigs: {
      form16: {
        columns: [
          'Sl. No.',
          'Name',
          { type: 'empty' },
          ...["1", "2", "3", "4", "5", "6", "7", "8", "9", "10",
              "11", "12", "13", "14", "15", "16", "17", "18", "19", "20",
              "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31",],
          { 
            type: 'formula', 
            header: 'Summary No. of Days',
            formula: '=COUNTIF({1}:{31}, "P")+COUNTIF({1}:{31}, "PH")+COUNTIF({1}:{31}, "P/2")*0.5+COUNTIF({1}:{31}, "L")'
          },
          'Remarks',
          { type: 'empty' }
        ]
      },
      
      form17: {
        columns: [
          'Sl. No.',
          'Name',
          'Designation',
          { 
            type: 'sum', 
            columns: ['Present Days', 'PL/CL/SL'] 
          },
          'Daily rate of wages/Pieces Rate',
          {
            type: 'formula',
            header: 'Basic Wages',
            formula: '={No. of Days Worked}*{Daily rate of wages/Pieces Rate}'
          },
          {
            type: 'empty',
            value: '-'
          },
          'P.H.',
          {
            type: 'formula',
            header: 'Payments P.H.',
            formula: '={Daily rate of wages/Pieces Rate}*2*{P.H.}'
          },
          {
            type: 'formula',
            header: 'HRA',
            formula: '={Ideal HRA}*{No. of Days Worked}/26'
          },
          {
            type: 'formula',
            header: 'Conve.',
            formula: '={Ideal Conveyance Allowance}*{No. of Days Worked}/26'
          },
          {
            type: 'formula',
            header: 'Site Allowances',
            formula: '={Ideal Site Allowance}*{No. of Days Worked}/26'
          },
          'Wash Allowance',
          {
            type: 'formula',
            header: 'Total',
            formula: '={Basic Wages}+{Payments P.H.}+{HRA}+{Conve.}+{Site Allowances}+{Wash Allowances}'
          },
          {
            type: 'formula',
            header: 'PF',
            formula: '=MIN(({Basic Wages}+{Payments P.H.}+{Conve.}+{Site Allowances}+{Wash Allowances})*12%, 1800)'
          },
          {
            type: 'formula',
            header: 'Others (PT)',
            formula: '=IF({Total}>12000, 200, 0)'
          },
          'Advance',
          {
            type: 'formula',
            header: 'Net Payment',
            formula: '={Total}-{PF}-{Others (PT)}-{Advance}'
          },
          { type: 'empty' },
          'Initial of Contractor or his Representative'
        ]
      }
    }
  };

  // Generate the forms for this plant
  Documents.generateAttForms(baseConfig);
}
