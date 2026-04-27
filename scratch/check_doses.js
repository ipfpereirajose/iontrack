
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

function getEnv(key) {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return null;
  const content = fs.readFileSync(envPath, 'utf8');
  const lines = content.split('\n');
  for (const line of lines) {
    if (line.startsWith(`${key}=`)) {
      return line.split('=')[1].trim().replace(/^["']|["']$/g, '');
    }
  }
  return null;
}

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const supabaseServiceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkJanDoses() {
  const { data, error } = await supabase
    .from('doses')
    .select('id, month, year, status, hp10, toe_worker_id')
    .eq('month', 1);

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('JAN_DOSES_FOUND:', data.length);
    if (data.length > 0) {
        console.log('Sample Data:');
        console.log(JSON.stringify(data.slice(0, 5), null, 2));
    }
  }
}

checkJanDoses();
