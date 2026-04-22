const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');
const db = require('./database');
require('dotenv').config();

const watchPath = path.resolve(process.env.WATCH_PATH || './input');

// Ensure directories exist
if (!fs.existsSync(watchPath)) fs.mkdirSync(watchPath, { recursive: true });
const processedPath = path.join(watchPath, 'processed');
if (!fs.existsSync(processedPath)) fs.mkdirSync(processedPath, { recursive: true });

console.log(`[AGENT] Monitoreando carpeta: ${watchPath}`);

const watcher = chokidar.watch(watchPath, {
  ignored: /(^|[\/\\])\../, // ignore dotfiles
  persistent: true,
  depth: 0 // only top level
});

watcher.on('add', (filePath) => {
  if (filePath.endsWith('.csv')) {
    console.log(`[AGENT] Nuevo archivo detectado: ${path.basename(filePath)}`);
    processFile(filePath);
  }
});

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      if (index === 0 || !line.trim()) return; // Skip header or empty
      
      const [ci, month, year, hp10, hp3] = line.split(',').map(s => s.trim());
      
      if (ci && month && year) {
        db.saveDose({
          worker_ci: ci,
          month: parseInt(month),
          year: parseInt(year),
          hp10: parseFloat(hp10 || 0),
          hp3: parseFloat(hp3 || 0),
          raw: line
        });
        console.log(`[AGENT] Dosis guardada en buffer: Worker ${ci}`);
      }
    });

    // Move to processed
    const destPath = path.join(processedPath, path.basename(filePath));
    fs.renameSync(filePath, destPath);
    console.log(`[AGENT] Archivo procesado y movido a: ${destPath}`);
    
  } catch (error) {
    console.error(`[AGENT] Error procesando archivo ${filePath}:`, error);
  }
}

module.exports = watcher;
