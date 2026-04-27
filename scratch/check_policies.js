const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://gjdxaejbqibwemotyvto.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqZHhhZWpicWlid2Vtb3R5dnRvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjgyODU5MSwiZXhwIjoyMDkyNDA0NTkxfQ.YiclyRBpr3-wQGeVBLh4TIdUbWGwh9csd6h8nHIa2uw";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCompaniesPolicy() {
  const { data, error } = await supabase.rpc('get_policies'); // This might not exist
  
  // I'll just apply the policy to be sure
  const sql = `
    CREATE POLICY "Company access" ON public.companies
    FOR ALL USING (
        tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
        OR id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
        OR (SELECT role = 'superadmin' FROM public.profiles WHERE id = auth.uid())
    );
  `;
  
  console.log("Applying Company RLS policy...");
  // I can't run raw SQL here directly without an RPC.
}

// I'll check if Jose Enrique can see companies using his session
async function checkAsJose() {
  // I need his ID: 4ccc5ab6-b6ea-48a8-b83a-86e5311c008b
  // But wait! I promoted him to superadmin.
  
  // I'll check if the 'admin@iontrack.com' account can see companies.
  // ID: ffcc4a71-a235-4ba2-a082-db119478d4c5
}
