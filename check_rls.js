const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
  const [key, ...val] = line.split('=');
  if(key && val) acc[key.trim()] = val.join('=').trim().replace(/"/g, '');
  return acc;
}, {});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data, error } = await supabase.from('companies').select('*');
  const { data: policies, error: pError } = await supabase.rpc('get_policies_for_table', { target_table: 'companies' });
  console.log('Error policies:', pError);
  console.log('Policies:', policies);
}
run();
