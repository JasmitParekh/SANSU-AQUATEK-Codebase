function generatePaymentRecieptsForUPL13() {
  const ui       = SpreadsheetApp.getUi();
  const response = ui.alert(
    'PAYMENT SLIPS',
    'WOULD YOU LIKE TO GENERATE PAYMENT SLIP FOR UPL - 13?',
    ui.ButtonSet.OK_CANCEL
  );
  if (response !== ui.Button.OK) return;
  const startTime = Date.now();

  const config = {
    // ── Source ──────────────────────────────────────────────────────────────
    sourceSheetId:  '1pCp29ARWxIzyFkkhW6JKolQkDOhiLmoHIuvdilPaibQ', // DCM Attendance Salary Sheet
    sourceTabName:  null,                // null = first sheet

    // ── Template ────────────────────────────────────────────────────────────
    templateId:     '1m5V_YLt7dNunFD1KkyCB86E1F4TaUddnWkZ8niRxndg',          // Google Docs template

    // ── Output ──────────────────────────────────────────────────────────────
    outputMode:     'COMBINED',         // 'ONE_PER_ROW' | 'COMBINED',
    outputFileName: 'Payment Slips', // <<tags>> in filename

    siteFolderName: 'UPL- 13,DAHEJ',  // uses standard month-folder hierarchy
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
