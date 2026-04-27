const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://gjdxaejbqibwemotyvto.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqZHhhZWpicWlid2Vtb3R5dnRvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjgyODU5MSwiZXhwIjoyMDkyNDA0NTkxfQ.YiclyRBpr3-wQGeVBLh4TIdUbWGwh9csd6h8nHIa2uw";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTenants() {
  const { data, error } = await supabase
    .from('tenants')
    .select('*');

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log("Registered Tenants (Laboratories):");
  data.forEach(t => {
    console.log(`- ${t.name} (RIF: ${t.rif})`);
  });
}

checkTenants();
