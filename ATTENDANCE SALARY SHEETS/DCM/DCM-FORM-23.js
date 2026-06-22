function generateForm23WithDepartmentsDCM(){
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert('FORM-23', 'WOULD YOU LIKE TO GENERATE FORM-23?', ui.ButtonSet.OK_CANCEL);
  if (response !== ui.Button.OK) return;
  const startTime = Date.now();

  const departments = SITE_CONFIG.departments_salary || [null];       // This should match with the DEPARTMENT NAME column in EMPLOYEE DETAILS SHEET.

  departments.forEach(department => {
      generateForm23(department?.name ?? department);
  })

  const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);
  ui.alert('EXECUTION COMPLETE', `CODE EXECUTION IS COMPLETED.\nTIME TAKEN: ${timeTaken} SECONDS.`, ui.ButtonSet.OK);
}

function generateForm23(departmentName) {
  const baseConfig = {
    formatSpreadsheetId: SITE_CONFIG.formatTemplateID,
    attendanceSlipId: SITE_CONFIG.attendanceSalarySheetID,
    siteFolderName: SITE_CONFIG.siteFolderName,
    dates: SITE_CONFIG.dates,

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

  const categories = SITE_CONFIG.categories_salary || [null];                     // Provide the categories for which the forms are to be generated.
  categories.forEach(category => {                                                // This should match with the category column in Attendance_Salary_Sheet.
    generateForm23WithCategoryFilterDCM(baseConfig, category);
  })
}

function generateForm23WithCategoryFilterDCM(baseConfig, category){
    const config = JSON.parse(JSON.stringify(baseConfig));
    config.subFolder = category;
    config.categoryFilter = category;
    Documents.generateAttForms(config);                                             // Call the Documents library
}
