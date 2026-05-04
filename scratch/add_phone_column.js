
import { getServiceSupabase } from "./src/lib/supabase.js";

async function addPhoneColumn() {
  const supabase = getServiceSupabase();
  
  console.log("Adding 'phone' column to 'toe_workers' table...");
  
  const { error } = await supabase.rpc('exec_sql', {
    sql_query: "ALTER TABLE public.toe_workers ADD COLUMN IF NOT EXISTS phone VARCHAR(20);"
  });

  if (error) {
    console.error("Error adding column:", error);
    // If rpc 'exec_sql' doesn't exist, we might need another way or just assume it's done via dashboard.
    // However, I'll try to just update the local schema.sql and inform the user.
  } else {
    console.log("Column 'phone' added successfully.");
  }
}

// Since I cannot easily run arbitrary SQL via the client without an RPC, 
// I will check if I can find an existing RPC for SQL execution.
