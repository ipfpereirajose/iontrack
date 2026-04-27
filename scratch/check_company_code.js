const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://gjdxaejbqibwemotyvto.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqZHhhZWpicWlid2Vtb3R5dnRvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjgyODU5MSwiZXhwIjoyMDkyNDA0NTkxfQ.YiclyRBpr3-wQGeVBLh4TIdUbWGwh9csd6h8nHIa2uw";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCompanyCode() {
  const companyId = "933402b3-3d00-4f18-a5c1-885c821184eb";
  const { data, error } = await supabase
    .from('companies')
    .select('company_code, name')
    .eq('id', companyId)
    .single();

  if (error) { console.error(error); return; }

  console.log("COMPANY DATA:");
  console.log(JSON.stringify(data, null, 2));
}

checkCompanyCode();
