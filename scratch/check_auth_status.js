const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://gjdxaejbqibwemotyvto.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqZHhhZWpicWlid2Vtb3R5dnRvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjgyODU5MSwiZXhwIjoyMDkyNDA0NTkxfQ.YiclyRBpr3-wQGeVBLh4TIdUbWGwh9csd6h8nHIa2uw";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUserAuth() {
  const email = "jmorles.dea@gmail.com";
  const { data: users, error } = await supabase.auth.admin.listUsers();

  if (error) { console.error(error); return; }

  const user = users.users.find(u => u.email === email);
  if (user) {
    console.log("USER AUTH DATA:");
    console.log(JSON.stringify({
      id: user.id,
      email: user.email,
      last_sign_in_at: user.last_sign_in_at,
      confirmed_at: user.confirmed_at,
      invited_at: user.invited_at,
      user_metadata: user.user_metadata
    }, null, 2));
  } else {
    console.log("User not found in Auth.");
  }
}

checkUserAuth();
