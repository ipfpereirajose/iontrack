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

  const { data: doses, error } = await supabase
    .from("doses")
    .select(
      `
      *,
      toe_workers!inner(
        ci, first_name, last_name,
        companies!inner(
          name, tax_id, state, municipality, address,
          rep_first_name, rep_last_name, rep_ci, rep_phone, rep_email,
          tenant_id,
          tenants(name, rif, address, email)
        )
      )
    `,
    )
    .eq("toe_workers.companies.tenant_id", profile.tenant_id)
    .eq("month", month)
    .eq("year", year);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  // Get Life Dose for each worker CI in the results
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
    lab_name: d.toe_workers.companies.tenants.name,
    lab_rif: d.toe_workers.companies.tenants.rif,

    // Company Info
    company_name: d.toe_workers.companies.name,
    company_rif: d.toe_workers.companies.tax_id,
    company_address: `${d.toe_workers.companies.state}, ${d.toe_workers.companies.address}`,

    // OSR Info
    osr_name: `${d.toe_workers.companies.rep_first_name} ${d.toe_workers.companies.rep_last_name}`,
    osr_ci: d.toe_workers.companies.rep_ci,
    osr_phone: d.toe_workers.companies.rep_phone,

    // TOE Info
    worker_ci: d.toe_workers.ci,
    worker_first_name: d.toe_workers.first_name,
    worker_last_name: d.toe_workers.last_name,

    // Monthly Report
    hp10: d.hp10,
    hp007: d.hp007,
    hp3: d.hp3,
    hp10_neu: d.hp10_neu,
    hp007_ext: d.hp007_ext,

    // Life Record
    life_record: lifeDoseMap[d.toe_workers.ci] || d.hp10,

    observacion: d.observacion,
  }));

  return NextResponse.json(formatted);
}
