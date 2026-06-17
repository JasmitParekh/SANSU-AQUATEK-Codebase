function generateEmploymentCardsForVeer() {
  const ui       = SpreadsheetApp.getUi();
  const response = ui.alert(
    'FORM-14: EMPLOYMENT CARDS',
    'WOULD YOU LIKE TO GENERATE FORM-14 FOR VEER PHARMA?',
    ui.ButtonSet.OK_CANCEL
  );
  if (response !== ui.Button.OK) return;
  const startTime = Date.now();

  const config = {
    // ── Source ──────────────────────────────────────────────────────────────
    sourceSheetId:  '1S5pk9upu9hXJNgXIladecZxCJ5vLhIyVsMBZ0eUOx90', // Veer Pharma Attendance Salary Sheet
    sourceTabName:  null,                // null = first sheet

    // ── Template ────────────────────────────────────────────────────────────
    templateId:     '1BMHXQYolayc0P-Udq87ZNPrtb84d7_3biDr_b-0RSEE',          // Google Docs template

    // ── Output ──────────────────────────────────────────────────────────────
    outputMode:     'COMBINED',         // 'ONE_PER_ROW' | 'COMBINED',
    outputFileName: '3. Form-14: Employment Cards', // <<tags>> in filename

    siteFolderName: 'Veer Pharma',  // uses standard month-folder hierarchy
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
