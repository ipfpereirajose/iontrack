const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
  const [key, ...val] = line.split('=');
  if(key && val) acc[key.trim()] = val.join('=').trim().replace(/"/g, '');
  return acc;
}, {});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data, error } = await supabase.from('companies').select('id, name, tenant_id');
  console.log('Total companies:', data?.length);
  console.log('Sample company:', data ? data[0] : null);
  console.log('Error:', error);
}
run();
