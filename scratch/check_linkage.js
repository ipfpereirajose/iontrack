
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
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkLinkage() {
  // 1. Get the tenant_id of the first company
  const { data: companies } = await supabase.from('companies').select('tenant_id').limit(1);
  const correctTenantId = companies[0]?.tenant_id;
  
  console.log('CORRECT_TENANT_ID:', correctTenantId);

  // 2. Check if January doses are linked to workers of this tenant
  const { data: doses, error } = await supabase
    .from('doses')
    .select('id, toe_workers!inner(companies!inner(tenant_id))')
    .eq('month', 1);

  if (error) {
    console.error('Error:', error);
    return;
  }

  const mismatched = doses.filter(d => d.toe_workers.companies.tenant_id !== correctTenantId);
  console.log('TOTAL_JAN_DOSES:', doses.length);
  console.log('MISMATCHED_TENANT:', mismatched.length);
  
  if (doses.length > 0) {
      console.log('First dose tenant_id:', doses[0].toe_workers.companies.tenant_id);
  }
}

checkLinkage();
