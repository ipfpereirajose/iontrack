import { getServiceSupabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ci = searchParams.get("ci");
  const birthYear = searchParams.get("birth_year");
  const birthDay = searchParams.get("day");
  const birthMonth = searchParams.get("month");

  const supabase = getServiceSupabase();

  // 1. Verify credentials (allow multiple worker records for the same CI)
  let workerQuery = supabase
    .from("toe_workers")
    .select("*, companies(*, tenants(name))")
    .eq("ci", ci);
  
  // If we have birth_date in DB, use it, otherwise use birth_year
  if (birthYear) {
    workerQuery = workerQuery.eq("birth_year", birthYear);
  }

  const { data: workers, error: workerError } = await workerQuery;

  if (workerError || !workers || workers.length === 0) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // 2. Get all doses for this CI (across all companies)
  const { data: allDoses } = await supabase
    .from("doses")
    .select(`
      *,
      toe_workers!inner(id, ci, company_id, companies(id, name, company_code, tax_id))
    `)
    .eq("toe_workers.ci", ci)
    .eq("status", "approved")
    .order("year", { ascending: false })
    .order("month", { ascending: false });

  // 3. Group data by company (ID Unico: CompanyID + CI)
  const accounts = workers.map(w => {
    const companyDoses = allDoses?.filter(d => d.toe_worker_id === w.id) || [];
    const lifeDose = companyDoses.reduce((sum, d) => sum + Number(d.hp10), 0);
    
    return {
      worker: {
        id: w.id,
        first_name: w.first_name,
        last_name: w.last_name,
        ci: w.ci,
        sex: w.sex,
        birth_year: w.birth_year,
        position: w.position,
      },
      company: w.companies,
      history: companyDoses.map(d => ({
        id: d.id,
        month: d.month,
        year: d.year,
        hp10: d.hp10,
        hp3: d.hp3,
        hp007: d.hp007,
      })),
      lifeDose
    };
  });

  return NextResponse.json({
    accounts,
    globalLifeDose: allDoses?.reduce((sum, d) => sum + Number(d.hp10), 0) || 0
  });
}
