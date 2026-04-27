"use server";

import { getServiceSupabase } from "@/lib/supabase";

export async function fetchDoseChunk(workerIds: string[], year: number) {
  const adminSupabase = getServiceSupabase();
  const { data, error } = await adminSupabase
    .from("doses")
    .select("hp10, month, year, status, toe_worker_id")
    .in("toe_worker_id", workerIds)
    .eq("year", year)
    .in("status", ["approved", "pending"]);
    
  if (error) throw new Error(error.message);
  return data || [];
}
