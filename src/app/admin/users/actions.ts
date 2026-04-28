"use server";

import { getServiceSupabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function updateUserRole(userId: string, newRole: string) {
  const supabase = getServiceSupabase();

  const { error } = await supabase
    .from("profiles")
    .update({ role: newRole })
    .eq("id", userId);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/users");
  return { success: true };
}

export async function updateUserStatus(userId: string, newStatus: string) {
  const supabase = getServiceSupabase();

  const { error } = await supabase
    .from("profiles")
    .update({ status: newStatus })
    .eq("id", userId);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/users");
  return { success: true };
}

export async function updateAdminUser(
  userId: string,
  data: {
    email?: string;
    role?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
  },
) {
  const supabase = getServiceSupabase();

  try {
    // 1. Update Auth data if provided
    const authUpdates: any = {};
    if (data.email) authUpdates.email = data.email;
    if (data.password) authUpdates.password = data.password;

    if (Object.keys(authUpdates).length > 0) {
      const { error: authError } = await supabase.auth.admin.updateUserById(
        userId,
        authUpdates,
      );
      if (authError) return { success: false, error: authError.message };
    }

    // 2. Update Profile data
    const profileUpdates: any = {};
    if (data.role) profileUpdates.role = data.role;
    if (data.firstName) profileUpdates.first_name = data.firstName;
    if (data.lastName) profileUpdates.last_name = data.lastName;

    if (Object.keys(profileUpdates).length > 0) {
      const { error: profileError } = await supabase
        .from("profiles")
        .update(profileUpdates)
        .eq("id", userId);
      if (profileError) return { success: false, error: profileError.message };
    }

    revalidatePath("/admin/users");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Error desconocido" };
  }
}

export async function createAdminUser(data: {
  email: string;
  role: string;
  password?: string;
  firstName: string;
  lastName: string;
}) {
  const supabase = getServiceSupabase();

  try {
    // 1. Create Auth User
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: data.email,
        password: data.password || "Temp12345!", // Provide default temp password if none
        email_confirm: true,
        user_metadata: {
          first_name: data.firstName,
          last_name: data.lastName,
        },
      });

    if (authError) return { success: false, error: authError.message };
    if (!authData.user)
      return { success: false, error: "No se pudo crear el usuario" };

    // 2. Create Profile Data (usually triggers would do this, but we force it for admins)
    // We do an upsert in case a trigger already created it
    const { error: profileError } = await supabase.from("profiles").upsert({
      id: authData.user.id,
      role: data.role,
      first_name: data.firstName,
      last_name: data.lastName,
      status: "active",
    });

    if (profileError) return { success: false, error: profileError.message };

    revalidatePath("/admin/users");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Error al crear usuario" };
  }
}

export async function resetUserPassword(email: string) {
  const supabase = getServiceSupabase();

  const { error } = await supabase.auth.admin.generateLink({
    type: "recovery",
    email: email,
  });

  if (error) throw new Error(error.message);

  return { success: true };
}

export async function deleteUser(userId: string) {
  const supabase = getServiceSupabase();

  try {
    // Attempt to delete from Auth (this usually cascades to profiles)
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);

    // If auth throws an error (e.g. User not found), we STILL want to delete the ghost profile
    if (authError && authError.message !== "User not found") {
      return { success: false, error: authError.message };
    }

    // Force delete from profiles just in case cascade is not set up or it was a ghost profile
    const { error: profileError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (profileError) {
      console.error("Profile deletion error:", profileError);
    }

    revalidatePath("/admin/users");
    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Error al eliminar usuario",
    };
  }
}

export async function syncAllCompanyUsers() {
  const supabase = getServiceSupabase();

  try {
    // 1. Get all companies
    const { data: companies, error: cError } = await supabase
      .from("companies")
      .select("id, name, rep_email, rep_first_name, rep_last_name, tenant_id");

    if (cError) throw new Error(cError.message);

    // 2. Get all existing company_manager profiles
    const { data: profiles, error: pError } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("role", "company_manager");

    if (pError) throw new Error(pError.message);

    const managedCompanyIds = new Set(profiles.map(p => p.company_id));

    // 3. Filter companies that need a user
    const pendingCompanies = companies.filter(c => !managedCompanyIds.has(c.id) && c.rep_email);

    let created = 0;
    let errors = 0;

    // 4. Provision users (limit to avoid extreme overhead in one call)
    // We will do 50 at a time to prevent timeout
    const batch = pendingCompanies.slice(0, 50);

    for (const company of batch) {
      try {
        // Create Auth User
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: company.rep_email as string,
          password: "Portal" + company.rep_email?.split('@')[0].toUpperCase().substring(0, 3) + "2024!",
          email_confirm: true,
          user_metadata: {
            first_name: company.rep_first_name || "Manager",
            last_name: company.rep_last_name || company.name,
          }
        });

        if (authError) {
          console.error(`Error creating auth for ${company.name}:`, authError.message);
          errors++;
          continue;
        }

        if (authData.user) {
          // Create Profile
          const { error: profError } = await supabase.from("profiles").insert({
            id: authData.user.id,
            company_id: company.id,
            tenant_id: company.tenant_id,
            role: "company_manager",
            first_name: company.rep_first_name || "Manager",
            last_name: company.rep_last_name || company.name,
            status: "active"
          });

          if (profError) {
            console.error(`Error creating profile for ${company.name}:`, profError.message);
            errors++;
          } else {
            created++;
          }
        }
      } catch (err) {
        console.error(`Unexpected error for ${company.name}:`, err);
        errors++;
      }
    }

    revalidatePath("/admin/users");
    return { 
      success: true, 
      created, 
      errors, 
      remaining: pendingCompanies.length - batch.length 
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
