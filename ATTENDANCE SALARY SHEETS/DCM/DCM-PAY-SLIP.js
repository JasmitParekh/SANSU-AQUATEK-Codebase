function generatePaymentRecieptsForDCM() {
  const ui       = SpreadsheetApp.getUi();
  const response = ui.alert(
    'PAYMENT SLIPS',
    'WOULD YOU LIKE TO GENERATE PAYMENT SLIP FOR DCM?',
    ui.ButtonSet.OK_CANCEL
  );
  if (response !== ui.Button.OK) return;
  const startTime = Date.now();

  const config = {
    // ── Source ──────────────────────────────────────────────────────────────
    sourceSheetId:  '1Cv47Nq82FG2I3jExFqBZkRUvMHCGnTQbHaX8uhfUjV8', // DCM Attendance Salary Sheet
    sourceTabName:  null,                // null = first sheet

    // ── Template ────────────────────────────────────────────────────────────
    templateId:     '1CVTscAjehmuEaBxJVBledN2l6reqMlKrKMBUmxyzhwY',          // Google Docs template

    // ── Output ──────────────────────────────────────────────────────────────
    outputMode:     'COMBINED',         // 'ONE_PER_ROW' | 'COMBINED',
    outputFileName: 'Payment Slips', // <<tags>> in filename

    siteFolderName: 'DCM',  // uses standard month-folder hierarchy
    dates:          0,                    // 0 = previous month

    // ── Filtering ───────────────────────────────────────────────────────────
    rowFilter:      null,                 // null = all rows

    // ── Tag Resolution ───────────────────────────────────────────────────
     tagMap: {
      '<<Month>>': 'Date on which Overtime Worked',
      '<<Trans All>>': 'Transportation Allowance'
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
