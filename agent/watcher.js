const chokidar = require('chokidar');
const fs = require('fs-extra');
const path = require('path');
const xlsx = require('xlsx');
const db = require('./database');
require('dotenv').config();

const watchPath = path.resolve(process.env.WATCH_PATH || './input');
const processedPath = path.join(watchPath, 'processed');

// Ensure directories exist
fs.ensureDirSync(watchPath);
fs.ensureDirSync(processedPath);

console.log(`[WATCHER] Monitoreando carpeta: ${watchPath}`);

const watcher = chokidar.watch(watchPath, {
  ignored: /(^|[\/\\])\../,
  persistent: true,
  depth: 0
});

watcher.on('add', (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.xlsx' || ext === '.xls' || ext === '.csv') {
    console.log(`[WATCHER] Nuevo archivo: ${path.basename(filePath)}`);
    processFile(filePath);
  }
});

function processFile(filePath) {
  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    console.log(`[WATCHER] Procesando ${data.length} filas...`);

    data.forEach((row) => {
      // Mapping logic (flexible keys)
      const ci = row["CI TRABAJADOR"] || row["ci"] || row["CI"] || row["CEDULA"];
      const monthInput = row["Mes"] || row["month"] || row["mes"];
      const year = row["Año"] || row["year"] || row["año"];
      const hp10 = row["Hp10"] || row["hp10"] || 0;

      if (ci && monthInput && year) {
        let month = parseInt(monthInput);
        if (isNaN(month)) {
            const monthsMap = { enero:1, febrero:2, marzo:3, abril:4, mayo:5, junio:6, julio:7, agosto:8, septiembre:9, octubre:10, noviembre:11, diciembre:12 };
            month = monthsMap[monthInput.toString().toLowerCase().trim()] || 0;
        }

        db.saveDose({
          worker_ci: ci.toString(),
          month,
          year: parseInt(year),
          hp10: parseFloat(hp10),
          hp3: parseFloat(row["Hp3"] || 0),
          hp007: parseFloat(row["Hp007"] || 0),
          raw: JSON.stringify(row),
          fileName: path.basename(filePath)
        });
      }
    });

    // Move to processed
    const destPath = path.join(processedPath, `${Date.now()}_${path.basename(filePath)}`);
    fs.moveSync(filePath, destPath);
    console.log(`[WATCHER] Archivo completado y movido.`);

  } catch (error) {
    console.error(`[WATCHER] Error:`, error.message);
  }
}

module.exports = watcher;
