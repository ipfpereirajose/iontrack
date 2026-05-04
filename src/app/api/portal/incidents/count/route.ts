import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ count: 0 });

  // Get profile to get company_id
  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .single();

  if (!profile?.company_id) return NextResponse.json({ count: 0 });

  const { count, error } = await supabase
    .from("incidents")
    .select("*", { count: "exact", head: true })
    .eq("company_id", profile.company_id)
    .eq("status", "open");

  if (error) return NextResponse.json({ count: 0 });

  return NextResponse.json({ count: count || 0 });
}
