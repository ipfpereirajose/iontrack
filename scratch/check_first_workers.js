const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://gjdxaejbqibwemotyvto.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqZHhhZWpicWlid2Vtb3R5dnRvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjgyODU5MSwiZXhwIjoyMDkyNDA0NTkxfQ.YiclyRBpr3-wQGeVBLh4TIdUbWGwh9csd6h8nHIa2uw";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkFirstWorkers() {
  const cis = ["20000001", "20000002", "20000003", "20000004", "20000005"];
  
  const { data, error } = await supabase
    .from('toe_workers')
    .select(`
      ci, first_name, last_name,
      companies (
        company_code, name
      )
    `)
    .in('ci', cis);

  if (error) { console.error(error); return; }

  console.log("FIRST WORKERS DATA:");
  console.log(JSON.stringify(data, null, 2));
}

checkFirstWorkers();
