function generateESICPFForViswaat() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert('ESIC & PF', 'WOULD YOU LIKE TO UPDATE ESIC & PF DOCUMENT?', ui.ButtonSet.OK_CANCEL);
  if (response !== ui.Button.OK) return; // Immediately exit if they click Cancel or the 'X'
  const startTime = Date.now();

  const config = {
    templateId: '1k1Gxh7EgmYT4QMImFC2wbEAXo2o0Nn3gdMPiNxhLEz4',
    targetFolderId: '12MXsKMMfaZ32YGa093WSNvf3JdgiLIzD',

    attendanceSlipId: '1NCLi8kCk7fgYpYopl3th63ckv752sdePassD4xaTccg',
    siteFolderName: 'Viswaat Chemicals',

    dates: 0, // Date control: 0 = previous month, 1 = current month

    formConfig: {
      columns: [
        'Sl. No.',                           // Auto-generated serial number
        'Name as Per Aadhar',
        {
          type: 'empty',
          value: 'Viswaat'
        },
        'UAN',
        'ESIC',
        'Aadhar No.',
        'DOB',
        'DOJ',
        "Father's/Husband's Name",
        { 
          type: 'sum', 
          columns: ['Present Days', 'PL/CL/SL'] 
        },
        'O.T. Pay',
        'Earned Basic Wages',
        'HRA',
        'Gross',
        'PT',
        'PF 12%',
        {
          type: 'formula',
          header: 'PF 3.67%',
          formula: '=MIN(({GROSS}-{HRA}-{OT AMOUNT})*3.67%,550)'
        },
        {
          type: 'formula',
          header: 'FPF 8.33%',
          formula: '=MIN(({GROSS}-{HRA}-{OT AMOUNT})*8.33%,1250)'
        },
        'ESIC 0.75%',
        'Remarks'                            // Will trigger gray background if contains "NEW"
      ]
    }
  };

  // Call the library function
  Documents.generateESICPFDocument(config);

  const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);
  ui.alert('EXECUTION COMPLETE', `CODE EXECUTION IS COMPLETED.\nTIME TAKEN: ${timeTaken} SECONDS.`, ui.ButtonSet.OK);
}

// /**
//  * Example for a site with plant filter (like Godrej)
//  */
// function generateESICPFForGodrej() {
//   const config = {
//     templateId: '1k1Gxh7EgmYT4QMImFC2wbEAXo2o0Nn3gdMPiNxhLEz4',
//     targetFolderId: '12MXsKMMfaZ32YGa093WSNvf3JdgiLIzD',
//     attendanceSlipId: 'YOUR_ATTENDANCE_SLIP_ID',
//     siteFolderName: 'Godrej',
//     dates: 1,
//     plantSheetName: 'Plant A',              // Specific plant worksheet
//     categoryFilter: 'Skilled',              // Only skilled workers
    
//     formConfig: {
//       columns: [
//         'Sl. No.',
//         'Employee Code',
//         'First Name',
//         'Surname',
//         'Designation',
//         'UAN',
//         'PAN',
//         { type: 'empty', value: '-' },
//         'Remarks'
//       ]
//     }
//   };

//   Documents.generateESICPFDocument(config);
// }

// /**
//  * Example with calculated columns and formulas
//  */
// function generateESICPFAdvanced() {
//   const config = {
//     templateId: '1k1Gxh7EgmYT4QMImFC2wbEAXo2o0Nn3gdMPiNxhLEz4',
//     targetFolderId: '12MXsKMMfaZ32YGa093WSNvf3JdgiLIzD',
//     attendanceSlipId: '1NCLi8kCk7fgYpYopl3th63ckv752sdePassD4xaTccg',
//     siteFolderName: 'Viswaat Chemicals',
//     dates: 1,
    
//     formConfig: {
//       columns: [
//         'Sl. No.',
//         'Employee Code',
//         { type: 'concat', columns: ['First Name', "Father's/Husband's Name", 'Surname'] },
//         'Date of Birth',
//         {
//           type: 'calculated',
//           calculate: function(row, headers) {
//             // Calculate age from date of birth
//             const dob = row[headers.indexOf('Date of Birth')];
//             if (!dob) return '';
//             const today = new Date();
//             const birthDate = new Date(dob);
//             let age = today.getFullYear() - birthDate.getFullYear();
//             const monthDiff = today.getMonth() - birthDate.getMonth();
//             if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
//               age--;
//             }
//             return age;
//           }
//         },
//         'UAN',
//         'PAN',
//         { type: 'empty', value: 'Active' },  // Default status
//         'Remarks'
//       ]
//     }
//   };

//   Documents.generateESICPFDocument(config);
// }
