const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Simple parser for .env.local
const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) env[key.trim()] = value.trim().replace(/^"|"$/g, '');
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testInsert() {
  console.log("Testing insert into toe_workers with birth_date...");
  
  const { data: company } = await supabase.from('companies').select('id').limit(1).single();
  if (!company) {
    console.error("No company found.");
    return;
  }

  const testWorker = {
    first_name: "Test",
    last_name: "Worker",
    ci: "V-TEST-" + Math.floor(Math.random() * 10000),
    sex: "M",
    birth_year: 1990,
    birth_date: "1990-05-15",
    position: "Radiólogo",
    practice: "Radiodiagnóstico Médico",
    worker_code: "TEST-" + Math.random().toString(36).substr(2, 5).toUpperCase(),
    company_id: company.id,
    status: "active"
  };

  const { data, error } = await supabase.from('toe_workers').insert(testWorker).select();

  if (error) {
    console.error("Error inserting worker:", error);
  } else {
    console.log("Worker inserted successfully:", data);
    await supabase.from('toe_workers').delete().eq('id', data[0].id);
    console.log("Test worker cleaned up.");
  }
}

testInsert();
