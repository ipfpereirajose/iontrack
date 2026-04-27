const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://gjdxaejbqibwemotyvto.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqZHhhZWpicWlid2Vtb3R5dnRvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjgyODU5MSwiZXhwIjoyMDkyNDA0NTkxfQ.YiclyRBpr3-wQGeVBLh4TIdUbWGwh9csd6h8nHIa2uw";

const supabase = createClient(supabaseUrl, supabaseKey);

async function promoteToSuperAdmin() {
  const { data, error } = await supabase
    .from('profiles')
    .update({ role: 'superadmin' })
    .eq('first_name', 'Jose Enrique')
    .eq('last_name', 'Pereira Morles')
    .select();

  if (error) {
    console.error('Error:', error);
    return;
  }

  if (data.length === 0) {
    console.log("No user found with that name!");
  } else {
    console.log(`Successfully promoted ${data[0].first_name} to superadmin!`);
  }
}

promoteToSuperAdmin();
