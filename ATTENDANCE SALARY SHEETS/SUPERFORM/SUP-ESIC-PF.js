function generateESICPFForSUPERFORM() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert('ESIC & PF', 'WOULD YOU LIKE TO UPDATE ESIC & PF DOCUMENT?', ui.ButtonSet.OK_CANCEL);
  if (response !== ui.Button.OK) return; // Immediately exit if they click Cancel or the 'X'
  const startTime = Date.now();

  const config = {
    templateId: '1k1Gxh7EgmYT4QMImFC2wbEAXo2o0Nn3gdMPiNxhLEz4',
    targetFolderId: '12MXsKMMfaZ32YGa093WSNvf3JdgiLIzD',

    attendanceSlipId: '1YUPqqNNeq3mFLP7V0zNOsEwwavCNQocWbjBZsF888_M',
    siteFolderName: 'SUPERFORM',

    dates: 0, // Date control: 0 = previous month, 1 = current month

    formConfig: {
      columns: [
        'Sl. No.',                           // Auto-generated serial number
        'Name as Per Aadhar',
        {
          type: 'empty',
          value: 'SUPERFORM'
        },
        'UAN',
        'ESIC',
        'Aadhar No.',
        'DOB',
        'DOJ',
        "Father's/Husband's Name",
        { 
          type: 'sum', 
          columns: ['Present Days', 'PL/CL/SL'] 
        },
        'O.T. Pay',
        'Earned Basic Wages',
        'HRA',
        'Gross',
        'PT',
        'PF 12%',
        {
          type: 'formula',
          header: 'PF 3.67%',
          formula: '=MIN(({GROSS}-{HRA}-{OT AMOUNT})*3.67%,550)'
        },
        {
          type: 'formula',
          header: 'FPF 8.33%',
          formula: '=MIN(({GROSS}-{HRA}-{OT AMOUNT})*8.33%,1250)'
        },
        'ESIC 0.75%',
        'Remarks'                            // Will trigger gray background if contains "NEW"
      ]
    }
  };

  // Call the library function
  Documents.generateESICPFDocument(config);

  const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);
  ui.alert('EXECUTION COMPLETE', `CODE EXECUTION IS COMPLETED.\nTIME TAKEN: ${timeTaken} SECONDS.`, ui.ButtonSet.OK);
}
