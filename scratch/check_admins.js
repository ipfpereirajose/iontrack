const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://gjdxaejbqibwemotyvto.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqZHhhZWpicWlid2Vtb3R5dnRvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjgyODU5MSwiZXhwIjoyMDkyNDA0NTkxfQ.YiclyRBpr3-wQGeVBLh4TIdUbWGwh9csd6h8nHIa2uw";

const supabase = createClient(supabaseUrl, supabaseKey);

async function searchAdminName() {
  const { data, error } = await supabase
    .from('profiles')
    .select('role, first_name, last_name')
    .ilike('first_name', '%admin%');

  if (error) { console.error(error); return; }

  console.log("Profiles matching 'admin':");
  data.forEach(p => console.log(`- ${p.first_name} ${p.last_name} [${p.role}]`));
}

searchAdminName();
