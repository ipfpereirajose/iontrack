const axios = require('axios');
const db = require('./database');
const os = require('os');
require('dotenv').config();

const API_URL = process.env.API_URL || 'https://iontrack.vercel.app/api/agent/sync';
const SECRET_KEY = process.env.SECRET_KEY;
const MACHINE_ID = os.hostname();

async function heartbeat() {
  if (!SECRET_KEY) return;
  try {
    await axios.post(API_URL, {
      secretKey: SECRET_KEY,
      action: 'heartbeat',
      data: { machineId: MACHINE_ID }
    });
    // console.log('[SYNC] Heartbeat enviado.');
  } catch (err) {
    console.error('[SYNC] Error de conexión:', err.message);
  }
}

async function syncData() {
  if (!SECRET_KEY) return;
  
  const pending = db.getPending();
  if (pending.length === 0) return;

  console.log(`[SYNC] Sincronizando ${pending.length} registros...`);

  try {
    const response = await axios.post(API_URL, {
      secretKey: SECRET_KEY,
      action: 'sync_doses',
      data: {
        doses: pending.map(p => ({
          worker_ci: p.worker_ci,
          month: p.month,
          year: p.year,
          hp10: p.hp10,
          hp3: p.hp3,
          hp007: p.hp007,
          raw: JSON.parse(p.raw_content),
          fileName: p.file_name
        }))
      }
    });

    if (response.data.success) {
      pending.forEach(p => db.markSynced(p.id));
      console.log(`[SYNC] ${response.data.synced} registros sincronizados con éxito.`);
    }
  } catch (err) {
    console.error('[SYNC] Error sincronizando:', err.response?.data?.error || err.message);
  }
}

// Loops
setInterval(heartbeat, 60000); // 1 minute heartbeat
setInterval(syncData, 10000);  // 10 seconds sync

heartbeat();
syncData();
