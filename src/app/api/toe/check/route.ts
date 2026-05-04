import { getServiceSupabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ci = searchParams.get("ci");
  const birthYear = searchParams.get("birth_year");
  const birthDay = searchParams.get("day");
  const birthMonth = searchParams.get("month");

  const supabase = getServiceSupabase();

  // Clean CI (remove dots or spaces)
  const cleanCi = ci?.replace(/\D/g, "");
  
  // Create a fuzzy pattern for CI (e.g. 24370 -> %2%4%3%7%0%)
  // This allows matching V-24.370.632 or 24.370.632 or 24370632
  const fuzzyCi = cleanCi ? `%${cleanCi.split('').join('%')}%` : null;

  // Handle Month (could be number or name)
  const monthMap: Record<string, string> = {
    "ENERO": "01", "FEBRERO": "02", "MARZO": "03", "ABRIL": "04", "MAYO": "05", "JUNIO": "06",
    "JULIO": "07", "AGOSTO": "08", "SEPTIEMBRE": "09", "OCTUBRE": "10", "NOVIEMBRE": "11", "DICIEMBRE": "12",
    "1": "01", "2": "02", "3": "03", "4": "04", "5": "05", "6": "06", "7": "07", "8": "08", "9": "09", "10": "10", "11": "11", "12": "12"
  };

  const cleanMonth = birthMonth ? (monthMap[birthMonth.toUpperCase()] || birthMonth.padStart(2, '0')) : null;

  // 1. Verify credentials
  let workerQuery = supabase
    .from("toe_workers")
    .select("*, companies(*, tenants(name))");

  if (fuzzyCi) {
    workerQuery = workerQuery.ilike("ci", fuzzyCi);
  } else {
    workerQuery = workerQuery.eq("ci", ci);
  }
  
  if (birthYear && birthDay && cleanMonth) {
    const formattedDate = `${birthYear}-${cleanMonth}-${birthDay.padStart(2, '0')}`;
    // Intelligent fallback: Try full date first, if not found or if birth_date is null in DB, check birth_year
    workerQuery = workerQuery.or(`birth_date.eq.${formattedDate},and(birth_date.is.null,birth_year.eq.${birthYear})`);
  } else if (birthYear) {
    workerQuery = workerQuery.eq("birth_year", birthYear);
  }

  const { data: workers, error: workerError } = await workerQuery;

  if (workerError || !workers || workers.length === 0) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // 2. Get all doses for this CI (across all companies)
  const workerIdsFound = workers.map(w => w.id);
  
  const { data: allDoses } = await supabase
    .from("doses")
    .select(`
      *,
      toe_workers!inner(id, ci, company_id, companies(id, name, company_code, tax_id))
    `)
    .in("toe_worker_id", workerIdsFound)
    .eq("status", "approved")
    .order("year", { ascending: false })
    .order("month", { ascending: false });

  // 3. Get incidents for these workers
  const { data: allIncidents } = await supabase
    .from("incidents")
    .select("*")
    .in("toe_worker_id", workerIdsFound)
    .order("created_at", { ascending: false });

  // 4. Group data by company
  const accounts = workers.map(w => {
    const companyDoses = allDoses?.filter(d => d.toe_worker_id === w.id) || [];
    const companyIncidents = allIncidents?.filter(i => i.toe_worker_id === w.id) || [];
    const lifeDose = companyDoses.reduce((sum, d) => sum + Number(d.hp10), 0);
    
    return {
      worker: {
        id: w.id,
        first_name: w.first_name,
        last_name: w.last_name,
        ci: w.ci,
        sex: w.sex,
        birth_year: w.birth_year,
        birth_date: w.birth_date,
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
      incidents: companyIncidents,
      lifeDose
    };
  });

  return NextResponse.json({
    accounts,
    globalLifeDose: allDoses?.reduce((sum, d) => sum + Number(d.hp10), 0) || 0
  });
}
