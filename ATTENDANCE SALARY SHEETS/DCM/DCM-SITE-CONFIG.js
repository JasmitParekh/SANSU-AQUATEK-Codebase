const SITE_CONFIG = {
  siteName: 'DCM',                                                               // This must match with EMPLOYEE DETAILS SHEET
  siteFolderName: 'DCM',                                                         // Folder name of the Site
  attendanceSalarySheetID: '1Cv47Nq82FG2I3jExFqBZkRUvMHCGnTQbHaX8uhfUjV8',       // ID of Attendance_Salary_Sheet
  dates: 0,                                                                      // 0 for previous month, 1 for current month

  // Form-A to Form-23 IDs (Form-14 and Form-18 not included)
  formatTemplateID: '10FtLuNLa37c2a8PhOxeiKoaGkJbBccXPZDDFSDkUy_s',              // ID of format spreadsheet which contains formats of Form-A to 23

  // For Form-A, Form-13, and Form-15
  departments_employee: null,                                                    // e.g. ['DEPARTMENT1', 'DEPARTMENT2']. This should match with the DEPARTMENT NAME column in EMPLOYEE DETAILS SHEET.
  categories_employee: null,                                                     // e.g. ['SKILLED', 'UNSKILLED']. This should match with the category column in EMPLOYEE DETAILS SHEET.

  // Form-14 IDs
  form14TemplateID: '1DxGkIk4oa-LIw0fXNGBa1OF4QYMvZBMOVJdDF2hhqBE',              // ID of Form-14 Template
  departments_form14: null,                                                      // e.g. ['DEPARTMENT1', 'DEPARTMENT2']. Provide Department names for which Form-14 needs to be generated.

  // Form-16 to Form-23 IDs
  departments_salary: null,                                                     // e.g. [{ name: 'CPP', sheetName: 'CPP' }, { name: 'B.B. - 3', sheetName: 'B.B. - 3' }]. This should match with the DEPARTMENT NAME column in EMPLOYEE DETAILS SHEET.
  categories_salary: null,                                                      // e.g. ['SKILLED', 'UNSKILLED']. This should match with the category column in ATTENDANCE_SALARY_SHEET.

  // Form-18 IDs DO NOT CHANGE IT
  leaveWageSheetID: '1FNY4BbxkeYlZsMHuXWldKNPUEpgXDB2JVz5YEYE7BxM',              // ID of Leave and Wage Sheet
  form18FolderID: '1ow7lawdhh5JOZ_KsFAP6D7Y2XHYR45-6',                           // ID of folder where generated Form-18 shall be stored
  form18TemplateID: '10YdxRJKDuHQK_Z7g5BOzO_hZHlu8-5D3KTRUancrEV8',              // ID of Form-18's template
  departments_form18: null,                                                      // e.g. ['DEPARTMENT1', 'DEPARTMENT2'].
  categories_form18: null,                                                       // e.g. ['SKILLED', 'UNSKILLED'].
  generateForm18: true,                                                          // Write false if you don't want to generate Form-18

  // Bonus Sheet IDs DO NOT CHANGE IT
  bonusTemplateID: '1WYQNmyx_kYGBggFAWvCkJZmn9jLyremyLAPVo5c_PXQ',               // ID of Bonus Sheet Template
  bonusTargetFolderID: '1H_jz4Ajxd4CFgCSfU0NjLJDvVbGuRktz',                      // ID of Bonus Documents Folder

  // ESIC-PF IDs DO NOT CHANGE IT
  esic_pfTemplateID: '1k1Gxh7EgmYT4QMImFC2wbEAXo2o0Nn3gdMPiNxhLEz4',             // ID of ESIC AND PF DOCUMENT FORMAT
  esic_pftargetFolderID: '12MXsKMMfaZ32YGa093WSNvf3JdgiLIzD',                    // ID of ESIC and PF Details Documents Folder

  // Payment Slip IDs
  paySlipTemplateID: '1CVTscAjehmuEaBxJVBledN2l6reqMlKrKMBUmxyzhwY',             // ID of Payment SLip Template
  departments_payment: null,                                                     // e.g. ['DEPARTMENT1', 'DEPARTMENT2']. Provide Department names for which Form-14 needs to be generated.
}
