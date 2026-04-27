const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://gjdxaejbqibwemotyvto.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqZHhhZWpicWlid2Vtb3R5dnRvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjgyODU5MSwiZXhwIjoyMDkyNDA0NTkxfQ.YiclyRBpr3-wQGeVBLh4TIdUbWGwh9csd6h8nHIa2uw";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  const month = 4;
  const year = 2026;

  // Total in Doses
  const { count: totalDoses, error: err1 } = await supabase
    .from('doses')
    .select('*', { count: 'exact', head: true })
    .eq('month', month)
    .eq('year', year);

  // Total Approved
  const { count: approvedDoses, error: err2 } = await supabase
    .from('doses')
    .select('*', { count: 'exact', head: true })
    .eq('month', month)
    .eq('year', year)
    .eq('status', 'approved');

  if (err1 || err2) {
    console.error('Error:', err1 || err2);
    return;
  }

  console.log(`Summary for ${month}/${year}:`);
  console.log(`- Total doses in table: ${totalDoses}`);
  console.log(`- Total APPROVED doses: ${approvedDoses}`);
}

checkData();
