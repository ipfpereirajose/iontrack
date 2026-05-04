
import { getServiceSupabase } from "./src/lib/supabase.js";
import dotenv from "dotenv";
dotenv.config();

const adminSupabase = getServiceSupabase();
const tenantId = "b979a0e6-8152-4752-9447-380d60d3d526"; // Example tenant from logs if any, or just a dummy

async function testQuery() {
  const { data, error } = await adminSupabase
    .from("toe_workers")
    .select(`
      id,
      first_name,
      last_name,
      companies!inner(name, tenant_id)
    `)
    .eq("companies.tenant_id", tenantId)
    .limit(5);

  if (error) {
    console.error("Query Error:", error);
  } else {
    console.log("Query Result:", JSON.stringify(data, null, 2));
  }
}

testQuery();
