function generateWithDepartmentsGodrejKheda(){
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert('FORM-16,17,20 TO 22', 'WOULD YOU LIKE TO GENERATE FORM-16,17,20 TO 22?', ui.ButtonSet.OK_CANCEL);
  if (response !== ui.Button.OK) return;
  const startTime = Date.now();

  const departments = SITE_CONFIG.departments_salary || [null];      // This should match with the DEPARTMENT NAME column in EMPLOYEE DETAILS SHEET.

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

    // Define which forms to generate
    forms: [
      { sheetName: 'Form-16_Format', fileName: `5. Form-16: Attendance Register${departmentName ? ` (${departmentName})` : ''}`, configKey: 'form16' },
      { sheetName: 'Form-17_Format', fileName: `6. Form-17: Wages Register${departmentName ? ` (${departmentName})` : ''}`, configKey: 'form17' },
      { sheetName: 'Form-20_Format', fileName: `7. Form-20: Register of Damage and Loss${departmentName ? ` (${departmentName})` : ''}`, configKey: 'form20' },
      { sheetName: 'Form-21_Format', fileName: `8. Form-21: Register of Fines${departmentName ? ` (${departmentName})` : ''}`, configKey: 'form21' },
      { sheetName: 'Form-22_Format', fileName: `9. Form-22: Advance Register${departmentName ? ` (${departmentName})` : ''}`, configKey: 'form22' }
    ],
    
    formConfigs: {
      // Form-16: Attendance Register Configuration
      form16: {
        columns: [
          'Sl. No.',
          'Name',
          { type: 'empty' },
          // Date columns (26-31, 1-25)
          ...["26","27", "28","29","30","31","1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25"],
          { 
            type: 'formula',
            header: 'Summary No. of Days', 
            formula: '=COUNTIF({26}:{25}, "P")+COUNTIF({26}:{25}, "PH")+COUNTIF({26}:{25}, "P/2")*0.5+COUNTIF({26}:{25}, "L")' 
          },
          { type: 'empty' },
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
          {
            type: 'empty',
            value: '-'
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
            header: 'Site Allowances',
            formula: '={Ideal Site Allowance}/26*{No. of Days Worked}'
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
          'FINE',
          'Advance',
          {
            type: 'formula',
            header: 'Net Payment',
            formula: '={Total}-{PF}-{Others (PT)}-{FINE}-{Advance}'
          },
          { type: 'empty' },
          'Initial of Contractor or his Representative'
        ]
      },

      // Empty configs for forms that don't need data transfer
      form20: {},
      form21: {},
      form22: {}
    }
  };

  const categories = SITE_CONFIG.categories_salary || [null];              // Provide the categories for which the forms are to be generated.
  categories.forEach(category => {                                         // This should match with the category column in Attendance_Salary_Sheet.
    generateWithCategoryFilterGodrejKheda(baseConfig, category);
  })
}

function generateWithCategoryFilterGodrejKheda(baseConfig, category){
    const config = JSON.parse(JSON.stringify(baseConfig));
    config.subFolder = category;
    config.categoryFilter = category;
    Documents.generateAttForms(config);                                             // Call the Documents library
}
