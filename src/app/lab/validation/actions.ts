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

  // Threshold Check (80% of 1.6mSv monthly limit = 1.28mSv)
  const THRESHOLD = 1.28;
  if (dose.hp10 >= THRESHOLD) {
    await supabase.from("notifications").insert([
      {
        tenant_id: profile.tenant_id,
        company_id: dose.toe_workers.company_id,
        type: "threshold_alert",
        message: `ALERTA CRÍTICA: El trabajador ha superado el 80% del límite mensual permitido (${dose.hp10} mSv).`,
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

  // Audit Log (Immutable record)
  await supabase.from("audit_logs").insert([
    {
      tenant_id: profile.tenant_id,
      user_id: profile.id,
      action: "APPROVE_DOSE",
      table_name: "doses",
      record_id: doseId,
      new_data: { status: "approved", value: dose.hp10 },
      justification: "Validación manual por Oficial de Seguridad",
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

    // 3. Handle notifications for this batch (Threshold check)
    const THRESHOLD = 1.28;
    const criticalDoses = batch.filter(d => d.hp10 >= THRESHOLD);
    if (criticalDoses.length > 0) {
      const notifications = criticalDoses.map((d: any) => {
        const worker = Array.isArray(d.toe_workers) ? d.toe_workers[0] : d.toe_workers;
        return {
          tenant_id: profile.tenant_id,
          company_id: worker?.company_id,
          type: "threshold_alert",
          message: `ALERTA: Dosis alta (${d.hp10} mSv) detectada en procesamiento por lotes.`,
        };
      }).filter((n: any) => n.company_id);

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
