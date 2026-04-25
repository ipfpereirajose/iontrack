const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
  const [key, ...val] = line.split('=');
  if(key && val) acc[key.trim()] = val.join('=').trim().replace(/"/g, '');
  return acc;
}, {});
// Use anon client like the frontend does, but we need auth token...
// Let's just run the query with service role to see if it's a relationship error.
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data, error } = await supabase
    .from('companies')
    .select('*, toe_workers(count)')
    .eq('tenant_id', '2d0ff092-b460-4c38-9e97-325e6d208052')
    .order('name', { ascending: true });
  console.log('Data length:', data?.length);
  console.log('Error:', error);
}
run();
