function generateWithDepartmentsDCM(){
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert('FORM-B,C,D,17,20 TO 22', 'WOULD YOU LIKE TO GENERATE FORM-B,C,D,17,20 TO 22?', ui.ButtonSet.OK_CANCEL);
  if (response !== ui.Button.OK) return;
  const startTime = Date.now();

  const departments = SITE_CONFIG.departments_salary || [null];                   // This should match with the DEPARTMENT NAME column in EMPLOYEE DETAILS SHEET.

  departments.forEach(department => {
      generateFormsFromAttendanceSlip(department?.name ?? department);
  })

  const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);
  ui.alert('EXECUTION COMPLETE', `CODE EXECUTION IS COMPLETED.\nTIME TAKEN: ${timeTaken} SECONDS.`, ui.ButtonSet.OK);
}

function generateFormsFromAttendanceSlip(departmentName) {
  const baseConfig = {
    formatSpreadsheetId: SITE_CONFIG.formatTemplateID,
    attendanceSlipId: SITE_CONFIG.attendanceSalarySheetID,
    siteFolderName: SITE_CONFIG.siteFolderName,
    dates: SITE_CONFIG.dates,

    forms: [
      { sheetName: 'Form-B_Format', fileName: `2. Form-B: Wage Register${departmentName ? ` (${departmentName})` : ''}`, configKey: 'formB' },
      { sheetName: 'Form-C_Format', fileName: `3. Form-C: Register of Loan/Recoveries${departmentName ? ` (${departmentName})` : ''}`, configKey: 'formC' },
      { sheetName: 'Form-D_Format', fileName: `4. Form-D: Attendance Register${departmentName ? ` (${departmentName})` : ''}`, configKey: 'formD' },
      { sheetName: 'Form-17_Format', fileName: `5. Form-17: Wage Register${departmentName ? ` (${departmentName})` : ''}`, configKey: 'form17' },
      { sheetName: 'Form-20_Format', fileName: `6. Form-20: Register of Damage and Loss${departmentName ? ` (${departmentName})` : ''}`, configKey: 'form20' },
      { sheetName: 'Form-21_Format', fileName: `7. Form-21: Register of Fines${departmentName ? ` (${departmentName})` : ''}`, configKey: 'form21' },
      { sheetName: 'Form-22_Format', fileName: `8. Form-22: Advance Register${departmentName ? ` (${departmentName})` : ''}`, configKey: 'form22' }
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
          'FINE',
          'Advance',
          {
            type: 'formula',
            header: 'Net Payment',
            formula: '={Total}-{Others (PT)}-{PF}-{FINE}-{Advance}'
          },
          { type: 'empty' },
          { type: 'empty' }
        ]
      },

      // Empty configs for forms that don't need data transfer
      form20: {},
      form21: {},
      form22: {}
    },
  };

  const categories = SITE_CONFIG.categories_salary || [null];                     // Provide the categories for which the forms are to be generated.
  categories.forEach(category => {                                                // This should match with the category column in Attendance_Salary_Sheet.
    generateWithCategoryFilterDCM(baseConfig, category);
  })
}

function generateWithCategoryFilterDCM(baseConfig, category){
    const config = JSON.parse(JSON.stringify(baseConfig));
    config.subFolder = category;
    config.categoryFilter = category;
    Documents.generateAttForms(config);                                             // Call the Documents library
}
