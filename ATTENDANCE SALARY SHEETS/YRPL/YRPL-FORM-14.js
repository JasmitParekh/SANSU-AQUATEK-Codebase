function generateEmploymentCardsForYRPL() {
  const ui       = SpreadsheetApp.getUi();
  const response = ui.alert(
    'FORM-14: EMPLOYMENT CARDS',
    'WOULD YOU LIKE TO GENERATE FORM-14 FOR YRPL?',
    ui.ButtonSet.OK_CANCEL
  );
  if (response !== ui.Button.OK) return;
  const startTime = Date.now();

  const config = {
    // ── Source ──────────────────────────────────────────────────────────────
    sourceSheetId:  '1idVteb5gGED-o3wl7EINSsSrcXGS9RN9vKKYH1NcwCY', // YRPL Attendance Salary Sheet
    sourceTabName:  null,                // null = first sheet

    // ── Template ────────────────────────────────────────────────────────────
    templateId:     '1ZsqJkjqCH6t7a9lyOzfhsKLOtnfhdMxT432RNlMtRbc',          // Google Docs template

    // ── Output ──────────────────────────────────────────────────────────────
    outputMode:     'COMBINED',         // 'ONE_PER_ROW' | 'COMBINED',
    outputFileName: '3. Form-14: Employment Cards', // <<tags>> in filename

    siteFolderName: 'YASHASHVI RASAYAN',  // uses standard month-folder hierarchy
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
