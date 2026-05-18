function generateFormsAto15() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert('FORM-A,13,15', 'WOULD YOU LIKE TO GENERATE FORM-A,13,15?', ui.ButtonSet.OK_CANCEL);
  if (response !== ui.Button.OK) return; // Immediately exit if they click Cancel or the 'X'
  const startTime = Date.now();

  const config = {
    siteFolderName: 'Viswaat Chemicals',
    siteFilterName: 'VISWAAT CHEMICALS',
    id: '1yBV5PfAS-ATntn27qQMHPFg7i3Xh5nJz_fOCHH1hu3I',
    dates: 0, // 0 for previous month, 1 for current month.

    // Define which forms to generate
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
