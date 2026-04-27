"use server";

import { getServiceSupabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function createCompanyUser(formData: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyId: string;
  tenantId: string;
}) {
  const adminSupabase = getServiceSupabase();

  // 1. Create user in Auth
  const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
    email: formData.email,
    password: formData.password,
    email_confirm: true,
    user_metadata: {
      role: 'company_manager',
      tenant_id: formData.tenantId,
      company_id: formData.companyId
    }
  });

  if (authError) {
    return { success: false, error: authError.message };
  }

  // 2. Create profile in Public
  const { error: profileError } = await adminSupabase
    .from("profiles")
    .insert({
      id: authData.user.id,
      tenant_id: formData.tenantId,
      company_id: formData.companyId,
      role: 'company_manager',
      first_name: formData.firstName,
      last_name: formData.lastName,
    });

  if (profileError) {
    // Cleanup auth user if profile fails
    await adminSupabase.auth.admin.deleteUser(authData.user.id);
    return { success: false, error: profileError.message };
  }

  revalidatePath("/lab/users");
  return { success: true };
}

export async function deleteCompanyUser(userId: string) {
  const adminSupabase = getServiceSupabase();
  
  // Auth deletion cascades to profile if FK set correctly, but we'll be safe
  const { error } = await adminSupabase.auth.admin.deleteUser(userId);
  
  if (error) return { success: false, error: error.message };
  
  revalidatePath("/lab/users");
  return { success: true };
}
