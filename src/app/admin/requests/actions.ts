"use server";

import { getServiceSupabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function approveChangeAction(requestId: string) {
  const supabase = getServiceSupabase();

  // 1. Get the request
  const { data: req } = await supabase
    .from("change_requests")
    .select("*")
    .eq("id", requestId)
    .single();

  if (!req) throw new Error("Solicitud no encontrada");

  // 2. Update the tenant
  const { error: updateError } = await supabase
    .from("tenants")
    .update(req.new_data)
    .eq("id", req.tenant_id);

  if (updateError) throw updateError;

  // 3. Mark request as approved
  await supabase
    .from("change_requests")
    .update({ status: "approved" })
    .eq("id", requestId);

  // 4. Notify the laboratory
  const { data: labAdmins } = await supabase
    .from("profiles")
    .select("id")
    .eq("tenant_id", req.tenant_id)
    .eq("role", "lab_admin");

  if (labAdmins) {
    const notifications = labAdmins.map((admin) => ({
      user_id: admin.id,
      tenant_id: req.tenant_id,
      type: "system",
      message: "Su solicitud de actualización de datos ha sido APROBADA.",
    }));
    await supabase.from("notifications").insert(notifications);
  }

  revalidatePath("/admin/requests");
  revalidatePath("/lab/settings");
  return { success: true };
}

export async function rejectChangeAction(requestId: string, reason?: string) {
  const supabase = getServiceSupabase();

  const { data: req } = await supabase
    .from("change_requests")
    .select("*")
    .eq("id", requestId)
    .single();

  // Mark as rejected
  await supabase
    .from("change_requests")
    .update({
      status: "rejected",
      review_notes: reason,
    })
    .eq("id", requestId);

  // Notify the laboratory
  const { data: labAdmins } = await supabase
    .from("profiles")
    .select("id")
    .eq("tenant_id", req.tenant_id)
    .eq("role", "lab_admin");

  if (labAdmins) {
    const notifications = labAdmins.map((admin) => ({
      user_id: admin.id,
      tenant_id: req.tenant_id,
      type: "system",
      message: "Su solicitud de actualización de datos ha sido RECHAZADA.",
    }));
    await supabase.from("notifications").insert(notifications);
  }

  revalidatePath("/admin/requests");
  return { success: true };
}
