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
    sourceSheetId: SITE_CONFIG.attendanceSalarySheetID,
    sourceTabName: SITE_CONFIG.departmentName,

    // ── Template ────────────────────────────────────────────────────────────
    templateId: SITE_CONFIG.paySlipTemplateID,

    // ── Output ──────────────────────────────────────────────────────────────
    outputMode: 'COMBINED',                                                   // 'ONE_PER_ROW' | 'COMBINED',
    outputFileName: 'Payment Slips',                                          // <<tags>> in filename

    siteFolderName: SITE_CONFIG.siteFolderName,
    dates: SITE_CONFIG.dates,

    // ── Filtering ───────────────────────────────────────────────────────────
    rowFilter: null,                                                          // null = all rows

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
