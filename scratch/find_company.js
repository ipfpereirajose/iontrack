const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://gjdxaejbqibwemotyvto.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqZHhhZWpicWlid2Vtb3R5dnRvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjgyODU5MSwiZXhwIjoyMDkyNDA0NTkxfQ.YiclyRBpr3-wQGeVBLh4TIdUbWGwh9csd6h8nHIa2uw";

const supabase = createClient(supabaseUrl, supabaseKey);

async function findCompanyByCode() {
  const code = "COM-ECZJR3";
  const { data, error } = await supabase
    .from('companies')
    .select('id, name, tenant_id')
    .eq('company_code', code)
    .single();

  if (error) { console.error(error); return; }

  console.log("COMPANY FOUND BY CODE COM-ECZJR3:");
  console.log(JSON.stringify(data, null, 2));
}

findCompanyByCode();
