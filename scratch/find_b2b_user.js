const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://gjdxaejbqibwemotyvto.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqZHhhZWpicWlid2Vtb3R5dnRvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjgyODU5MSwiZXhwIjoyMDkyNDA0NTkxfQ.YiclyRBpr3-wQGeVBLh4TIdUbWGwh9csd6h8nHIa2uw";

const supabase = createClient(supabaseUrl, supabaseKey);

async function findB2BUser() {
  const { data: users, error } = await supabase.auth.admin.listUsers();
  if (error) { console.error(error); return; }

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('role', 'company_manager')
    .limit(1);

  if (profiles && profiles.length > 0) {
      const user = users.users.find(u => u.id === profiles[0].id);
      console.log("B2B USER FOUND:");
      console.log(user ? user.email : "No email found");
  } else {
      console.log("No B2B user found.");
  }
}

findB2BUser();
