function generateFormsFromAttendanceSlip() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert('FORM-SWS,16,17', 'WOULD YOU LIKE TO GENERATE FORM-SWS,16,17?', ui.ButtonSet.OK_CANCEL);
  if (response !== ui.Button.OK) return; // Immediately exit if they click Cancel or the 'X'
  const startTime = Date.now();

  const config = {
    formatSpreadsheetId: '1bCGU3GQ-O3KdZEe04OW_iC0X28ENpfrnJo30nL9qcKE',
    attendanceSlipId: '1RI001ATE6HR52Szqbz447_Zm4Yg8bsm9zqP9VzkNaAg',
    siteFolderName: 'Reliance',
    dates: 0,

    forms: [
      { sheetName: 'Standard_Wage_Sheet', fileName: '1. Standard Wage Sheet', configKey: 'sws' },
      { sheetName: 'Form-16_Format', fileName: '5. Form-16: Attendance Register', configKey: 'form16' },
      { sheetName: 'Form-17_Format', fileName: '6. Form-17: Wages Register', configKey: 'form17' }
    ],
    
    formConfigs: {

      sws:{
        columns: [
          'Sl. No.',
          'Name',
          'EP No',
          'UAN',
          'Department',
          'Designation',
          'Trade',
          'Category',
          'Bank Account Number',
          'Bank Name',
          'Work Order',
          'Work Order Details',
          'Basic Per Day',
          {
            type: 'empty',
            value: 0
          },
          'HRA Per Day',
          'Conveyance Per Day',
          'Site All Per Day',
          'Wash All Per Day',
          'P.H. Per Day',
          'Bonus Per Day',
          {
            type: 'empty',
            value: 0
          },
          {
            type: 'formula',
            header: 'PF',
            formula: '=MIN(({Basic}+{Conv All}+{Site All}+{Washing Allowance (if provided mention the value else put 0 as value)})*12%, 1800)'
          },
          {
            type: 'formula',
            header: 'Total',
            formula: '=SUM({Basic}:{Washing Allowance (if provided mention the value else put 0 as value)})'
          },
          { type: 'empty' },
          {
            type: 'sum',
            columns: ['Present Days', 'PL/CL/SL']
          },
          {
            type: 'formula',
            header: 'Basic Allow',
            formula: '={Basic}*{No of days Present + Leave}'
          },
          {
            type: 'formula',
            header: 'Spl Allow',
            formula: '={Spl All}*{No of days Present + Leave}'
          },
          {
            type: 'formula',
            header: 'HRA Allow',
            formula: '={HRA}*{No of days Present + Leave}'
          },
          {
            type: 'formula',
            header: 'Conv Allow',
            formula: '={Conv All}*{No of days Present + Leave}'
          },
          {
            type: 'formula',
            header: 'Site Allow',
            formula: '={Site All}*{No of days Present + Leave}'
          },
          'Wash Allowance',
          {
            type: 'formula',
            header: 'If Any other allowance, please mention separate column.',
            formula: '={If Any other allowance, please mention separate column. (if provided mention the value else put 0 as value)}*{PH}'
          },
          'P.H.',
          {
            type: 'formula',
            header: 'Leave Wages ( If being paid monthly)',
            formula: '={Leave Wages (If being paid monthly)}*{No of days Present + Leave}'
          },
          {
            type: 'formula',
            header: 'Total Wages',
            formula: '=SUM({Basic Allow}:{Leave Wages ( If being paid monthly)})-{PH}'
          },
          'PT',
          {
            type: 'formula',
            header: 'PF',
            formula: '=MIN(({Basic Allow}+{Conv Allow}+{Site Allow}+{Washing Allowance (if provided)}+{If Any other allowance, please mention separate column.})*12%, 1800)'
          },
          {
            type: 'formula',
            header: 'Net Wages',
            formula: '={Total Wages}-{PT}-{PF}'
          },
          { type: 'empty' },
          { type: 'empty', value: 0.0 },
          { type: 'empty', value: 0.0 },
          { type: 'empty', value: 0.0 },
          { type: 'empty' },
          {
            type: 'formula',
            header: 'Net Amount',
            formula: '={Net Wages}-{OT / Extra Amount}'
          },
        ]
      },

      form16: {
        columns: [
          'Sl. No.',
          { type: 'empty' },
          'Name',
          'Sex',
          // Date columns (26-31, 1-25)
          ...["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26","27",  "28","29","30","31"],
          { 
            type: 'formula',
            header: 'Summary No. of Days', 
            formula: '=COUNTIF({1}:{31}, "P")+COUNTIF({1}:{31}, "PH")+COUNTIF({1}:{31}, "P/2")*0.5+COUNTIF({1}:{31}, "L")' 
          },
          'Remarks'
        ]
      },

      form17: {
        columns: [
          'Sl. No.',
          'Name',
          'EP No',
          'Designation',
          { 
            type: 'sum', 
            columns: ['Present Days', 'PL/CL/SL'] 
          },
          'Units of Work Done',
          'Daily rate of wages/Pieces Rate',
          {
            type: 'formula',
            header: 'Basic Wages + DA',
            formula: '={Daily Rate of Wages / Pieces Rate}*{No. of Days Worked}'
          },
          {
            type: 'formula',
            header: 'HRA',
            formula: '={Ideal HRA}*{No. of Days Worked}/26'
          },
          {
            type: 'formula',
            header: 'Conveyance',
            formula: '={Ideal Conveyance Allowance}*{No. of Days Worked}/26'
          },
          {
            type: 'formula',
            header: 'Site All',
            formula: '={Ideal Site Allowance}*{No. of Days Worked}/26'
          },
          'Wash Allowance',
          'O.T. Pay',
          'P.H.',
          {
            type: 'formula',
            header: 'Other Cash Payments Nature of Payment to be indicated',
            formula: '={Daily Rate of Wages / Pieces Rate}*2*{PH.}'
          },
          {
            type: 'formula',
            header: 'Total',
            formula: '=SUM({Basic Wages + DA}:{Other Cash Payments Nature of Payment to be indicated})-{PH.}'
          },
          'PF 12%',
          'PT',
          'Advance',
          {
            type: 'formula',
            header: 'Net Amount Paid',
            formula: '={Total}-{PF}-{PT}-{ADVANCE}'
          },
          { type: 'empty' },
          { type: 'empty' }
        ]
      }
    }
  };

  // Call the library function
  Documents.generateAttForms(config);

  const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);
  ui.alert('EXECUTION COMPLETE', `CODE EXECUTION IS COMPLETED.\nTIME TAKEN: ${timeTaken} SECONDS.`, ui.ButtonSet.OK);
}
