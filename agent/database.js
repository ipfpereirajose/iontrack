const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'iontrack_buffer.db'));

// Initialize Local Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS local_doses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    worker_ci TEXT NOT NULL,
    period_month INTEGER NOT NULL,
    period_year INTEGER NOT NULL,
    hp10 REAL,
    hp3 REAL,
    raw_content TEXT,
    sync_status TEXT DEFAULT 'pending',
    error_log TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

module.exports = {
  saveDose: (dose) => {
    const stmt = db.prepare(`
      INSERT INTO local_doses (worker_ci, period_month, period_year, hp10, hp3, raw_content)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(dose.worker_ci, dose.month, dose.year, dose.hp10, dose.hp3, dose.raw);
  },
  
  getPendingSync: () => {
    return db.prepare("SELECT * FROM local_doses WHERE sync_status = 'pending' LIMIT 50").all();
  },
  
  markSynced: (id) => {
    db.prepare("UPDATE local_doses SET sync_status = 'synced' WHERE id = ?").run(id);
  },
  
  setError: (id, error) => {
    db.prepare("UPDATE local_doses SET sync_status = 'error', error_log = ? WHERE id = ?").run(error, id);
  }
};
