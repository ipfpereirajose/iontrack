/**
 * Helper to get the current user's profile bypassing RLS recursion.
 * Uses the service role key so it can read the profiles table without
 * triggering the infinite recursion policy error.
 */
import { getServiceSupabase } from "@/lib/supabase";
import { createClient } from "@/utils/supabase/server";

export async function getCurrentProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { user: null, profile: null };

  // Use service role to bypass the RLS recursion on profiles
  const adminSupabase = getServiceSupabase();
  const { data: profile, error } = await adminSupabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching profile:", error);
  }

  return { user, profile: profile || null };
}
