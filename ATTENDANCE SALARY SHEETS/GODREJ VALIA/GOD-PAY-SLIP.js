function generatePaymentRecieptsForGodrejCPP() {
  const ui       = SpreadsheetApp.getUi();
  const response = ui.alert(
    'PAYMENT SLIPS',
    'WOULD YOU LIKE TO GENERATE PAYMENT SLIP FOR GODREJ INDUSTIRES CPP?',
    ui.ButtonSet.OK_CANCEL
  );
  if (response !== ui.Button.OK) return;
  const startTime = Date.now();

  const config = {
    // ── Source ──────────────────────────────────────────────────────────────
    sourceSheetId:  '1sCC8PdAUxbxlvp6wiZECbjOA6s1ZTrEMmeTjhxxN97s', // CPP Attendance Salary Sheet
    sourceTabName:  'CPP',                // null = first sheet

    // ── Template ────────────────────────────────────────────────────────────
    templateId:     '1AzaA8WydfDp4i6Er7etiZvJyUixex3AYgBXmuhC_-tg',          // Google Docs template

    // ── Output ──────────────────────────────────────────────────────────────
    outputMode:     'COMBINED',         // 'ONE_PER_ROW' | 'COMBINED',
    outputFileName: 'Payment Slips - CPP', // <<tags>> in filename

    siteFolderName: 'Godrej Valia',  // uses standard month-folder hierarchy
    dates:          0,                    // 0 = previous month

    // ── Filtering ───────────────────────────────────────────────────────────
    rowFilter:      null,                 // null = all rows

    // ── Tag Resolution ───────────────────────────────────────────────────
     tagMap: {
      '<<Month>>': 'Date on which Overtime Worked'
    }

  };

  Documents.generateMailMerge(config);

  const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);
  ui.alert(
    'EXECUTION COMPLETE',
    `CODE EXECUTION IS COMPLETED.\nTIME TAKEN: ${timeTaken} SECONDS.`,
    ui.ButtonSet.OK
  );
}

function generatePaymentRecieptsForGodrejBB3() {
  const ui       = SpreadsheetApp.getUi();
  const response = ui.alert(
    'PAYMENT SLIPS',
    'WOULD YOU LIKE TO GENERATE PAYMENT SLIP FOR GODREJ INDUSTIRES B.B. - 3?',
    ui.ButtonSet.OK_CANCEL
  );
  if (response !== ui.Button.OK) return;
  const startTime = Date.now();

  const config = {
    // ── Source ──────────────────────────────────────────────────────────────
    sourceSheetId:  '1sCC8PdAUxbxlvp6wiZECbjOA6s1ZTrEMmeTjhxxN97s', // BB3 Attendance Salary Sheet
    sourceTabName:  'B.B. - 3',                // null = first sheet

    // ── Template ────────────────────────────────────────────────────────────
    templateId:     '1AzaA8WydfDp4i6Er7etiZvJyUixex3AYgBXmuhC_-tg',          // Google Docs template

    // ── Output ──────────────────────────────────────────────────────────────
    outputMode:     'COMBINED',         // 'ONE_PER_ROW' | 'COMBINED',
    outputFileName: 'Payment Slips - B.B. - 3', // <<tags>> in filename

    siteFolderName: 'Godrej Valia',  // uses standard month-folder hierarchy
    dates:          0,                    // 0 = previous month

    // ── Filtering ───────────────────────────────────────────────────────────
    rowFilter:      null,                 // null = all rows

    // ── Tag Resolution ───────────────────────────────────────────────────
     tagMap: {
      '<<Month>>': 'Date on which Overtime Worked'
    }

  };

  Documents.generateMailMerge(config);

  const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);
  ui.alert(
    'EXECUTION COMPLETE',
    `CODE EXECUTION IS COMPLETED.\nTIME TAKEN: ${timeTaken} SECONDS.`,
    ui.ButtonSet.OK
  );
}

function generatePaymentRecieptsForGodrejBB4() {
  const ui       = SpreadsheetApp.getUi();
  const response = ui.alert(
    'PAYMENT SLIPS',
    'WOULD YOU LIKE TO GENERATE PAYMENT SLIP FOR GODREJ INDUSTIRES B.B. - 4?',
    ui.ButtonSet.OK_CANCEL
  );
  if (response !== ui.Button.OK) return;
  const startTime = Date.now();

  const config = {
    // ── Source ──────────────────────────────────────────────────────────────
    sourceSheetId:  '1sCC8PdAUxbxlvp6wiZECbjOA6s1ZTrEMmeTjhxxN97s', // BB4 Attendance Salary Sheet
    sourceTabName:  'B.B. - 4',                // null = first sheet

    // ── Template ────────────────────────────────────────────────────────────
    templateId:     '1AzaA8WydfDp4i6Er7etiZvJyUixex3AYgBXmuhC_-tg',          // Google Docs template

    // ── Output ──────────────────────────────────────────────────────────────
    outputMode:     'COMBINED',         // 'ONE_PER_ROW' | 'COMBINED',
    outputFileName: 'Payment Slips - B.B. - 4', // <<tags>> in filename

    siteFolderName: 'Godrej Valia',  // uses standard month-folder hierarchy
    dates:          0,                    // 0 = previous month

    // ── Filtering ───────────────────────────────────────────────────────────
    rowFilter:      null,                 // null = all rows

    // ── Tag Resolution ───────────────────────────────────────────────────
     tagMap: {
      '<<Month>>': 'Date on which Overtime Worked'
    }

  };

  Documents.generateMailMerge(config);

  const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);
  ui.alert(
    'EXECUTION COMPLETE',
    `CODE EXECUTION IS COMPLETED.\nTIME TAKEN: ${timeTaken} SECONDS.`,
    ui.ButtonSet.OK
  );
}

function generatePaymentRecieptsForGodrejROMEE() {
  const ui       = SpreadsheetApp.getUi();
  const response = ui.alert(
    'PAYMENT SLIPS',
    'WOULD YOU LIKE TO GENERATE PAYMENT SLIP FOR GODREJ INDUSTIRES RO/MEE?',
    ui.ButtonSet.OK_CANCEL
  );
  if (response !== ui.Button.OK) return;
  const startTime = Date.now();

  const config = {
    // ── Source ──────────────────────────────────────────────────────────────
    sourceSheetId:  '1sCC8PdAUxbxlvp6wiZECbjOA6s1ZTrEMmeTjhxxN97s', // RO/MEE Attendance Salary Sheet
    sourceTabName:  'RO/MEE',                // null = first sheet

    // ── Template ────────────────────────────────────────────────────────────
    templateId:     '1AzaA8WydfDp4i6Er7etiZvJyUixex3AYgBXmuhC_-tg',          // Google Docs template

    // ── Output ──────────────────────────────────────────────────────────────
    outputMode:     'COMBINED',         // 'ONE_PER_ROW' | 'COMBINED',
    outputFileName: 'Payment Slips - RO/MEE', // <<tags>> in filename

    siteFolderName: 'Godrej Valia',  // uses standard month-folder hierarchy
    dates:          0,                    // 0 = previous month

    // ── Filtering ───────────────────────────────────────────────────────────
    rowFilter:      null,                 // null = all rows

    // ── Tag Resolution ───────────────────────────────────────────────────
     tagMap: {
      '<<Month>>': 'Date on which Overtime Worked'
    }

  };

  Documents.generateMailMerge(config);

  const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);
  ui.alert(
    'EXECUTION COMPLETE',
    `CODE EXECUTION IS COMPLETED.\nTIME TAKEN: ${timeTaken} SECONDS.`,
    ui.ButtonSet.OK
  );
}
