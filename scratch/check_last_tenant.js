const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://gjdxaejbqibwemotyvto.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqZHhhZWpicWlid2Vtb3R5dnRvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjgyODU5MSwiZXhwIjoyMDkyNDA0NTkxfQ.YiclyRBpr3-wQGeVBLh4TIdUbWGwh9csd6h8nHIa2uw";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLastTenant() {
  const { data: tenants, error: tenantError } = await supabase
    .from('tenants')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1);

  if (tenantError) { console.error(tenantError); return; }
  
  const tenant = tenants[0];
  console.log("LAST TENANT CREATED:");
  console.log(JSON.stringify(tenant, null, 2));

  if (tenant) {
    // Check profiles for this tenant
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('tenant_id', tenant.id);

    if (profileError) { console.error(profileError); return; }
    
    console.log("\nPROFILES FOR THIS TENANT:");
    console.log(JSON.stringify(profiles, null, 2));
  }
}

checkLastTenant();
