import { getServiceSupabase } from "./src/lib/supabase";

async function inspect() {
  const supabase = getServiceSupabase();
  
  console.log("Checking Incidents...");
  const { data: incidents, error: incError } = await supabase
    .from("incidents")
    .select("*, toe_workers(first_name, last_name), companies(name)");
    
  if (incError) console.error("Error incidents:", incError);
  else console.log("Incidents found:", incidents?.length, incidents);

  console.log("Checking High Doses...");
  const { data: doses, error: doseError } = await supabase
    .from("doses")
    .select("*, toe_workers(first_name, last_name, company_id, companies(name, tenant_id))")
    .gte("hp10", 1.328);

  if (doseError) console.error("Error doses:", doseError);
  else console.log("High doses found:", doses?.length, doses?.map(d => ({ id: d.id, hp10: d.hp10, status: d.status, tenant_id: d.toe_workers?.companies?.tenant_id })));
}

inspect();
