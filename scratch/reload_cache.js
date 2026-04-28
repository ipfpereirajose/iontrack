const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) env[key.trim()] = value.trim().replace(/^"|"$/g, '');
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function reloadCache() {
  console.log("Attempting to reload PostgREST schema cache...");
  
  // We can try to run a simple SQL if we have the capability, 
  // but Supabase JS doesn't have a direct 'run SQL' method for security reasons.
  // However, we can trigger a reload by just waiting or sometimes by 
  // making a request to the admin API if we had it.
  
  // Actually, I'll just tell the user to click 'Reload Schema' in Supabase Dashboard 
  // or I'll try to use a trick: sometimes modifying a comment on the table triggers it.
  
  const { error } = await supabase.rpc('reload_schema_if_exists'); 
  // This is a long shot, unless they have this RPC.

  if (error) {
    console.log("RPC reload_schema_if_exists failed (expected if not defined).");
  }

  console.log("Checking if column is visible now...");
  const { data: cols, error: colError } = await supabase.from('toe_workers').select('*').limit(1);
  console.log("Result:", cols ? "Visible" : "Not Visible", colError);
}

reloadCache();
