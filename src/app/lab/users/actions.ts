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

export async function syncCompanyAccounts(tenantId: string) {
  const adminSupabase = getServiceSupabase();
  const DEFAULT_PASSWORD = "password123!";

  // 1. Get all companies for this tenant
  const { data: companies, error: companiesError } = await adminSupabase
    .from("companies")
    .select("id, name, email")
    .eq("tenant_id", tenantId);

  if (companiesError) return { success: false, error: companiesError.message };

  // 2. Get existing profiles to avoid duplicates
  const { data: existingProfiles } = await adminSupabase
    .from("profiles")
    .select("company_id")
    .eq("tenant_id", tenantId)
    .eq("role", "company_manager");

  const existingCompanyIds = new Set(existingProfiles?.map(p => p.company_id) || []);
  
  // 3. Filter companies that need an account (have email and no profile)
  const pendingCompanies = (companies || []).filter(c => 
    c.email && !existingCompanyIds.has(c.id)
  );

  if (pendingCompanies.length === 0) return { success: true, count: 0 };

  // 4. Process in chunks of 50
  const chunkSize = 50;
  let createdCount = 0;

  for (let i = 0; i < pendingCompanies.length; i += chunkSize) {
    const chunk = pendingCompanies.slice(i, i + chunkSize);
    
    await Promise.all(chunk.map(async (company) => {
      // a. Create auth user
      const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
        email: company.email!,
        password: DEFAULT_PASSWORD,
        email_confirm: true,
        user_metadata: {
          role: 'company_manager',
          tenant_id: tenantId,
          company_id: company.id
        }
      });

      if (!authError && authData.user) {
        // b. Create profile
        const { error: profileError } = await adminSupabase
          .from("profiles")
          .insert({
            id: authData.user.id,
            tenant_id: tenantId,
            company_id: company.id,
            role: 'company_manager',
            first_name: "Gestor",
            last_name: company.name,
          });
        
        if (!profileError) createdCount++;
      }
    }));
  }

  revalidatePath("/lab/users");
  return { success: true, count: createdCount };
}

export async function deleteCompanyUser(userId: string) {
  const adminSupabase = getServiceSupabase();
  
  // Auth deletion cascades to profile if FK set correctly, but we'll be safe
  const { error } = await adminSupabase.auth.admin.deleteUser(userId);
  
  if (error) return { success: false, error: error.message };
  
  revalidatePath("/lab/users");
  return { success: true };
}
