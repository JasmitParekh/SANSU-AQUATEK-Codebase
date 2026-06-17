function generatePaymentRecieptsForReliance() {
  const ui       = SpreadsheetApp.getUi();
  const response = ui.alert(
    'PAYMENT SLIPS',
    'WOULD YOU LIKE TO GENERATE PAYMENT SLIP FOR RELIANCE?',
    ui.ButtonSet.OK_CANCEL
  );
  if (response !== ui.Button.OK) return;
  const startTime = Date.now();

  const config = {
    // ── Source ──────────────────────────────────────────────────────────────
    sourceSheetId:  '1RI001ATE6HR52Szqbz447_Zm4Yg8bsm9zqP9VzkNaAg', // Reliance Attendance Salary Sheet
    sourceTabName:  null,                // null = first sheet

    // ── Template ────────────────────────────────────────────────────────────
    templateId:     '13P8NHEJ1b0Zc0_c4S-6WA42sV-7TGqWBInIEx8dpeFs',          // Google Docs template

    // ── Output ──────────────────────────────────────────────────────────────
    outputMode:     'COMBINED',         // 'ONE_PER_ROW' | 'COMBINED',
    outputFileName: 'Payment Slips', // <<tags>> in filename

    siteFolderName: 'Reliance',  // uses standard month-folder hierarchy
    dates:          0,                    // 0 = previous month

    // ── Filtering ───────────────────────────────────────────────────────────
    rowFilter:      null,                 // null = all rows

    // ── Tag Resolution ───────────────────────────────────────────────────
     tagMap: {
      '<<Month>>': 'Date on which Overtime Worked',
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
