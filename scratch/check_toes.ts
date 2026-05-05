import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUserToes(email: string) {
  // 1. Get the profile
  const { data: profile, error: pError } = await supabase
    .from("profiles")
    .select("id, role, company_id")
    .eq("role", "toe")
    .single(); // This is just a guess, I need to find the specific user

  // Better: find user by email
  const { data: { users }, error: uError } = await supabase.auth.admin.listUsers();
  const targetUser = users.find(u => u.email === email);

  if (!targetUser) {
    console.log(`User ${email} not found`);
    return;
  }

  const { data: targetProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", targetUser.id)
    .single();

  console.log("Profile:", targetProfile);

  if (targetProfile?.role === "toe") {
    // If it's a TOE user, they see their own doses
    const { data: worker } = await supabase
        .from("toe_workers")
        .select("*, companies(name)")
        .eq("ci", targetUser.user_metadata?.ci || "")
        .single();
    console.log("TOE Worker:", worker);
  } else if (targetProfile?.role === "company_manager") {
    // If it's a manager, they see all TOEs in their company
    const { data: workers } = await supabase
        .from("toe_workers")
        .select("*, companies(name)")
        .eq("company_id", targetProfile.company_id);
    console.log("TOE Workers for Company:", workers?.length);
  }
}

checkUserToes("ipfpereirajose@gmail.com");
