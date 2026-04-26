"use server";

import { createClient } from "@/utils/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createCompany(formData: FormData) {
  const supabase = await createClient();
  const { user, profile } = await getCurrentProfile();
  if (!user) throw new Error("No autenticado");
  if (!profile?.tenant_id) throw new Error("Usuario sin laboratorio asignado");

  // 1. Extract Entity Data
  const name = formData.get("name") as string;
  const entity_type = formData.get("entity_type") as string;
  const rif_type = formData.get("rif_type") as string;
  const rif_number = formData.get("rif_number") as string;
  const sector = formData.get("sector") as string;
  // Generate a random 6-character alphanumeric code for traceability
  const company_code =
    "EMP-" + Math.random().toString(36).substring(2, 8).toUpperCase();
  const osr_code = null; // Can be filled later during bulk import if needed

  // 2. Extract Location & Contact
  const state = formData.get("state") as string;
  const municipality = formData.get("municipality") as string;
  const parish = formData.get("parish") as string;
  const address = formData.get("address") as string;
  const company_email = formData.get("company_email") as string;
  const local_phone = formData.get("local_phone") as string;
  const mobile_phone = formData.get("mobile_phone") as string;

  // 3. Extract OSR Data
  const osr_first_name = formData.get("osr_first_name") as string;
  const osr_last_name = formData.get("osr_last_name") as string;
  const osr_nationality = formData.get("osr_nationality") as string;
  const osr_id_number = formData.get("osr_id_number") as string;
  const osr_phone = formData.get("osr_phone") as string;
  const osr_email = formData.get("osr_email") as string;

  // Combine RIF for the standard tax_id column
  const tax_id = `${rif_type}${rif_number}`;

  // Combine mobile phone for the standard contact_phone column
  const contact_phone = mobile_phone;

  // 4. Insert into database
  const { error } = await supabase.from("companies").insert([
    {
      tenant_id: profile.tenant_id,
      name,
      tax_id,
      address,
      contact_phone,
      entity_type,
      rif_type,
      rif_number,
      sector,
      state,
      municipality,
      parish,
      company_email,
      local_phone,
      mobile_phone,
      osr_first_name,
      osr_last_name,
      osr_nationality,
      osr_id_number,
      osr_phone,
      osr_email,
      company_code, // New traceability field
      osr_code, // New traceability field
    },
  ]);

  if (error) {
    console.error("Error creating company:", error);
    // If it's a column missing error, we provide a more helpful message
    if (
      error.message.includes("column") &&
      error.message.includes("not found")
    ) {
      throw new Error(
        'Error de esquema: Faltan columnas en la tabla "companies". Por favor ejecute la migración SQL necesaria.',
      );
    }
    throw new Error(error.message);
  }

  // 5. Revalidate and redirect
  revalidatePath("/lab/companies");
  redirect("/lab/companies");
}
