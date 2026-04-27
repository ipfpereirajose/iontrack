const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://gjdxaejbqibwemotyvto.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqZHhhZWpicWlid2Vtb3R5dnRvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjgyODU5MSwiZXhwIjoyMDkyNDA0NTkxfQ.YiclyRBpr3-wQGeVBLh4TIdUbWGwh9csd6h8nHIa2uw";

const supabase = createClient(supabaseUrl, supabaseKey);

async function countWorkers() {
  const tenantId = "ea6841ba-1bca-4833-aa1b-8237450512e0";
  
  // First get company IDs
  const { data: companies } = await supabase
    .from('companies')
    .select('id')
    .eq('tenant_id', tenantId);
    
  const companyIds = companies.map(c => c.id);

  const { count, error } = await supabase
    .from('toe_workers')
    .select('*', { count: 'exact', head: true })
    .in('company_id', companyIds);

  if (error) { console.error(error); return; }

  console.log(`Total workers for tenant: ${count}`);
}

countWorkers();
