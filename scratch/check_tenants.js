const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://gjdxaejbqibwemotyvto.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqZHhhZWpicWlid2Vtb3R5dnRvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjgyODU5MSwiZXhwIjoyMDkyNDA0NTkxfQ.YiclyRBpr3-wQGeVBLh4TIdUbWGwh9csd6h8nHIa2uw";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTenants() {
  const { data, error } = await supabase
    .from('tenants')
    .select('name, rif, slug');

  if (error) { console.error(error); return; }

  console.log("Existing Tenants:");
  data.forEach(t => {
    console.log(`- NAME: ${t.name} | RIF: ${t.rif} | SLUG: ${t.slug}`);
  });
}

checkTenants();
