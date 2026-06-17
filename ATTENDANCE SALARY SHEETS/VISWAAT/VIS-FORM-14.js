function generateEmploymentCardsForViswaat() {
  const ui       = SpreadsheetApp.getUi();
  const response = ui.alert(
    'FORM-14: EMPLOYMENT CARDS',
    'WOULD YOU LIKE TO GENERATE FORM-14 FOR VISWAAT?',
    ui.ButtonSet.OK_CANCEL
  );
  if (response !== ui.Button.OK) return;
  const startTime = Date.now();

  const config = {
    // ── Source ──────────────────────────────────────────────────────────────
    sourceSheetId:  '1NCLi8kCk7fgYpYopl3th63ckv752sdePassD4xaTccg', // Viswaat Attendance Slip
    sourceTabName:  null,                // null = first sheet

    // ── Template ────────────────────────────────────────────────────────────
    templateId:     '1aULARJDuqGpac22GHJvrRrcyCBGQvpYrB5lMLHlyN-I',          // Google Docs template

    // ── Output ──────────────────────────────────────────────────────────────
    outputMode:     'COMBINED',         // 'ONE_PER_ROW' | 'COMBINED',
    outputFileName: '3. Form-14: Employment Cards', // <<tags>> in filename

    siteFolderName: 'Viswaat Chemicals',  // uses standard month-folder hierarchy
    dates:          0,                    // 0 = previous month

    // ── Filtering ───────────────────────────────────────────────────────────
    rowFilter:      null,                 // null = all rows
  };

  Documents.generateMailMerge(config);

  const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);
  ui.alert(
    'EXECUTION COMPLETE',
    `CODE EXECUTION IS COMPLETED.\nTIME TAKEN: ${timeTaken} SECONDS.`,
    ui.ButtonSet.OK
  );
}


// // ----------------------------------------------------------------------------
// // EXAMPLE 2: Payment Receipts — COMBINED (all receipts in one Docs file)
// // One file with a page break between each employee's receipt
// // ----------------------------------------------------------------------------
// function generatePaymentReceiptsForViswaat() {
//   const ui       = SpreadsheetApp.getUi();
//   const response = ui.alert(
//     'PAYMENT RECEIPTS',
//     'WOULD YOU LIKE TO GENERATE PAYMENT RECEIPTS FOR VISWAAT?',
//     ui.ButtonSet.OK_CANCEL
//   );
//   if (response !== ui.Button.OK) return;
//   const startTime = Date.now();

//   // Build month/year strings for static tags and filename
//   const now = new Date();
//   now.setMonth(now.getMonth() - 1);                                  // previous month
//   const monthLabel = now.toLocaleString('en-US', { month: 'long' });
//   const shortMonth = now.toLocaleString('en-US', { month: 'short' });
//   const year       = now.getFullYear();
//   const shortYear  = String(year).slice(-2);

//   const config = {
//     // ── Source ──────────────────────────────────────────────────────────────
//     sourceSheetId:  '1NCLi8kCk7fgYpYopl3th63ckv752sdePassD4xaTccg',
//     sourceTabName:  null,

//     // ── Template ────────────────────────────────────────────────────────────
//     templateId:     'YOUR_PAYMENT_RECEIPT_TEMPLATE_DOC_ID',

//     // ── Output ──────────────────────────────────────────────────────────────
//     outputMode:     'COMBINED',
//     outputFileName: `Payment Receipts - Viswaat - ${shortMonth}-${shortYear}`,

//     siteFolderName: 'Viswaat Chemicals',
//     dates:          0,

//     // ── Filtering ───────────────────────────────────────────────────────────
//     rowFilter:      null,

//     // ── Tag overrides ────────────────────────────────────────────────────────
//     tagMap: {
//       '<<DOJ>>':    'Date of Joining',
//       '<<FATHER>>': "Father's/Husband's Name"
//     },

//     // ── Computed tags ────────────────────────────────────────────────────────
//     staticTags: {
//       '<<MONTH>>':          `${monthLabel}-${shortYear}`,
//       '<<YEAR>>':           String(year),
//       '<<SITE>>':           'VISWAAT CHEMICALS',
//       '<<COMPANY>>':        'SANSU AQUATEK'
//     },

//     // ── Images ───────────────────────────────────────────────────────────────
//     handleImages: false,
//     imageColumns: []
//   };

//   Documents.generateMailMerge(config);

//   const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);
//   ui.alert(
//     'EXECUTION COMPLETE',
//     `CODE EXECUTION IS COMPLETED.\nTIME TAKEN: ${timeTaken} SECONDS.`,
//     ui.ButtonSet.OK
//   );
// }


// // ----------------------------------------------------------------------------
// // EXAMPLE 3: Salary Slips — COMBINED into one Spreadsheet (one tab per employee)
// // Each employee gets their own tab named "Name / Employee Code"
// // ----------------------------------------------------------------------------
// function generateSalarySlipsForViswaat() {
//   const ui       = SpreadsheetApp.getUi();
//   const response = ui.alert(
//     'SALARY SLIPS',
//     'WOULD YOU LIKE TO GENERATE SALARY SLIP SPREADSHEET FOR VISWAAT?',
//     ui.ButtonSet.OK_CANCEL
//   );
//   if (response !== ui.Button.OK) return;
//   const startTime = Date.now();

//   const now = new Date();
//   now.setMonth(now.getMonth() - 1);
//   const shortMonth = now.toLocaleString('en-US', { month: 'short' });
//   const shortYear  = String(now.getFullYear()).slice(-2);

//   const config = {
//     // ── Source ──────────────────────────────────────────────────────────────
//     sourceSheetId:  '1NCLi8kCk7fgYpYopl3th63ckv752sdePassD4xaTccg',
//     sourceTabName:  null,

//     // ── Template ────────────────────────────────────────────────────────────
//     templateId:     'YOUR_SALARY_SLIP_TEMPLATE_SHEET_ID',            // Google Sheets template

//     // ── Output ──────────────────────────────────────────────────────────────
//     outputMode:     'COMBINED',
//     outputFileName: `Salary Slips - Viswaat - ${shortMonth}-${shortYear}`,

//     siteFolderName: 'Viswaat Chemicals',
//     dates:          0,

//     // ── Filtering ────────────────────────────────────────────────────────────
//     rowFilter:      null,

//     // ── Tag overrides ────────────────────────────────────────────────────────
//     tagMap: {
//       '<<DOJ>>':    'Date of Joining',
//       '<<DAYS>>':   'Present Days',
//       '<<LEAVES>>': 'PL/CL/SL'
//     },

//     // ── Computed tags ────────────────────────────────────────────────────────
//     staticTags: {
//       '<<MONTH>>':   `${shortMonth}-${shortYear}`,
//       '<<SITE>>':    'VISWAAT CHEMICALS'
//     },

//     // ── Images ───────────────────────────────────────────────────────────────
//     // Signature in the slip cell becomes =IMAGE("url")
//     handleImages: true,
//     imageColumns: ['Signature']
//   };

//   Documents.generateMailMerge(config);

//   const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);
//   ui.alert(
//     'EXECUTION COMPLETE',
//     `CODE EXECUTION IS COMPLETED.\nTIME TAKEN: ${timeTaken} SECONDS.`,
//     ui.ButtonSet.OK
//   );
// }


// // ----------------------------------------------------------------------------
// // EXAMPLE 4: Godrej Valia — plant-specific Employment Cards
// // Shows how to use sourceTabName for multi-plant sites
// // ----------------------------------------------------------------------------
// function generateEmploymentCardsForGodrejCPP() {
//   const ui       = SpreadsheetApp.getUi();
//   const response = ui.alert(
//     'EMPLOYMENT CARDS (CPP)',
//     'WOULD YOU LIKE TO GENERATE EMPLOYMENT CARDS FOR GODREJ CPP?',
//     ui.ButtonSet.OK_CANCEL
//   );
//   if (response !== ui.Button.OK) return;
//   const startTime = Date.now();

//   const config = {
//     sourceSheetId:  '1sCC8PdAUxbxlvp6wiZECbjOA6s1ZTrEMmeTjhxxN97s', // Godrej Valia Attendance Slip
//     sourceTabName:  'CPP',                                           // specific plant worksheet

//     templateId:     'YOUR_EMPLOYMENT_CARD_TEMPLATE_DOC_ID',

//     outputMode:     'ONE_PER_ROW',
//     outputFileName: 'Employment Card - <<Name>> (<<Employee Code>>)',

//     siteFolderName: 'Godrej Valia',
//     dates:          0,

//     rowFilter:      null,

//     tagMap: {
//       '<<DOJ>>':    'Date of Joining',
//       '<<DOB>>':    'Date of Birth',
//       '<<FATHER>>': "Father's/Husband's Name",
//       '<<AADHAR>>': 'Aadhar Number'
//     },

//     staticTags: {
//       '<<COMPANY>>': 'SANSU AQUATEK',
//       '<<SITE>>':    'GODREJ INDUSTRIES - VALIA',
//       '<<DEPT>>':    'CPP'
//     },

//     handleImages: true,
//     imageColumns: ['Photo', 'Signature']
//   };

//   Documents.generateMailMerge(config);

//   const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);
//   ui.alert(
//     'EXECUTION COMPLETE',
//     `CODE EXECUTION IS COMPLETED.\nTIME TAKEN: ${timeTaken} SECONDS.`,
//     ui.ButtonSet.OK
//   );
// }
