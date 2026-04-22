const { createClient } = require('@supabase/supabase-js');
const db = require('./database');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function syncLoop() {
  console.log('[SYNC] Iniciando ciclo de sincronización...');
  
  const pending = db.getPendingSync();
  
  if (pending.length === 0) {
    console.log('[SYNC] No hay datos pendientes.');
    return;
  }

  console.log(`[SYNC] Intentando sincronizar ${pending.length} registros...`);

  for (const record of pending) {
    try {
      // 1. Get worker_id from CI in Supabase
      // Note: In production, we'd cache this or use a RPC
      const { data: worker, error: workerErr } = await supabase
        .from('toe_workers')
        .select('id')
        .eq('ci', record.worker_ci)
        .single();

      if (workerErr || !worker) {
        throw new Error(`Trabajador con CI ${record.worker_ci} no encontrado en la nube.`);
      }

      // 2. Insert into doses table
      const { error: insertErr } = await supabase
        .from('doses')
        .insert([{
          worker_id: worker.id,
          month: record.period_month,
          year: record.period_year,
          hp10: record.hp10,
          hp3: record.hp3,
          raw_data_json: { raw: record.raw_content, agent_id: process.env.AGENT_ID },
          sync_id: `local_${record.id}`
        }]);

      if (insertErr) throw insertErr;

      // 3. Mark as synced locally
      db.markSynced(record.id);
      console.log(`[SYNC] Registro ${record.id} sincronizado exitosamente.`);

    } catch (error) {
      console.error(`[SYNC] Error en registro ${record.id}:`, error.message);
      db.setError(record.id, error.message);
    }
  }
}

// Run every 30 seconds
setInterval(syncLoop, 30000);
syncLoop();
