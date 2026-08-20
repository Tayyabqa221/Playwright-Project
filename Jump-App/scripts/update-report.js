const ExcelJS = require('exceljs');

(async () => {
  const inFile = 'C:/Users/Devix-IT/Downloads/Automated test cases - execution report (same pattern).xlsx';
  const outFile = 'C:/Users/Devix-IT/Downloads/Automated test cases - final report.xlsx';
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(inFile);
  const sheet = workbook.getWorksheet('Sheet1') || workbook.worksheets[0];

  const completeSet = new Set([
    'TCS-001','TCS-003','TCS-005','TCS-006','TCS-007','TCS-008','TCS-009','TCS-010','TCS-011','TCS-016','TCS-017','TCS-018','TCS-019','TCS-020','TCS-021','TCS-022','TCS-023','TCS-024','TCS-025','TCS-026','TCS-027','TCS-028','TCS-029','TCS-030','TCS-031','TCS-032','TCS-033','TCS-034','TCS-035','TCS-036','TCS-037'
  ]);

  // Remove Test Data column (original column I)
  sheet.spliceColumns(9, 1);

  // After removing column I:
  // Status => column J (10), Comments => column L (12)
  for (let row = 2; row <= sheet.rowCount; row++) {
    const testCaseId = String(sheet.getCell(row, 1).value || '').trim();
    if (!testCaseId.startsWith('TCS-')) continue;

    const statusCell = sheet.getCell(row, 10);
    const commentsCell = sheet.getCell(row, 12);

    const currentStatus = String(statusCell.value || '').toLowerCase();
    statusCell.value = currentStatus.includes('not') ? 'Non Automated' : 'Automated';
    statusCell.dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: ['"Automated,Non Automated"'],
      showErrorMessage: true,
      errorStyle: 'warning',
      errorTitle: 'Invalid status',
      error: 'Select value from dropdown only.'
    };

    commentsCell.value = completeSet.has(testCaseId) ? 'Complete' : 'Non Complete';
  }

  await workbook.xlsx.writeFile(outFile);
  console.log(outFile);
})();
