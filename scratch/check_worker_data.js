
import { getServiceSupabase } from "./src/lib/supabase.js";
import dotenv from "dotenv";
dotenv.config();

const adminSupabase = getServiceSupabase();

async function checkWorker() {
  const ci = "24370632";
  const { data: workers, error } = await adminSupabase
    .from("toe_workers")
    .select("*, companies(name)")
    .ilike("ci", `%${ci}%`);

  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Found Workers:", JSON.stringify(workers, null, 2));
  }
}

checkWorker();
