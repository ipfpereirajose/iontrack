const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://gjdxaejbqibwemotyvto.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqZHhhZWpicWlid2Vtb3R5dnRvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjgyODU5MSwiZXhwIjoyMDkyNDA0NTkxfQ.YiclyRBpr3-wQGeVBLh4TIdUbWGwh9csd6h8nHIa2uw";

const supabase = createClient(supabaseUrl, supabaseKey);

async function resetPasswords() {
  const emails = ["jmorles.dea@gmail.com", "boletos@dionisio.com"];
  
  for (const email of emails) {
    const { data: user, error: findError } = await supabase.auth.admin.listUsers();
    const target = user.users.find(u => u.email === email);
    
    if (target) {
      const { error: updateError } = await supabase.auth.admin.updateUserById(target.id, {
        password: "S3guridad2026!"
      });
      if (updateError) console.error(`Error resetting ${email}:`, updateError);
      else console.log(`Password reset for ${email} to S3guridad2026!`);
    }
  }
}

resetPasswords();
