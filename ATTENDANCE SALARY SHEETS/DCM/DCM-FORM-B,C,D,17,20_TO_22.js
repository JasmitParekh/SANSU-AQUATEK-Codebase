function generateFormsFromAttendanceSlip() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert('FORM-B,C,D,17,20 TO 22', 'WOULD YOU LIKE TO GENERATE FORM-B,C,D,17,20 TO 22?', ui.ButtonSet.OK_CANCEL);
  if (response !== ui.Button.OK) return; // Immediately exit if they click Cancel or the 'X'
  const startTime = Date.now();

  const config = {
    formatSpreadsheetId: '10FtLuNLa37c2a8PhOxeiKoaGkJbBccXPZDDFSDkUy_s',
    attendanceSlipId: '1Cv47Nq82FG2I3jExFqBZkRUvMHCGnTQbHaX8uhfUjV8',
    siteFolderName: 'DCM',
    dates: 0,

    forms: [
      { sheetName: 'Form-B_Format', fileName: '2. Form-B: Wage Register', configKey: 'formB' },
      { sheetName: 'Form-C_Format', fileName: '3. Form-C: Register of Loan/Recoveries', configKey: 'formC' },
      { sheetName: 'Form-D_Format', fileName: '4. Form-D: Attendance Register', configKey: 'formD' },
      { sheetName: 'Form-17_Format', fileName: '5. Form-17: Wage Register', configKey: 'form17' },
      { sheetName: 'Form-20_Format', fileName: '6. Form-20: Register of Damage and Loss', configKey: 'form20' },
      { sheetName: 'Form-21_Format', fileName: '7. Form-21: Register of Fines', configKey: 'form21' },
      { sheetName: 'Form-22_Format', fileName: '8. Form-22: Advance Register', configKey: 'form22' }
    ],
    
    formConfigs: {

      formB:{
        columns: [
          'Sl. No.',
          { type: 'empty' },
          'Name',
          'Sex',
          'Category',
          'Designation',
          'DOB',
          'DOJ',
          'Daily rate of wages/Pieces Rate',
          'Present Days',
          'PL/CL/SL',
          {
            type: 'formula',
            header: 'Total days',
            formula: '=SUM({Present},{Leave})'
          },
          'O.T. Hours',
          {
            type: 'formula',
            header: 'Basic',
            formula: '={Rate of Wage}*26'
          },
          {
            type: 'formula',
            header: 'Earned Basic',
            formula: '={Rate of Wage}*{Total days}'
          },
          'P.H.',
          {
            type: 'formula',
            header: 'PH PAY',
            formula: '={Rate of Wage}*2*{PH}'
          },
          {
            type: 'formula',
            header: 'Payments Overtime',
            formula: '={Rate of Wage}/8*2*{Overtime hours worked}'
          },
          'HRA',
          {
            type: 'sum',
            columns: ['Conveyance Allowance', 'Medical Allowance', 'Transportation Allowance', 'Education Allowance', 'Food Allowance', 'Wash Allowance']
          },
          {
            type: 'formula',
            header: 'Total',
            formula: "=SUM({Earned Basic},{PH PAY},{Payments Overtime},{HRA},{*Others /CON'ALL,MEDI'ALL,TRANS'ALL,EDU'ALL,FOOD'ALL/WASH'ALL})"
          },
          {
            type: 'formula',
            header: 'PF',
            formula: "=MIN(({Earned Basic}+{PH PAY}+{*Others /CON'ALL,MEDI'ALL,TRANS'ALL,EDU'ALL,FOOD'ALL/WASH'ALL})*12%, 1800)"
          },
          { type: 'empty', value: '-' },
          { type: 'empty', value: '-' },
          { type: 'empty', value: '-' },
          { type: 'empty', value: '-' },
          {
            type: 'formula',
            header: 'PT',
            formula: "=IF({Total}>12000, 200, 0)"
          },
          { type: 'empty', value: '-' },
          {
            type: 'formula',
            header: 'TOTAL',
            formula: '=SUM({PF}:{RECOVERY})'
          },
          {
            type: 'formula',
            header: 'Net Payment',
            formula: '={Total}-{TOTAL}'
          },
          { type: 'empty', value: '-' },
          { type: 'empty', value: '-' },
          'Date on which Overtime Wages Paid',
          'Remarks'
        ]
      },

      formC: {
        columns:[
          'Sl. No.',
          { type: 'empty' },
          'Name',
          'Sex',
          'Category'
        ]
      },

      formD: {
        columns: [
          'Sl. No.',
          'Name',
          'Category',
          ...["21","22","23","24","25","26","27","28","29","30","31","1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20"],
          {
            type: 'formula',
            header: 'TOTAL MEN DAYS',
            formula: '=COUNTIF({21}:{20}, "P")+COUNTIF({21}:{20}, "PH")+COUNTIF({21}:{20}, "P/2")*0.5+COUNTIF({21}:{20}, "L")'
          },
          'Remarks'
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
            header: 'Basic Wages + DA',
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
            formula: '={Ideal HRA}/26*{No. of Days Worked}'
          },
          {
            type: 'formula',
            header: 'Conve.',
            formula: '={Ideal Conveyance Allowance}/26*{No. of Days Worked}'
          },
          {
            type: 'formula',
            header: 'Medical Allowance',
            formula: '={Ideal Medical Allowance}/26*{No. of Days Worked}'
          },
          {
            type: 'formula',
            header: 'Transportation Allowance',
            formula: '={Ideal Transportation Allowance}/26*{No. of Days Worked}'
          },
          {
            type: 'formula',
            header: 'Education Allowances',
            formula: '={Ideal Education Allowance}/26*{No. of Days Worked}'
          },
          {
            type: 'formula',
            header: 'Food Allowance',
            formula: '={Ideal Food Allowance}/26*{No. of Days Worked}'
          },
          {
            type: 'formula',
            header: 'Wash Allowance',
            formula: '={Ideal Wash Allowance}/26*{No. of Days Worked}'
          },
          {
            type: 'formula',
            header: 'Total',
            formula: '=SUM({Basic Wages + DA}, {Payments Overtime}, {Payments P.H.}, {HRA}, {Conve.}, {Medical Allowance}, {Transportation Allowance}, {Education Allowances}, {Food Allowance}, {Wash Allowance})'
          },
          {
            type: 'formula',
            header: 'PF',
            formula: '=MIN(({Basic Wages + DA}+{Payments P.H.}+{Conve.}+{Medical Allowance}+{Transportation Allowance}+{Education Allowances}+{Food Allowance}+{Wash Allowance})*12%, 1800)'
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
            formula: '={Total}-{Others (PT)}-{PF}-{Advance}'
          },
          { type: 'empty' },
          { type: 'empty' }
        ]
      },

      // Empty configs for forms that don't need data transfer
      form20: {},
      form21: {},
      form22: {}
    }
  };

  // Call the library function
  Documents.generateAttForms(config);

  const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);
  ui.alert('EXECUTION COMPLETE', `CODE EXECUTION IS COMPLETED.\nTIME TAKEN: ${timeTaken} SECONDS.`, ui.ButtonSet.OK);
}
