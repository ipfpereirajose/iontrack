const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://gjdxaejbqibwemotyvto.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqZHhhZWpicWlid2Vtb3R5dnRvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjgyODU5MSwiZXhwIjoyMDkyNDA0NTkxfQ.YiclyRBpr3-wQGeVBLh4TIdUbWGwh9csd6h8nHIa2uw";

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdminProfile() {
  const uid = "ffcc4a71-a235-4ba2-a082-db119478d4c5";
  
  const { data, error } = await supabase
    .from('profiles')
    .insert([
      { 
        id: uid, 
        role: 'superadmin', 
        first_name: 'Administrador', 
        last_name: 'Central'
      }
    ])
    .select();

  if (error) {
    console.error('Error creating profile:', error);
  } else {
    console.log("Successfully created Superadmin profile for admin@iontrack.com!");
    console.log(JSON.stringify(data, null, 2));
  }
}

createAdminProfile();
