function generateWithDepartmentsForDCM(){
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert('FORM-A,13,15', 'WOULD YOU LIKE TO GENERATE FORM-A,13,15?', ui.ButtonSet.OK_CANCEL);
  if (response !== ui.Button.OK) return;
  const startTime = Date.now();

  const departments = SITE_CONFIG.departments_employee || [null]; // This should match with the DEPARTMENT NAME column in EMPLOYEE DETAILS SHEET.
  
  departments.forEach(department => {
    updateDCMComplianceForms(department)
  })

  const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);
  ui.alert('EXECUTION COMPLETE', `CODE EXECUTION IS COMPLETED.\nTIME TAKEN: ${timeTaken} SECONDS.`, ui.ButtonSet.OK);
}

function updateDCMComplianceForms(departmentName) {
  const baseConfig = {
    siteFolderName: SITE_CONFIG.siteFolderName,         // Name of the folder for the new site
    siteFilterName: SITE_CONFIG.siteName,               // Name of new site matching with EMPLOYEE DETAILS SHEET
    id: SITE_CONFIG.formatTemplateID,                   // ID of Google Sheet for the template of Form-A to Form-23
    dates: SITE_CONFIG.dates,                           // 0 = Previos Month, 1 = Current Month                                             
    
    forms: [
      { 
        sheetName: 'Form-A_Format', 
        fileName: `1. Form-A${departmentName ? ` (${departmentName})` : ''}`, 
        configKey: 'formA'
      },
      { 
        sheetName: 'Form-13_Format', 
        fileName: `2. Form-13: Register of Workman${departmentName ? ` (${departmentName})` : ''}`, 
        configKey: 'form13'
      },
      { 
        sheetName: 'Form-15_Format', 
        fileName: `4. Form-15: Register of Adult Workers${departmentName ? ` (${departmentName})` : ''}`, 
        configKey: 'form15'
      }
    ],
    
    formConfigs: {
      formA: {
        columns: [
          'SL. NO.',
          'EMPLOYEE CODE',
          'FIRST NAME',
          "FATHER'S/HUSBAND'S NAME",
          'SURNAME',
          'SEX',
          'DATE OF BIRTH',
          'NATIONALITY',
          'EDUCATION LEVEL',
          'DATE OF JOINING',
          'DESIGNATION',
          'CATEGORY',
          'MOBILE NUMBER',
          'UAN',
          'PAN',
          'LWF',
          'AADHAR NUMBER',
          'BANK ACCOUNT NUMBER',
          'BANK NAME',
          'IFSC CODE',
          'PRESENT ADDRESS',
          'PERMANENT ADDRESS',
          'DATE OF EXIT',
          'REASON FOR EXIT',
          'MARK OF IDENTIFICATION',
          'PHOTO',
          'SIGNATURE',
          'REMARKS'
        ]
      },
      
      form13: {
        columns: [
          'SL. NO.',
          'EMPLOYEE CODE',
          ['FIRST NAME', 'SURNAME'],
          ['AGE', 'SEX'],
          "FATHER'S/HUSBAND'S NAME",
          'DESIGNATION',
          'PERMANENT ADDRESS',
          'PRESENT ADDRESS',
          'DATE OF JOINING',
          'SIGNATURE',
          'DATE OF EXIT',
          'REASON FOR EXIT',
          'REMARKS'
        ]
      },

      form15: {
        columns: [
          'SL. NO.',
          'EMPLOYEE CODE',
          ['FIRST NAME', 'SURNAME'],
          'DATE OF BIRTH',
          'SEX',
          'PRESENT ADDRESS',
          "FATHER'S/HUSBAND'S NAME",
          'DATE OF JOINING',
          'ALPHABET ASSIGNED',
          'DESIGNATION',
          'NO. OF RELAY IF WORKING IN SHIFTS',
          'NUMBER AND DATE OF CERTIFICATE OF FITNESS',
          'NUMBER UNDER SECTION 68',
          'REMARKS'
        ]
      }
    },

    departmentName: departmentName,                     // Provide the department name for which the forms are to be generated.
  };

  const categories = SITE_CONFIG.categories_employee || [null];    // Provide the categories for which the forms are to be generated.
  categories.forEach(category => {                                 // This should match with the category column in EMPLOYEE DETAILS SHEET.
    generateWithCategoryFilterForDCM(baseConfig, category);
  })
}

function generateWithCategoryFilterForDCM(baseConfig, category){
    const config = JSON.parse(JSON.stringify(baseConfig));
    config.subFolder = category;
    config.categoryFilter = category;
    Documents.updateForms(config);                          // Call the Documents library
}
