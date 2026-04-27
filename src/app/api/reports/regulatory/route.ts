import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month");
  const year = searchParams.get("year");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("tenant_id")
    .eq("id", user.id)
    .single();

  if (!profile)
    return NextResponse.json({ error: "No profile" }, { status: 403 });

  // 1. Get all worker IDs for this tenant
  const { data: workers } = await supabase
    .from("toe_workers")
    .select("id")
    .eq("companies.tenant_id", profile.tenant_id);

  const workerIds = (workers || []).map(w => w.id);

  if (workerIds.length === 0) return NextResponse.json([]);

  // 2. Fetch doses for these workers
  const { data: doses, error } = await supabase
    .from("doses")
    .select(`
      *,
      toe_workers(
        ci, first_name, last_name,
        companies(
          name, tax_id, state, municipality, address,
          rep_first_name, rep_last_name, rep_ci, rep_phone, rep_email,
          tenants(name, rif, address, email)
        )
      )
    `)
    .in("toe_worker_id", workerIds)
    .eq("month", parseInt(month || "0"))
    .eq("year", parseInt(year || "0"));

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  if (!doses || doses.length === 0) return NextResponse.json([]);

  // 3. Get Life Dose history
  const cis = Array.from(new Set(doses.map((d) => d.toe_workers.ci)));
  const { data: lifeDoses } = await supabase
    .from("national_dose_history")
    .select("ci, total_hp10")
    .in("ci", cis);

  const lifeDoseMap = Object.fromEntries(
    lifeDoses?.map((ld) => [ld.ci, ld.total_hp10]) || [],
  );

  const formatted = doses.map((d) => ({
    // Lab Info
    lab_name: d.toe_workers?.companies?.tenants?.name || "N/A",
    lab_rif: d.toe_workers?.companies?.tenants?.rif || "N/A",

    // Company Info
    company_name: d.toe_workers?.companies?.name || "N/A",
    company_rif: d.toe_workers?.companies?.tax_id || "N/A",
    company_address: d.toe_workers?.companies ? `${d.toe_workers.companies.state || ""}, ${d.toe_workers.companies.address || ""}` : "N/A",

    // OSR Info
    osr_name: d.toe_workers?.companies ? `${d.toe_workers.companies.rep_first_name || ""} ${d.toe_workers.companies.rep_last_name || ""}` : "N/A",
    osr_ci: d.toe_workers?.companies?.rep_ci || "N/A",
    osr_phone: d.toe_workers?.companies?.rep_phone || "N/A",

    // TOE Info
    worker_ci: d.toe_workers?.ci || "N/A",
    worker_first_name: d.toe_workers?.first_name || "N/A",
    worker_last_name: d.toe_workers?.last_name || "N/A",

    // Monthly Report
    hp10: d.hp10,
    hp007: d.hp007,
    hp3: d.hp3,
    hp10_neu: d.hp10_neu,
    hp007_ext: d.hp007_ext,

    // Life Record
    life_record: lifeDoseMap[d.toe_workers?.ci] || d.hp10,

    observacion: d.observacion,
  }));

  return NextResponse.json(formatted);
}
