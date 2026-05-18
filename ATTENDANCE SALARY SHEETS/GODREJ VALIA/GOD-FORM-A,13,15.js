function generateGodrejValia_Ato15Forms() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert('FORM-A,13,15', 'WOULD YOU LIKE TO GENERATE FORM-A,13,15?', ui.ButtonSet.OK_CANCEL);
  if (response !== ui.Button.OK) return; // Immediately exit if they click Cancel or the 'X'
  const startTime = Date.now();

  const config = {
    siteFolderName: 'Godrej Valia',                       // Google Drive folder name
    siteFilterName: 'GODREJ INDUSTRIES - VALIA',          // Exact match against SITE NAME in SITES table (case-insensitive)
    id: '1Fw-BFIe4qGO3qEyNhX2pNtnO35rJ4QHIJSuj10336RA',   // Template(Format) spreadsheet ID
    dates: 0,                                             // 0 = previous month, 1 = current month

    // departmentName: 'CPP',                             // Uncomment and set to filter by a specific department/plant

    forms: [
      {
        sheetName: 'Form-A_Format',
        fileName: '1. Form-A',
        configKey: 'formA'
      },
      {
        sheetName: 'Form-13_Format',
        fileName: '2. Form-13: Register of Workman',
        configKey: 'form13'
      },
      {
        sheetName: 'Form-15_Format',
        fileName: '4. Form-15: Register of Adult Workers',
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
          '',             // intentionally blank column
          'MOBILE NUMBER',
          'UAN',
          'PAN',
          'ESIC IP',
          'LWF',
          'AADHAR NUMBER',
          'BANK ACCOUNT NUMBER',
          'BANK NAME',
          'IFSC CODE',
          'PRESENT ADDRESS',
          'PERMANENT ADDRESS',
          '',             // intentionally blank column
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
    }
  };

  Documents.updateForms(config);

  const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);
  ui.alert('EXECUTION COMPLETE', `CODE EXECUTION IS COMPLETED.\nTIME TAKEN: ${timeTaken} SECONDS.`, ui.ButtonSet.OK);
}
