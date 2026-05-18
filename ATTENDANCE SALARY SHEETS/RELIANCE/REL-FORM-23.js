// Run this code after putting OT and generating Employment Cards, as well as Payment Slip.
function generateFormsFromAttendanceSlipforOT() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert('FORM-23', 'WOULD YOU LIKE TO GENERATE FORM-23?', ui.ButtonSet.OK_CANCEL);
  if (response !== ui.Button.OK) return; // Immediately exit if they click Cancel or the 'X'
  const startTime = Date.now();

  const config = {
    formatSpreadsheetId: '1bCGU3GQ-O3KdZEe04OW_iC0X28ENpfrnJo30nL9qcKE',
    attendanceSlipId: '1RI001ATE6HR52Szqbz447_Zm4Yg8bsm9zqP9VzkNaAg',
    siteFolderName: 'Reliance',
    dates: 0,

    forms: [
      // { sheetName: 'Datewise_OT_Register', fileName: '7. Datewise Overtime Register', configKey: 'dor' },
      { sheetName: 'Form-23_Format', fileName: '8. Form-23: Register of Overtime', configKey: 'form23' }
    ],
    
    formConfigs: {

      // dor: {
      //   columns: [
      //     'Sl. No.',
      //     'Name',
      //     { type: 'empty' },
      //     // Date columns (26-31, 1-25)
      //     ...["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26","27",  "28","29","30","31"],
      //     'O.T. Hours',
      //     'Remarks'
      //   ]
      // },

      form23: {
        filter: {
          column: 'O.T. Hours',
          condition: 'notEmpty'
        },
        columns: [
          'Sl. No.',
          'Name',
          'EP No',
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
            formula: '={Overtime Rate of Wages/Hours}*{Total Overtime Worked or Production in case of Piece Rated (Hours)}'
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
