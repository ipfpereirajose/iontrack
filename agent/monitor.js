const express = require('express');
const path = require('path');
const db = require('./database');
const fs = require('fs');
require('dotenv').config();

const app = express();
const port = 4000;

app.use(express.static(path.join(__dirname, 'public')));

// API to get local status
app.get('/api/status', (req, res) => {
  try {
    const pendingCount = db.getPendingSync().length;
    
    // Check if we can reach Google/Supabase to determine "online" status
    // In a real app, we'd use a more robust check
    const isOnline = true; // This would be dynamic in production

    res.json({
      agent_id: process.env.AGENT_ID || 'DESCONOCIDO',
      is_online: isOnline,
      pending_records: pendingCount,
      last_sync: new Date().toISOString(), // Mock
      watch_path: path.resolve(process.env.WATCH_PATH || './input')
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`[MONITOR] Interfaz local activa en: http://localhost:${port}`);
});

module.exports = app;
