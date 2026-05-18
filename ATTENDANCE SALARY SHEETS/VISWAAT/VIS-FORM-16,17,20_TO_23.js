function generateForms16to23() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert('FORM-16,17,20 TO 23', 'WOULD YOU LIKE TO GENERATE FORM-16,17,20 TO 23?', ui.ButtonSet.OK_CANCEL);
  if (response !== ui.Button.OK) return; // Immediately exit if they click Cancel or the 'X'
  const startTime = Date.now();

  const config = {
    formatSpreadsheetId: '1yBV5PfAS-ATntn27qQMHPFg7i3Xh5nJz_fOCHH1hu3I',
    attendanceSlipId: '1NCLi8kCk7fgYpYopl3th63ckv752sdePassD4xaTccg',
    siteFolderName: 'Viswaat Chemicals',
    dates: 0, // 0 for previous month, 1 for current month.

    // Define which forms to generate
    forms: [
      { sheetName: 'Form-16_Format', fileName: '5. Form-16: Attendance Register', configKey: 'form16' },
      { sheetName: 'Form-17_Format', fileName: '6. Form-17: Wages Register', configKey: 'form17' },
      { sheetName: 'Form-20_Format', fileName: '7. Form-20: Register of Damage and Loss', configKey: 'form20' },
      { sheetName: 'Form-21_Format', fileName: '8. Form-21: Register of Fines', configKey: 'form21' },
      { sheetName: 'Form-22_Format', fileName: '9. Form-22: Advance Register', configKey: 'form22' },
      { sheetName: 'Form-23_Format', fileName: '10. Form-23: Register of Overtime', configKey: 'form23' }
    ],
    
    formConfigs: {
      // Form-16: Attendance Register Configuration
      form16: {
        columns: [
          'Sl. No.',
          { type: 'empty' },
          'Name',
          'Sex',
          // Date columns (26-31, 1-25)
          ...["26", "27", "28", "29", "30", "31",
              "1", "2", "3", "4", "5", "6", "7", "8", "9", "10",
              "11", "12", "13", "14", "15", "16", "17", "18", "19", "20",
              "21", "22", "23", "24", "25"],
          { 
            type: 'formula',
            header: 'Summary No. of Days', 
            formula: '=COUNTIF({26}:{25}, "P")+COUNTIF({26}:{25}, "PH")+COUNTIF({26}:{25}, "P/2")*0.5+COUNTIF({26}:{25}, "L")'
          },
          'Remarks'
        ]
      },
      
      // Form-17: Wage Register Configuration
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
          'O.T. Hours',
          {
            type: 'formula',
            header: 'Payments Overtime',
            formula: '={Daily rate of wages/Pieces Rate}/8*2*{Overtime hours Worked}'
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
          {
            type: 'formula',
            header: 'Total',
            formula: '={Basic Wages}+{Payments Overtime}+{Payments P.H.}+{HRA}+{Conve.}+{Site Allowances}'
          },
          {
            type: 'formula',
            header: 'PF',
            formula: '=MIN(({Basic Wages}+{Payments P.H.}+{Conve.}+{Site Allowances}+{FINE})*12%, 1800)'
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
      },
      
      // Empty configs for forms that don't need data transfer
      form20: {},
      form21: {},
      form22: {},

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
