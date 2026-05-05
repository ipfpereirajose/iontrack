import { getServiceSupabase } from "@/lib/supabase";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const company_id = searchParams.get("company_id");
  const month = parseInt(searchParams.get("month") || "0");
  const year = parseInt(searchParams.get("year") || "0");

  if (!company_id || !month || !year) {
    return NextResponse.json(
      { error: "Parámetros requeridos: company_id, month, year" },
      { status: 400 }
    );
  }

  // Auth check
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("tenant_id, role")
    .eq("id", user.id)
    .single();

  if (!profile) return NextResponse.json({ error: "No profile" }, { status: 403 });

  const adminSupabase = getServiceSupabase();

  // 1. Fetch company with tenant data
  const { data: company, error: companyError } = await adminSupabase
    .from("companies")
    .select(`
      id, name, tax_id, company_code, sector,
      departamento, tipo_radiacion, ubicacion_dosimetro, fecha_inicio_servicio,
      address, state, municipality, parish,
      rep_first_name, rep_last_name, rep_ci, rep_phone, rep_email, osr_nac,
      tenant_id,
      tenants(
        name, rif, logo_url,
        rep_first_name, rep_last_name, rep_title, rep_cargo, rep_ci,
        mpps_auth
      )
    `)
    .eq("id", company_id)
    .single();

  if (companyError || !company) {
    return NextResponse.json({ error: "Empresa no encontrada" }, { status: 404 });
  }

  // Security: lab can only access their own companies
  if (profile.role !== "superadmin" && company.tenant_id !== profile.tenant_id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 2. Fetch workers + their doses for this month/year
  const { data: workers } = await adminSupabase
    .from("toe_workers")
    .select(`
      id, ci, first_name, last_name, sex, birth_date, birth_year, position,
      doses!left(
        hp10, hp007, hp3, month, year, observacion, status
      )
    `)
    .eq("company_id", company_id)
    .order("last_name", { ascending: true });

  // 3. Fetch life dose totals (national_dose_history view)
  const cis = (workers || []).map((w) => w.ci);
  const { data: lifeDoses } = await adminSupabase
    .from("national_dose_history")
    .select("ci, total_hp10, total_hp007")
    .in("ci", cis);

  const lifeDoseMap: Record<string, { hp10: number; hp007: number }> = {};
  (lifeDoses || []).forEach((ld) => {
    lifeDoseMap[ld.ci] = {
      hp10: parseFloat(ld.total_hp10) || 0,
      hp007: parseFloat(ld.total_hp007) || 0,
    };
  });

  // 4. Fetch yearly totals per worker
  const { data: yearDoses } = await adminSupabase
    .from("doses")
    .select("toe_worker_id, hp10, hp007, month, year, status, toe_workers!inner(company_id)")
    .eq("toe_workers.company_id", company_id)
    .eq("year", year)
    .in("status", ["approved", "pending"]);

  const yearTotalsMap: Record<string, { hp10: number; hp007: number }> = {};
  (yearDoses || []).forEach((d) => {
    const wid = d.toe_worker_id;
    if (!yearTotalsMap[wid]) yearTotalsMap[wid] = { hp10: 0, hp007: 0 };
    yearTotalsMap[wid].hp10 += parseFloat(d.hp10) || 0;
    yearTotalsMap[wid].hp007 += parseFloat(d.hp007) || 0;
  });

  // 5. Build worker rows
  const DETECTION_LIMIT = 0.1; // mSv — below this = ND

  const workerRows = (workers || []).map((w, index) => {
    // Find this month's dose
    const monthDose = (w.doses || []).find(
      (d: any) => d.month === month && d.year === year && d.status !== "rejected"
    );

    const mesHp10 = monthDose ? parseFloat(monthDose.hp10) || 0 : null;
    const mesHp007 = monthDose ? parseFloat(monthDose.hp007) || 0 : null;
    const yearTotals = yearTotalsMap[w.id] || { hp10: 0, hp007: 0 };
    const life = lifeDoseMap[w.ci] || { hp10: 0, hp007: 0 };

    // Format birth date
    let birthDisplay = "";
    if (w.birth_date) {
      const d = new Date(w.birth_date);
      birthDisplay = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
    } else if (w.birth_year) {
      birthDisplay = String(w.birth_year);
    }

    const fmt = (val: number | null): string => {
      if (val === null) return "N/D"; // No dosimeter assigned this month
      if (val < DETECTION_LIMIT) return "ND";
      return val.toFixed(2);
    };

    return {
      num: index + 1,
      ci: w.ci,
      last_name: w.last_name,
      first_name: w.first_name,
      sex: w.sex || "",
      birth_date: birthDisplay,
      mes_hp007: monthDose ? fmt(mesHp007) : "N/D",
      mes_hp10: monthDose ? fmt(mesHp10) : "N/D",
      year_hp007: yearTotals.hp007 < DETECTION_LIMIT ? "ND" : yearTotals.hp007.toFixed(2),
      year_hp10: yearTotals.hp10 < DETECTION_LIMIT ? "ND" : yearTotals.hp10.toFixed(2),
      vida_hp007: life.hp007 < DETECTION_LIMIT ? "ND" : life.hp007.toFixed(2),
      vida_hp10: life.hp10 < DETECTION_LIMIT ? "ND" : life.hp10.toFixed(2),
      observacion: monthDose?.observacion || "",
    };
  });

  // 6. Build response
  const tenant = (company as any).tenants;

  return NextResponse.json({
    lab: {
      name: tenant?.name || "N/A",
      rif: tenant?.rif || "N/A",
      logo_url: tenant?.logo_url || null,
      rep_title: tenant?.rep_title || "Ing.",
      rep_first_name: tenant?.rep_first_name || "",
      rep_last_name: tenant?.rep_last_name || "",
      rep_cargo: tenant?.rep_cargo || "Director",
      mpps_auth: tenant?.mpps_auth || "",
    },
    company: {
      name: company.name,
      tax_id: company.tax_id,
      company_code: company.company_code,
      sector: company.sector,
      departamento: (company as any).departamento || "",
      tipo_radiacion: (company as any).tipo_radiacion || "",
      ubicacion_dosimetro: (company as any).ubicacion_dosimetro || "TORAX",
      fecha_inicio_servicio: (company as any).fecha_inicio_servicio || "",
      osr_name: `${company.rep_first_name || ""} ${company.rep_last_name || ""}`.trim(),
      osr_ci: `${company.osr_nac || "V"}-${company.rep_ci || ""}`,
    },
    month,
    year,
    workers: workerRows,
  });
}
