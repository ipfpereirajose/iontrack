import { getServiceSupabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ci = searchParams.get("ci");
    const birthYear = searchParams.get("birth_year");
    const birthDay = searchParams.get("day");
    const birthMonth = searchParams.get("month");

    if (!ci) {
      return NextResponse.json({ error: "CI is required" }, { status: 400 });
    }

    const supabase = getServiceSupabase();
    const cleanCi = ci?.replace(/\D/g, "");
    const fuzzyCi = cleanCi ? `%${cleanCi.split('').join('%')}%` : null;

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
      const formattedDate = `${birthYear}-${cleanMonth}-${(birthDay || "").padStart(2, '0')}`;
      workerQuery = workerQuery.or(`birth_date.eq.${formattedDate},birth_year.eq.${birthYear}`);
    } else if (birthYear) {
      workerQuery = workerQuery.eq("birth_year", birthYear);
    }

    const { data: workers, error: workerError } = await workerQuery;

    if (workerError) throw workerError;
    if (!workers || workers.length === 0) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // 2. Get all doses for this CI (across all companies)
    const workerIdsFound = workers.map(w => w.id);
    
    const { data: allDoses, error: dosesError } = await supabase
      .from("doses")
      .select("*")
      .in("toe_worker_id", workerIdsFound)
      .order("year", { ascending: false })
      .order("month", { ascending: false });

    if (dosesError) throw dosesError;

    // 3. Get incidents for these workers
    const { data: allIncidents, error: incidentsError } = await supabase
      .from("incidents")
      .select("*")
      .in("toe_worker_id", workerIdsFound)
      .order("created_at", { ascending: false });

    if (incidentsError) throw incidentsError;

    // 4. Group data by company
    const accounts = workers.map(w => {
      const companyData = Array.isArray(w.companies) ? w.companies[0] : w.companies;
      const companyDoses = allDoses?.filter(d => d.toe_worker_id === w.id) || [];
      const companyIncidents = allIncidents?.filter(i => i.toe_worker_id === w.id) || [];
      const lifeDose = companyDoses.reduce((sum, d) => sum + (Number(d.hp10) || 0), 0);
      
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
        company: companyData,
        history: companyDoses.map(d => ({
          id: d.id,
          month: d.month,
          year: d.year,
          hp10: Number(d.hp10) || 0,
          hp3: Number(d.hp3) || 0,
          hp007: Number(d.hp007) || 0,
        })),
        incidents: companyIncidents,
        lifeDose
      };
    });

    return NextResponse.json({
      accounts,
      globalLifeDose: allDoses?.reduce((sum, d) => sum + (Number(d.hp10) || 0), 0) || 0
    });
  } catch (error: any) {
    console.error("API Error in toe/check:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
