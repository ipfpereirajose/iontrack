"use server";

import { createClient } from "@/utils/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function approveDose(doseId: string) {
  const supabase = getServiceSupabase();
  const { user, profile } = await getCurrentProfile();
  if (!user) throw new Error("No autenticado");
  if (!profile?.tenant_id) throw new Error("Usuario sin laboratorio asignado");

  // Fetch dose details and verify ownership
  const { data: dose } = await supabase
    .from("doses")
    .select("*, toe_workers!inner(company_id, companies!inner(tenant_id))")
    .eq("id", doseId)
    .single();

  if (!dose || dose.toe_workers.companies.tenant_id !== profile.tenant_id) {
    throw new Error("No tienes permiso para validar esta dosis");
  }

  // Threshold Check (Warning: 1.328mSv, Critical: 1.66mSv)
  const WARNING_THRESHOLD = 1.328;
  const CRITICAL_THRESHOLD = 1.66;
  
  if (dose.hp10 >= WARNING_THRESHOLD) {
    const severity = dose.hp10 >= CRITICAL_THRESHOLD ? "critical" : "warning";
    
    // Create formal Incident for investigation and justification
    await supabase.from("incidents").insert([
      {
        tenant_id: profile.tenant_id,
        company_id: dose.toe_workers.company_id,
        toe_worker_id: dose.toe_worker_id,
        dose_id: doseId,
        severity,
        status: "open"
      },
    ]);

    // Create Notification for immediate visibility
    await supabase.from("notifications").insert([
      {
        tenant_id: profile.tenant_id,
        company_id: dose.toe_workers.company_id,
        type: "threshold_alert",
        message: `${severity === "critical" ? "ALERTA CRÍTICA" : "ADVERTENCIA"}: Dosis de ${dose.hp10} mSv detectada. Se requiere investigación y justificación.`,
      },
    ]);
  }

  // Update Status
  const { error } = await supabase
    .from("doses")
    .update({
      status: "approved",
      approved_at: new Date().toISOString(),
    })
    .eq("id", doseId);

  if (error) throw new Error(error.message);

  // Audit Log (Lab internal record)
  await supabase.from("audit_logs").insert([
    {
      tenant_id: profile.tenant_id,
      user_id: profile.id,
      action: "APPROVE_DOSE",
      table_name: "doses",
      record_id: doseId,
      new_data: { status: "approved", value: dose.hp10 },
      justification: "Validación manual y apertura de incidencia si aplica",
    },
  ]);

  revalidatePath("/lab/validation");
}

export async function rejectDose(doseId: string) {
  const supabase = getServiceSupabase();
  const { user, profile } = await getCurrentProfile();
  if (!user) throw new Error("No autenticado");

  // Fetch dose and verify ownership
  const { data: dose } = await supabase
    .from("doses")
    .select("*, toe_workers!inner(companies!inner(tenant_id))")
    .eq("id", doseId)
    .single();

  if (!dose || dose.toe_workers.companies.tenant_id !== profile?.tenant_id) {
    throw new Error("No tienes permiso para rechazar esta dosis");
  }

  // Update Status
  const { error } = await supabase
    .from("doses")
    .update({ status: "rejected" })
    .eq("id", doseId);

  if (error) throw new Error(error.message);

  revalidatePath("/lab/validation");
}

import { getServiceSupabase } from "@/lib/supabase";

export async function approveBatch(month?: number, year?: number) {
  const supabase = getServiceSupabase();
  const { user, profile } = await getCurrentProfile();
  if (!user) throw new Error("No autenticado");
  if (!profile?.tenant_id) throw new Error("Usuario sin laboratorio asignado");

  const BATCH_SIZE = 100; // Micro-batch for safety

  try {
    // 1. Fetch next batch of 100 pending doses
    let query = supabase
      .from("doses")
      .select("id, hp10, toe_workers!inner(company_id, companies!inner(tenant_id))")
      .eq("status", "pending")
      .eq("toe_workers.companies.tenant_id", profile.tenant_id)
      .limit(BATCH_SIZE);

    if (month) query = query.eq("month", month);
    if (year) query = query.eq("year", year);

    const { data: batch, error: fetchError } = await query;
    if (fetchError) throw new Error(`Error al recuperar lote: ${fetchError.message}`);
    if (!batch || batch.length === 0) return { success: 0, remaining: 0 };

    const ids = batch.map(d => d.id);

    // 2. Approve this specific batch
    const { error: updateError } = await supabase
      .from("doses")
      .update({
        status: "approved",
        approved_at: new Date().toISOString(),
      })
      .in("id", ids);

    if (updateError) throw new Error(`Error al aprobar lote: ${updateError.message}`);

    // 3. Handle incidents and notifications for this batch (Threshold check)
    const WARNING_THRESHOLD = 1.328;
    const CRITICAL_THRESHOLD = 1.66;
    
    const highDoses = batch.filter(d => d.hp10 >= WARNING_THRESHOLD);
    
    if (highDoses.length > 0) {
      const incidents = highDoses.map((d: any) => {
        const worker = Array.isArray(d.toe_workers) ? d.toe_workers[0] : d.toe_workers;
        return {
          tenant_id: profile.tenant_id,
          company_id: worker?.company_id,
          toe_worker_id: d.toe_worker_id || worker?.id,
          dose_id: d.id,
          severity: d.hp10 >= CRITICAL_THRESHOLD ? "critical" : "warning",
          status: "open"
        };
      }).filter((i: any) => i.company_id);

      const notifications = highDoses.map((d: any) => {
        const worker = Array.isArray(d.toe_workers) ? d.toe_workers[0] : d.toe_workers;
        const severity = d.hp10 >= CRITICAL_THRESHOLD ? "CRÍTICA" : "ADVERTENCIA";
        return {
          tenant_id: profile.tenant_id,
          company_id: worker?.company_id,
          type: "threshold_alert",
          message: `ALERTA ${severity}: Dosis alta (${d.hp10} mSv) detectada en lote. Se requiere justificación.`,
        };
      }).filter((n: any) => n.company_id);

      if (incidents.length > 0) {
        await supabase.from("incidents").insert(incidents);
      }
      if (notifications.length > 0) {
        await supabase.from("notifications").insert(notifications);
      }
    }

    // 4. Audit Log for this batch
    await supabase.from("audit_logs").insert({
      tenant_id: profile.tenant_id,
      user_id: profile.id,
      action: "APPROVE_BATCH",
      table_name: "doses",
      new_data: { count: ids.length, ids_sample: ids.slice(0, 3) },
      justification: "Procesamiento por lotes automático",
    });

    return { success: ids.length, remaining: batch.length === BATCH_SIZE ? -1 : 0 }; // -1 indicates maybe more
  } catch (err: any) {
    console.error("Error in approveBatch:", err);
    throw err;
  }
}

export async function finishBulkApproval(month?: number, year?: number, totalCount?: number) {
  const { profile } = await getCurrentProfile();
  const supabase = getServiceSupabase();
  
  await supabase.from("audit_logs").insert({
    tenant_id: profile?.tenant_id,
    user_id: profile?.id,
    action: "FINISH_BULK_APPROVAL",
    table_name: "doses",
    new_data: { month, year, total_count: totalCount },
    justification: "Finalización de procesamiento masivo por lotes",
  });

  revalidatePath("/lab/validation");
}
