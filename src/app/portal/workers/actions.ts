"use server";

import { createClient } from "@/utils/supabase/server";
import { getServiceSupabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import standards from "@/data/professional_standards.json";

export async function createPortalWorker(formData: FormData) {
  const supabase = await createClient();
  const adminSupabase = getServiceSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .single();

  if (!profile?.company_id) throw new Error("No tienes una empresa asignada");

  const first_name = formData.get("first_name") as string;
  const last_name = formData.get("last_name") as string;
  const ci = formData.get("ci") as string;
  const sex = formData.get("sex") as string;
  const birth_day = formData.get("birth_day") as string;
  const birth_month = formData.get("birth_month") as string;
  const birth_year = parseInt(formData.get("birth_year") as string);
  const birth_date = `${birth_year}-${birth_month.padStart(2, '0')}-${birth_day.padStart(2, '0')}`;
  const position = formData.get("position") as string;
  const practice = formData.get("practice") as string;
  const phone = formData.get("phone") as string;
  const worker_code = formData.get("worker_code") as string;

  // Validate against standards
  const isValidPosition = standards.cargos.includes(position);
  const isValidPractice = standards.practicas.includes(practice);
  if (!isValidPosition) throw new Error(`Cargo no válido: "${position}"`);
  if (!isValidPractice) throw new Error(`Práctica no válida: "${practice}"`);

  // Check for duplicate CI in same company
  const { data: existing } = await adminSupabase
    .from("toe_workers")
    .select("id")
    .eq("ci", ci)
    .eq("company_id", profile.company_id)
    .maybeSingle();

  if (existing)
    throw new Error(`Ya existe un TOE con CI "${ci}" en su empresa.`);

  const { error } = await adminSupabase.from("toe_workers").insert({
    first_name,
    last_name,
    ci,
    sex,
    birth_year,
    birth_date,
    position,
    practice,
    phone,
    worker_code,
    company_id: profile.company_id,
    status: "active",
  });

  if (error) throw new Error(error.message);

  revalidatePath("/portal/workers");
  redirect("/portal/workers");
}
