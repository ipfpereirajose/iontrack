"use server";

import { createClient } from "@/utils/supabase/server";
import { getServiceSupabase } from "@/lib/supabase";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createTenantAction(formData: FormData) {
  const supabase = await createClient();
  const adminSupabase = getServiceSupabase();

  // 1. Extract Data
  const rawData = {
    name: formData.get("name") as string,
    rif: formData.get("rif") as string,
    address: formData.get("address") as string,
    state: formData.get("state") as string,
    municipality: formData.get("municipality") as string,
    parish: formData.get("parish") as string,
    rep_first_name: formData.get("rep_first_name") as string,
    rep_last_name: formData.get("rep_last_name") as string,
    rep_ci: formData.get("rep_ci") as string,
    rep_phone: formData.get("rep_phone") as string,
    rep_email: formData.get("rep_email") as string,
    mobile_phone: formData.get("mobile_phone") as string,
    office_phone: formData.get("office_phone") as string,
    email: formData.get("email") as string,
  };

  // 2. Generate Slug
  const slug = rawData.name
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "");

  // 3. Create Tenant
  const { data: tenant, error: tenantError } = await adminSupabase
    .from("tenants")
    .insert([
      {
        ...rawData,
        slug,
        billing_status: "active",
      },
    ])
    .select()
    .single();

  if (tenantError) {
    console.error("Error creating tenant:", tenantError);
    return { 
      error: tenantError.code === "23505" 
        ? "Ya existe un laboratorio con ese RIF o nombre (slug duplicado)." 
        : `Error al crear el laboratorio: ${tenantError.message}` 
    };
  }

  // 4. Invite User via Supabase Auth Admin
  // Note: This requires the SERVICE_ROLE_KEY
  const { data: inviteData, error: inviteError } =
    await adminSupabase.auth.admin.inviteUserByEmail(rawData.email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://iontrack.vercel.app'}/auth/callback?next=/auth/reset-password`,
      data: {
        tenant_id: tenant.id,
        role: "lab_admin",
      },
    });

  if (inviteError) {
    console.error("Error inviting user:", inviteError);
    // Even if invite fails, the tenant was created. We might want to handle this.
    return {
      error:
        "Laboratorio creado, pero no se pudo enviar la invitación al correo.",
    };
  }

  // 5. Create Profile for the Invited User
  // The profile will be linked to the tenant
  const { error: profileError } = await adminSupabase.from("profiles").insert([
    {
      id: inviteData.user.id,
      tenant_id: tenant.id,
      role: "lab_admin",
      first_name: rawData.rep_first_name,
      last_name: rawData.rep_last_name,
      phone: rawData.mobile_phone,
    },
  ]);

  if (profileError) {
    console.error("Error creating profile:", profileError);
  }

  // 6. Log Audit Action
  await adminSupabase.from("audit_logs").insert({
    action: "CREATE_TENANT",
    new_data: tenant,
    justification: `Registro de nuevo laboratorio: ${tenant.name}`,
  });

  revalidatePath("/admin/tenants");
  redirect("/admin/tenants");
}

export async function resetTenantPasswordAction(email: string) {
  try {
    const adminSupabase = getServiceSupabase();

    // 1. Find the user first to make sure they exist
    const { data: userData, error: findError } =
      await adminSupabase.auth.admin.listUsers();

    if (findError) throw findError;

    const user = userData.users.find((u) => u.email === email);
    if (!user) {
      return { error: "No se encontró un usuario con ese correo electrónico." };
    }

    // 2. Send the reset email
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://iontrack.vercel.app";
    const { error: resetError } =
      await adminSupabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${siteUrl}/auth/callback?next=/auth/reset-password`,
      });

    if (resetError) {
      console.error("Error sending reset email:", resetError);
      return { error: resetError.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error("Critical error in resetTenantPasswordAction:", err);
    return { error: err.message || "Error inesperado al resetear contraseña." };
  }
}
