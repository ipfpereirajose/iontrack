const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
  console.log("Checking Incidents...");
  const { data: incidents, error: incError } = await supabase
    .from("incidents")
    .select("*, toe_workers(first_name, last_name), companies(name)");
    
  if (incError) console.error("Error incidents:", incError);
  else console.log("Incidents count:", incidents?.length);
  if (incidents) incidents.forEach(i => console.log(`ID: ${i.id}, Status: ${i.status}, Worker: ${i.toe_workers?.first_name}, Company: ${i.companies?.name}`));

  console.log("\nChecking High Doses (>= 1.328)...");
  const { data: doses, error: doseError } = await supabase
    .from("doses")
    .select("*, toe_workers(first_name, last_name, company_id, companies(name, tenant_id))")
    .gte("hp10", 1.328);

  if (doseError) console.error("Error doses:", doseError);
  else console.log("High doses count:", doses?.length);
  if (doses) doses.forEach(d => console.log(`ID: ${d.id}, HP10: ${d.hp10}, Status: ${d.status}, Tenant: ${d.toe_workers?.companies?.tenant_id}`));
}

inspect();
