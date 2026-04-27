const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, 'agent_local.db');
const db = new Database(dbPath);

// Initialize Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS pending_doses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    worker_ci TEXT NOT NULL,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    hp10 REAL DEFAULT 0,
    hp3 REAL DEFAULT 0,
    hp007 REAL DEFAULT 0,
    raw_content TEXT,
    file_name TEXT,
    status TEXT DEFAULT 'pending',
    error_message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS config (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

module.exports = {
  saveDose: (data) => {
    const stmt = db.prepare(`
      INSERT INTO pending_doses (worker_ci, month, year, hp10, hp3, hp007, raw_content, file_name)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(data.worker_ci, data.month, data.year, data.hp10, data.hp3, data.hp007, data.raw, data.fileName);
  },

  getPending: () => {
    return db.prepare("SELECT * FROM pending_doses WHERE status = 'pending' LIMIT 100").all();
  },

  markSynced: (id) => {
    return db.prepare("UPDATE pending_doses SET status = 'synced' WHERE id = ?").run(id);
  },

  setError: (id, msg) => {
    return db.prepare("UPDATE pending_doses SET status = 'error', error_message = ? WHERE id = ?").run(msg, id);
  }
};
