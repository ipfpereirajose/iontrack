"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function requestLabUpdateAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { data: profile } = await supabase
    .from("profiles")
    .select("tenant_id")
    .eq("id", user.id)
    .single();

  if (!profile) throw new Error("Perfil no encontrado");

  const newData = {
    name: formData.get("name"),
    rif: formData.get("rif"),
    address: formData.get("address"),
    state: formData.get("state"),
    municipality: formData.get("municipality"),
    parish: formData.get("parish"),
  };

  const { data: tenant } = await supabase
    .from("tenants")
    .select("*")
    .eq("id", profile.tenant_id)
    .single();

  const oldData = {
    name: tenant.name,
    rif: tenant.rif,
    address: tenant.address,
    state: tenant.state,
    municipality: tenant.municipality,
    parish: tenant.parish,
  };

  const { error } = await supabase.from("change_requests").insert({
    tenant_id: profile.tenant_id,
    requested_by: user.id,
    old_data: oldData,
    new_data: newData,
    status: "pending",
  });

  if (error) throw error;

  // Also create a notification for SuperAdmin
  const { data: superadmins } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "superadmin");

  if (superadmins) {
    const notifications = superadmins.map((sa) => ({
      user_id: sa.id,
      type: "system",
      message: `El laboratorio ${tenant.name} ha solicitado una actualización de datos.`,
    }));
    await supabase.from("notifications").insert(notifications);
  }

  revalidatePath("/lab/settings");
  return { success: true };
}

export async function updatePasswordAction(formData: FormData) {
  const supabase = await createClient();
  const password = formData.get("password") as string;
  const confirm = formData.get("confirm") as string;

  if (password !== confirm) return { error: "Las contraseñas no coinciden." };
  if (password.length < 6)
    return { error: "La contraseña debe tener al menos 6 caracteres." };

  const { error } = await supabase.auth.updateUser({ password });

  if (error) return { error: error.message };

  revalidatePath("/lab/settings");
  return { success: true };
}

export async function updateLabThemeAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { data: profile } = await supabase
    .from("profiles")
    .select("tenant_id, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "lab_admin") {
    throw new Error("No tiene permisos para cambiar la configuración.");
  }

  const logo_url = formData.get("logo_url") as string;
  const primary_color = formData.get("primary_color") as string;

  const { error } = await supabase
    .from("tenants")
    .update({
      logo_url: logo_url || null,
      config: { primary_color: primary_color || "#06b6d4" },
    })
    .eq("id", profile.tenant_id);

  if (error) throw error;

  revalidatePath("/lab");
  revalidatePath("/lab/settings");
  return { success: true };
}
