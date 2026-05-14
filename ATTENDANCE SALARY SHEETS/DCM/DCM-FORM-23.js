function generateForm23() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert('FORM-23', 'WOULD YOU LIKE TO GENERATE FORM-23?', ui.ButtonSet.OK_CANCEL);
  if (response !== ui.Button.OK) return; // Immediately exit if they click Cancel or the 'X'
  const startTime = Date.now();

  const config = {
    formatSpreadsheetId: '10FtLuNLa37c2a8PhOxeiKoaGkJbBccXPZDDFSDkUy_s',
    attendanceSlipId: '1Cv47Nq82FG2I3jExFqBZkRUvMHCGnTQbHaX8uhfUjV8',
    siteFolderName: 'DCM',
    dates: 0,

    // Define which forms to generate
    forms: [
      { sheetName: 'Form-23_Format', fileName: '10. Form-23: Register of Overtime', configKey: 'form23' }
    ],
    
    formConfigs: {

      // Form-23: Overtime Register Configuration
      form23: {
        filter: {
          column: 'O.T. Hours',
          condition: 'notEmpty'
        },
        columns: [
          'Sl. No.',
          'Name',
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

  // Call the library function
  Documents.generateAttForms(config);

  const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);
  ui.alert('EXECUTION COMPLETE', `CODE EXECUTION IS COMPLETED.\nTIME TAKEN: ${timeTaken} SECONDS.`, ui.ButtonSet.OK);
}
