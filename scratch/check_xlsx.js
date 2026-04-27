const XLSX = require('xlsx');
const path = require('path');

const filePath = 'C:\\Users\\Usuario\\Downloads\\POEs_IonTrack_ID.xlsx';

try {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  console.log('Headers detected:');
  console.log(data[0]);
  console.log('\nSample row:');
  console.log(data[1]);
} catch (error) {
  console.error('Error reading file:', error.message);
}
