function generateEmploymentCardsForGodrejCPP() {
  const ui       = SpreadsheetApp.getUi();
  const response = ui.alert(
    'FORM-14: EMPLOYMENT CARDS',
    'WOULD YOU LIKE TO GENERATE FORM-14 FOR GODREJ INDUSTRIES - CPP?',
    ui.ButtonSet.OK_CANCEL
  );
  if (response !== ui.Button.OK) return;
  const startTime = Date.now();

  const config = {
    // ── Source ──────────────────────────────────────────────────────────────
    sourceSheetId:  '1sCC8PdAUxbxlvp6wiZECbjOA6s1ZTrEMmeTjhxxN97s', // Godrej CPP Attendance Salary Sheet
    sourceTabName:  'CPP',                // null = first sheet

    // ── Template ────────────────────────────────────────────────────────────
    templateId:     '1XUpE4U41YMLDKQFrBZ2UrjnhtlHuovQauJ6JKQ7QPpE',          // Google Docs template

    // ── Output ──────────────────────────────────────────────────────────────
    outputMode:     'COMBINED',         // 'ONE_PER_ROW' | 'COMBINED',
    outputFileName: '3. Form-14: Employment Cards - CPP', // <<tags>> in filename

    siteFolderName: 'Godrej Valia',  // uses standard month-folder hierarchy
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

function generateEmploymentCardsForGodrejBB3() {
  const ui       = SpreadsheetApp.getUi();
  const response = ui.alert(
    'FORM-14: EMPLOYMENT CARDS',
    'WOULD YOU LIKE TO GENERATE FORM-14 FOR GODREJ INDUSTRIES B.B. - 3?',
    ui.ButtonSet.OK_CANCEL
  );
  if (response !== ui.Button.OK) return;
  const startTime = Date.now();

  const config = {
    // ── Source ──────────────────────────────────────────────────────────────
    sourceSheetId:  '1sCC8PdAUxbxlvp6wiZECbjOA6s1ZTrEMmeTjhxxN97s', // Godrej BB3 Attendance Salary Sheet
    sourceTabName:  'B.B. - 3',                // null = first sheet

    // ── Template ────────────────────────────────────────────────────────────
    templateId:     '1XUpE4U41YMLDKQFrBZ2UrjnhtlHuovQauJ6JKQ7QPpE',          // Google Docs template

    // ── Output ──────────────────────────────────────────────────────────────
    outputMode:     'COMBINED',         // 'ONE_PER_ROW' | 'COMBINED',
    outputFileName: '3. Form-14: Employment Cards - B.B. - 3', // <<tags>> in filename

    siteFolderName: 'Godrej Valia',  // uses standard month-folder hierarchy
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

function generateEmploymentCardsForGodrejBB4() {
  const ui       = SpreadsheetApp.getUi();
  const response = ui.alert(
    'FORM-14: EMPLOYMENT CARDS',
    'WOULD YOU LIKE TO GENERATE FORM-14 FOR GODREJ INDUSTRIES B.B. - 4?',
    ui.ButtonSet.OK_CANCEL
  );
  if (response !== ui.Button.OK) return;
  const startTime = Date.now();

  const config = {
    // ── Source ──────────────────────────────────────────────────────────────
    sourceSheetId:  '1sCC8PdAUxbxlvp6wiZECbjOA6s1ZTrEMmeTjhxxN97s', // Godrej BB4 Attendance Salary Sheet
    sourceTabName:  'B.B. - 4',                // null = first sheet

    // ── Template ────────────────────────────────────────────────────────────
    templateId:     '1XUpE4U41YMLDKQFrBZ2UrjnhtlHuovQauJ6JKQ7QPpE',          // Google Docs template

    // ── Output ──────────────────────────────────────────────────────────────
    outputMode:     'COMBINED',         // 'ONE_PER_ROW' | 'COMBINED',
    outputFileName: '3. Form-14: Employment Cards - B.B. - 4', // <<tags>> in filename

    siteFolderName: 'Godrej Valia',  // uses standard month-folder hierarchy
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

function generateEmploymentCardsForGodrejROMEE() {
  const ui       = SpreadsheetApp.getUi();
  const response = ui.alert(
    'FORM-14: EMPLOYMENT CARDS',
    'WOULD YOU LIKE TO GENERATE FORM-14 FOR GODREJ INDUSTRIES - RO/MEE?',
    ui.ButtonSet.OK_CANCEL
  );
  if (response !== ui.Button.OK) return;
  const startTime = Date.now();

  const config = {
    // ── Source ──────────────────────────────────────────────────────────────
    sourceSheetId:  '1sCC8PdAUxbxlvp6wiZECbjOA6s1ZTrEMmeTjhxxN97s', // Godrej RO/MEE Attendance Salary Sheet
    sourceTabName:  'RO/MEE',                // null = first sheet

    // ── Template ────────────────────────────────────────────────────────────
    templateId:     '1XUpE4U41YMLDKQFrBZ2UrjnhtlHuovQauJ6JKQ7QPpE',          // Google Docs template

    // ── Output ──────────────────────────────────────────────────────────────
    outputMode:     'COMBINED',         // 'ONE_PER_ROW' | 'COMBINED',
    outputFileName: '3. Form-14: Employment Cards - RO/MEE', // <<tags>> in filename

    siteFolderName: 'Godrej Valia',  // uses standard month-folder hierarchy
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
