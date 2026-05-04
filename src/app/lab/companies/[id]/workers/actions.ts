"use server";

import { createClient } from "@/utils/supabase/server";
import { getServiceSupabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";

export async function createWorker(companyId: string, formData: FormData) {
  try {
    // 1. Autenticación
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "No autenticado" };

    // 2. Permisos (Admin)
    const adminSupabase = getServiceSupabase();

    const { data: profile } = await adminSupabase
      .from("profiles")
      .select("tenant_id, role")
      .eq("id", user.id)
      .single();

    const { data: company } = await adminSupabase
      .from("companies")
      .select("tenant_id")
      .eq("id", companyId)
      .single();

    if (!profile || !company) {
      return { success: false, error: "No se pudo verificar la información de seguridad" };
    }

    if (profile.tenant_id !== company.tenant_id && profile.role !== "superadmin") {
      return { success: false, error: "No tienes permiso para agregar trabajadores a esta empresa" };
    }

    // 3. Extraer datos (Solo campos básicos confirmados en DB)
    const first_name = formData.get("first_name") as string;
    const last_name = formData.get("last_name") as string;
    const ci = formData.get("ci") as string;
    const position = (formData.get("position") as string) || null;
    const practice = (formData.get("practice") as string) || null;
    const sex = (formData.get("sex") as string) || null;

    const day = formData.get("birth_day") as string;
    const month = formData.get("birth_month") as string;
    const year = formData.get("birth_year") as string;
    
    let birth_date = null;
    if (day && month && year) {
      birth_date = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }

    // 4. Inserción (Omitimos email y phone por incompatibilidad de esquema)
    const { error } = await adminSupabase.from("toe_workers").insert([
      {
        first_name,
        last_name,
        ci,
        position,
        practice,
        sex,
        birth_date,
        company_id: companyId,
        status: "active",
        worker_code: null, 
      },
    ]);

    if (error) {
      console.error("DB Error:", error);
      if (error.code === "23505") {
        return { success: false, error: "Ya existe un trabajador con esta CI en esta empresa." };
      }
      return { success: false, error: `Error de base de datos: ${error.message}` };
    }

    // 5. Éxito
    revalidatePath(`/lab/companies/${companyId}/workers`);
    redirect(`/lab/companies/${companyId}/workers`);

  } catch (error: any) {
    if (isRedirectError(error)) throw error;
    console.error("Action Error:", error);
    return { success: false, error: error.message || "Error interno del servidor" };
  }
}
