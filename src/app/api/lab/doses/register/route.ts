import { getServiceSupabase } from "@/lib/supabase";
import { getCurrentProfile } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const adminSupabase = getServiceSupabase();
  const { profile } = await getCurrentProfile();

  if (!profile || (profile.role !== "lab_admin" && profile.role !== "lab_tech" && profile.role !== "superadmin")) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  try {
    const data = await req.json();
    const { workerId, month, year, hp10, hp3, hp007, hp007_ext, hp10_neu } = data;

    // 1. Get worker and company info to ensure tenant isolation
    const { data: worker, error: wError } = await adminSupabase
      .from("toe_workers")
      .select("company_id, companies(tenant_id)")
      .eq("id", workerId)
      .single();

    if (wError || !worker) {
      return NextResponse.json({ message: "Trabajador no encontrado" }, { status: 404 });
    }

    if ((worker.companies as any).tenant_id !== profile.tenant_id && profile.role !== 'superadmin') {
      return NextResponse.json({ message: "Acceso denegado a esta entidad" }, { status: 403 });
    }

    // 2. Check if dose for this period already exists
    const { data: existingDose } = await adminSupabase
      .from("doses")
      .select("id")
      .eq("toe_worker_id", workerId)
      .eq("month", month)
      .eq("year", year)
      .single();

    if (existingDose) {
      return NextResponse.json({ message: "Ya existe una lectura para este periodo" }, { status: 400 });
    }

    // 3. Insert Dose
    const { error: insertError } = await adminSupabase
      .from("doses")
      .insert({
        toe_worker_id: workerId,
        month: parseInt(month),
        year: parseInt(year),
        periodo: `${month.toString().padStart(2, '0')}-${year}`,
        hp10,
        hp3,
        hp007,
        hp007_ext,
        hp10_neu,
        status: "approved" // Manual entry by lab is approved by default or needs validation?
        // Usually, manual lab entry is considered "official"
      });

    if (insertError) throw new Error(insertError.message);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
